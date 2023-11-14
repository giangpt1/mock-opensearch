import os
import sys
import subprocess

# pip install custom package to /tmp/ and add to path
subprocess.call(
    "pip install boto3 requests requests_aws4auth -t /tmp/".split(),
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
sys.path.insert(1, "/tmp/")

import boto3
import json
import requests
from requests_aws4auth import AWS4Auth

region = "ap-northeast-1"  # For example, us-west-1
service = "es"
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token,
)

host = "https://search-cospacreation-owjqksucsg3bqlk5wkyukd5siu.ap-northeast-1.es.amazonaws.com"  # The OpenSearch domain endpoint with https:// and without a trailing slash
index = "test-products-schema"
url = host + "/" + index + "/_search"

# Lambda execution starts here
def lambda_handler(event, context):
    query = {}
    query_data = []
    
    if "queryStringParameters" in event and event["queryStringParameters"] is not None:
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
    
    # Put the user query into the query DSL for more accurate search results.
    # Note that certain fields are boosted (^).
    
    if len(query_data) == 0:
      query = {
        "size": 200,
        "query": {
            "match_all": {}
        }
      }
    else:
      query = {
          "size": 200,
          "query": {
              "bool": {
                  "should": query_data
              }
          },
      }

    # Elasticsearch 6.x requires an explicit Content-Type header
    headers = {"Content-Type": "application/json"}

    # Make the signed HTTP request
    r = requests.get(url, auth=awsauth, headers=headers, data=json.dumps(query))

    # Create the response and add some extra content to support CORS
    response = {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "isBase64Encoded": False,
    }

    # Add the search results to the response
    response["body"] = r.text
    return response
