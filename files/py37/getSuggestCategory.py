import boto3
import json
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
import requests

session = boto3.Session()
credentials = session.get_credentials()
creds = credentials.get_frozen_credentials()

region = "ap-northeast-1"
service = "es"

host = "https://search-cospacreation-owjqksucsg3bqlk5wkyukd5siu.ap-northeast-1.es.amazonaws.com"
index = "test-products-schema"
url = host + "/" + index + "/_search"


def signed_request(method, url, data=None, params=None, headers=None):
    request = AWSRequest(
        method=method, url=url, data=data, params=params, headers=headers
    )
    SigV4Auth(creds, service, region).add_auth(request)
    return requests.request(
        method=method, url=url, headers=dict(request.headers), data=data
    )


def lambda_handler(event, context):
    query = {
        "size": 0,
        "query": {
            "bool": {
                "should": [
                    {"match": {"category.suggest": {"query": event['queryStringParameters']['q']}}},
                    {
                        "match": {
                            "category.readingform": {
                                "query": event['queryStringParameters']['q'],
                                "fuzziness": "AUTO",
                                "operator": "and",
                            }
                        }
                    },
                ]
            }
        },
        "aggs": {
            "keywords": {
                "terms": {"field": "category", "order": {"_count": "desc"}, "size": "10"}
            }
        },
    }

    headers = {"Content-Type": "application/json"}

    r = signed_request(method="GET", url=url, data=json.dumps(query), headers=headers)

    response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        
        },
        "isBase64Encoded": False,
    }

    response["body"] = r.text
    return response
