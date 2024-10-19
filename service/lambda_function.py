# lambda_function.py
import json
from graphene import ObjectType, String, Schema

# Define a simple GraphQL query
class Query(ObjectType):
    hello = String(name=String(default_value="stranger"))

    def resolve_hello(self, info, name):
        return f"Hello, {name}!"

# Create the schema
schema = Schema(query=Query)

def lambda_handler(event, context):
    # Parse the GraphQL query from the event
    if 'body' in event:
        # For API Gateway or Lambda Function URL with POST method
        body = json.loads(event['body'])
        query = body.get('query', '')
    elif 'queryStringParameters' in event:
        # For API Gateway or Lambda Function URL with GET method
        query = event['queryStringParameters'].get('query', '')
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No GraphQL query found in the request'})
        }
    
    # Execute the query
    result = schema.execute(query)
    
    # Check for errors
    if result.errors:
        return {
            'statusCode': 400,
            'body': json.dumps({'errors': [str(error) for error in result.errors]})
        }
    
    # Return the result as a JSON response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(result.data)
    }
