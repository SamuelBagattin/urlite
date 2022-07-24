import os
from typing import Dict

import boto3
from urllib.parse import urlparse
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.utilities import parameters
from aws_lambda_powertools.utilities.typing import LambdaContext

dynamodb = boto3.client('dynamodb', region_name=os.environ['TABLE_REGION'])
table_name = os.environ['TABLE_NAME']

dynamodb_provider = parameters.DynamoDBProvider(table_name=table_name,
                                                key_attr="blob",
                                                value_attr="key2",
                                                boto3_session=boto3.Session(region_name=os.environ['TABLE_REGION']))

tracer = Tracer()
logger = Logger()


def is_protocol_specified(x):
    try:
        result = urlparse(x)
        return result.scheme != ''
    except:
        return False


@tracer.capture_lambda_handler
@logger.inject_lambda_context(log_event=True)
def handler(event: Dict[str, any], context: LambdaContext):
    url = dynamodb_provider.get(event['pathParameters']['proxy'])
    if not is_protocol_specified(url):
        url = 'https://' + url
    return {
        'statusCode': 301,
        'headers': {
            'Location': url,
        }
    }
