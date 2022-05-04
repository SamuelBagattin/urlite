import json
import random
import boto3
import string
import os
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
    blob = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    try:
        url = json.loads(event['body'])['url']
    except ValueError:
        response = {'message': 'body is not a valid json'}
        return {
            'statusCode': 400,
            'body': json.dumps(response)
        }
    except KeyError:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'body does not contain \'url\' property'})
        }

    if not is_protocol_specified(url):
        url = 'https://' + url

    dynamodb.put_item(TableName=table_name, Item={'blob': {'S': blob}, 'key2': {'S': url}})
    return {
        'statusCode': 200,
        'body': json.dumps(
            {
                'shortUrl': os.getenv('baseUrl') + blob,
                'totalUrls': dynamodb.describe_table(TableName='short_urls')['Table']['ItemCount']
            }
        )
    }
