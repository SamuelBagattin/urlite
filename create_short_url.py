import json
import random
import boto3
import string
import os

dynamodb = boto3.client('dynamodb')


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

    dynamodb.put_item(TableName='short_urls', Item={'blob': {'S': blob}, 'key2': {'S': url}})
    return {
        'statusCode': 200,
        'body': json.dumps(
            {
                'shortUrl': os.getenv('baseUrl') + blob,
                'totalUrls': dynamodb.describe_table(TableName='short_urls')['Table']['ItemCount']
            }
        )
    }
