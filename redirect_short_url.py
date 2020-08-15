import json
import boto3

dynamodb = boto3.client('dynamodb')


def lambda_handler(event, context):
    result = dynamodb.get_item(
        TableName='short_urls',
        Key={'blob': {'S': event['pathParameters']['proxy']}},
        ProjectionExpression='key2')
    return {
        'statusCode': 301,
        'headers': {
            'Location': result['Item']['key2']['S'],
        }
    };
