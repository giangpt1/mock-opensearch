import boto3
import json
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
import requests

session = boto3.Session()
credentials = session.get_credentials()
creds = credentials.get_frozen_credentials()

region = 'ap-northeast-1'
service = 'es'

host = 'https://search-cospacreation-owjqksucsg3bqlk5wkyukd5siu.ap-northeast-1.es.amazonaws.com'
index = 'test-products-schema'
url = host + '/' + index + '/_search'

def signed_request(method, url, data=None, params=None, headers=None):
    request = AWSRequest(method=method, url=url, data=data, params=params, headers=headers)
    SigV4Auth(creds, service, region).add_auth(request)
    return requests.request(method=method, url=url, headers=dict(request.headers), data=data)
    
def lambda_handler(event, context):
    query_data = []
    
    if "queryStringParameters" in event:
        if "title" in event["queryStringParameters"]:
            titleQuery = {
                "regexp": {
                    "title": {
                        "value": ".*" + event["queryStringParameters"]["title"] + ".*",
                        "case_insensitive": True,
                    }
                }
            }
    
            bodyQuery = {
                "regexp": {
                    "body": {
                        "value": ".*" + event["queryStringParameters"]["title"] + ".*",
                        "case_insensitive": True,
                    }
                }
            }
    
            query_data.append(titleQuery)
            query_data.append(bodyQuery)
    
        if "category" in event["queryStringParameters"]:
            categoryQuery = {
                "regexp": {
                    "category": {
                        "value": ".*" + event["queryStringParameters"]["category"] + ".*",
                        "case_insensitive": True,
                    }
                }
            }
            query_data.append(categoryQuery)
            
        if "price_low" in event["queryStringParameters"]:
            lowPrice = {
                "range": {
                    "min_price": {
                        "gte": event["queryStringParameters"]["price_low"]
                    }
                }
            }
            query_data.append(lowPrice)
            
        if "price_high" in event["queryStringParameters"]:
            highPrice = {
                "range": {
                    "max_price": {
                        "lte": event["queryStringParameters"]["price_high"]
                    }
                }
            }
            query_data.append(highPrice)
  
    query = {
        "size": 100,
        "query": {
            "bool": {
                "should": query_data
            }
        },
    }

    headers = { "Content-Type": "application/json" }

    r = signed_request(method='GET', url=url, data=json.dumps(query), headers=headers)

    response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "isBase64Encoded": False
    }

    response['body'] = r.text
    return response
