import os

import boto3
from urllib.parse import urlparse

dynamodb = boto3.client('dynamodb', region_name=os.environ['TABLE_REGION'])
table_name = os.environ['TABLE_NAME']


def is_protocol_specified(x):
    try:
        result = urlparse(x)
        return result.scheme != ''
    except:
        return False


def lambda_handler(event, context):
    result = dynamodb.get_item(
        TableName=table_name,
        Key={'blob': {'S': event['pathParameters']['proxy']}},
        ProjectionExpression='key2')
    url = result['Item']['key2']['S']
    if not is_protocol_specified(url):
        url = 'https://' + url
    return {
        'statusCode': 301,
        'headers': {
            'Location': url,
        }
    }
