import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambda_python from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import {
	aws_apigateway,
	aws_certificatemanager,
	aws_cloudfront,
	aws_cloudfront_origins,
	aws_iam, aws_logs,
	aws_route53,
	aws_route53_targets,
	aws_s3,
	aws_s3_deployment
} from 'aws-cdk-lib';
import * as path from 'path';
import {Effect, PolicyDocument} from "aws-cdk-lib/aws-iam";
import {OriginProtocolPolicy, ViewerProtocolPolicy} from "aws-cdk-lib/aws-cloudfront";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Architecture} from "aws-cdk-lib/aws-lambda";

interface UrlliteStackProps extends cdk.StackProps {
	urliteCertificateArn: string;
	hostedZoneId: string;
}

export class UrlliteStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: UrlliteStackProps) {
		super(scope, id, props);
		const tableRegion = 'eu-west-3';
		const tableName = 'short_urls';
		const tableArn = `arn:aws:dynamodb:${tableRegion}:${this.account}:table/${tableName}`

		const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
			this,
			"lambda-powertools",
			`arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:24`
		)

		const redirectLambda = new lambda_python.PythonFunction(this, 'urlite-redirection-lambda', {
			runtime: lambda.Runtime.PYTHON_3_9,
			entry: "../src/redirect_short_url",
			environment: {
				TABLE_NAME: tableName,
				TABLE_REGION: tableRegion,
				POWERTOOLS_SERVICE_NAME: 'urlite-redirector',
				LOG_LEVEL: 'INFO'
			},
			layers: [powertoolsLayer],
			tracing: lambda.Tracing.ACTIVE,
			role: new aws_iam.Role(this, 'urlite-redirection-lambda-role', {
				assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
				inlinePolicies: {
					"urlite-access": new PolicyDocument({
						statements: [
							new aws_iam.PolicyStatement({
								actions: ['dynamodb:GetItem'],
								effect: Effect.ALLOW,
								resources: [tableArn],
							})
						]
					}),
				},
				managedPolicies: [
					aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
					aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
				],
			}),
			logRetention: RetentionDays.TWO_WEEKS,
			architecture: Architecture.ARM_64,
		});

		const createUrlLambda = new lambda_python.PythonFunction(this, 'urlite-createurl-lambda', {
			entry: "../src/create_short_url",
			runtime: lambda.Runtime.PYTHON_3_9,
			environment: {
				TABLE_NAME: tableName,
				TABLE_REGION: tableRegion,
				baseUrl: 'https://urlite.samuelbagattin.com/',
				POWERTOOLS_SERVICE_NAME: 'urlite-creator',
				LOG_LEVEL: 'INFO'
			},
			layers: [powertoolsLayer],
			tracing: lambda.Tracing.ACTIVE,
			role: new aws_iam.Role(this, 'urlite-createUrl-lambda-role', {
				assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
				inlinePolicies: {
					"urlite-access": new PolicyDocument({
						statements: [
							new aws_iam.PolicyStatement({
								actions: ['dynamodb:PutItem', 'dynamodb:DescribeTable'],
								effect: Effect.ALLOW,
								resources: [tableArn],
							})
						]
					}),
				},
				managedPolicies: [
					aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
					aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
				],
			}),
			logRetention: RetentionDays.TWO_WEEKS,
			architecture: Architecture.ARM_64,

		});


		const api = new apigateway.RestApi(this, 'urlite-api', {
			restApiName: 'urlite',
			description: 'urlite',
			endpointTypes: [apigateway.EndpointType.REGIONAL],
			deployOptions: {
				dataTraceEnabled: true,
				loggingLevel: apigateway.MethodLoggingLevel.INFO,
				tracingEnabled: true,
			}
		});

		const urlsBaseResource = api.root.addResource("urls");
		urlsBaseResource.addResource("{proxy}").addMethod('GET', new apigateway.LambdaIntegration(redirectLambda), {apiKeyRequired: true});
		urlsBaseResource.addMethod('POST', new apigateway.LambdaIntegration(createUrlLambda), {apiKeyRequired: true});

		const apiKeyValue = 'xV7lvur40E23uzU9123bw7moIRj01whhaEgzHsdD'
		new aws_apigateway.RateLimitedApiKey(this, 'urlite-api-key-rate-limited', {
			apiKeyName: 'urlite-api-key-rate-limited',
			enabled: true,
			generateDistinctId: true,
			throttle: {
				rateLimit: 10,
				burstLimit: 50
			},
			value: apiKeyValue,
			resources: [api],
			apiStages: [{
				api: api,
				stage: api.deploymentStage,
			}]
		})


		const apigatewayUrl = `${api.restApiId}.execute-api.${this.region}.amazonaws.com`

		const oai = new aws_cloudfront.OriginAccessIdentity(this, 'urlite-website-oai', {
			comment: 'urlite-website-oai',
		});

		// Create s3 bucket
		const bucket = new aws_s3.Bucket(this, 'urlite-website-bucket', {
			bucketName: 'urlite-website-bucket',
			publicReadAccess: false,
		});

		bucket.grantRead(oai);

		const distribution = new aws_cloudfront.Distribution(this, 'urlite-distribution', {
			defaultBehavior: {
				origin: new aws_cloudfront_origins.HttpOrigin(apigatewayUrl, {
					originPath: '/prod/urls',
					customHeaders: {
						'X-API-Key': apiKeyValue,
					},
					protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
				}),
				viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
			certificate: aws_certificatemanager.Certificate.fromCertificateArn(this, 'urlite-certificate', props.urliteCertificateArn),
			domainNames: ["urlite.samuelbagattin.com"],
			defaultRootObject: 'index.html',
		});
		distribution.addBehavior('/urls', new aws_cloudfront_origins.HttpOrigin(apigatewayUrl, {
			originPath: '/prod',
			customHeaders: {
				'X-API-Key': apiKeyValue,
			},
			protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
		}), {
			allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
			viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			cachedMethods: aws_cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
		})

		new aws_s3_deployment.BucketDeployment(this, 'urlite-website-deployment', {
			distribution: distribution,
			destinationBucket: bucket,
			distributionPaths: ['/', '/*.html', '/*.js', '/*.css', '/*.png', '/*.jpg', '/*.svg', '/*.ico'],
			sources: [
				aws_s3_deployment.Source.asset(path.join(__dirname, '../../src/website/dist'))
			],
		});

		distribution.addBehavior("/*.*", new aws_cloudfront_origins.S3Origin(bucket, {
			originAccessIdentity: oai,
		}), {viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS})

		const hostedZone = aws_route53.HostedZone.fromHostedZoneAttributes(this, 'urlite-hosted-zone', {
			zoneName: 'samuelbagattin.com',
			hostedZoneId: props.hostedZoneId,
		});
		new aws_route53.AaaaRecord(this, 'urlite.samuelbagattin.com', {
			zone: hostedZone,
			target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution)),
			recordName: 'urlite.samuelbagattin.com',
		});

		new aws_route53.ARecord(this, 'urlite.samuelbagattin.com_ipv4', {
			zone: hostedZone,
			target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution)),
			recordName: 'urlite.samuelbagattin.com',
		});

	}
}