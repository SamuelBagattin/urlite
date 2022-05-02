import json
import os

import boto3

dynamodb = boto3.client('dynamodb', region_name=os.environ['TABLE_REGION'])
table_name = os.environ['TABLE_NAME']


def lambda_handler(event, context):
    result = dynamodb.get_item(
        TableName=table_name,
        Key={'blob': {'S': event['pathParameters']['proxy']}},
        ProjectionExpression='key2')
    return {
        'statusCode': 301,
        'headers': {
            'Location': result['Item']['key2']['S'],
        }
    }
