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
    query = event.get('queryStringParameters', {}).get('query', '')
    
    # Execute the query
    result = schema.execute(query)
    
    # Return the result as a JSON response
    return {
        'statusCode': 200,
        'body': json.dumps(result.data)
    }

