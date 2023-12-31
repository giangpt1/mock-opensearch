import os
import sys
import subprocess
import re

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
    query_data_should = []
    
    if "queryStringParameters" in event and event["queryStringParameters"] is not None:
        if "title" in event["queryStringParameters"]:
            titleValue = event["queryStringParameters"]["title"]
            convertedTitleValue = " ".join(titleValue.split("&"))
            
            titleAndBodyQuery = {
                "multi_match": {
                    "query": convertedTitleValue,
                    "fields": [
                        "title.ngram^1",
                        "body.ngram^1"
                    ],
                    "type": "cross_fields",
                    "operator": "and",
                }
            }
            
            titleAndBodyQueryShould = {
                "multi_match": {
                    "query": convertedTitleValue,
                    "fields": [
                        "title^1",
                        "body^1"
                    ],
                    "type": "cross_fields",
                    "operator": "and",
                }
            }
    
            query_data.append(titleAndBodyQuery)
            query_data_should.append(titleAndBodyQueryShould)
    
        if "category" in event["queryStringParameters"]:
            categoryValue = event["queryStringParameters"]["category"]
            convertedCategoryValue = categoryValue.split(",")
            categoryQuery = {
                "terms": {
                    "category": convertedCategoryValue
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
  
    if len(query_data) == 0:
      query = {
        "size": 1000,
        "query": {
            "match_all": {}
        }
      }
    else:
      query = {
          "size": 1000,
          "query": {
              "bool": {
                  "must": query_data,
                  "should": query_data_should
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
