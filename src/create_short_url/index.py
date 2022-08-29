import asyncio
import json
import random

from aws_xray_sdk.ext import aiohttp
from boto3 import client
import os
import string
from urllib.parse import urlparse
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent, event_source
from aws_lambda_powertools.utilities.typing import LambdaContext

dynamodb = client('dynamodb', region_name=os.environ['TABLE_REGION'])
table_name = os.environ['TABLE_NAME']

tracer = Tracer()
logger = Logger()

base_url = os.getenv('baseUrl')


def is_protocol_specified(x):
    try:
        result = urlparse(x)
        return result.scheme != ''
    except:
        return False


@tracer.capture_lambda_handler
@logger.inject_lambda_context(log_event=True)
@event_source(data_class=APIGatewayProxyEvent)
def handler(event: APIGatewayProxyEvent, context: LambdaContext):
    blob = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    try:
        url = json.loads(event.body)['url']
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
                'shortUrl': base_url + blob,
                'totalUrls': dynamodb.describe_table(TableName='short_urls')['Table']['ItemCount']
            }
        )
    }
