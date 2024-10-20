import requests
import json

# Hardcoded API URL
API_URL = "https://39f5vkyeee.execute-api.eu-west-2.amazonaws.com/prod/graphql"

# GraphQL query
query = """
query {
    hello
}
"""

def test_hello_query():
    # Make the POST request to the API
    response = requests.post(API_URL, json={'query': query})
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        result = response.json()
        print("API Response:", json.dumps(result, indent=2))
        
        # Check if the 'hello' field is in the response
        if 'data' in result and 'hello' in result['data']:
            print("Test passed! Received hello message:", result['data']['hello'])
        else:
            print("Test failed! 'hello' field not found in the response")
    else:
        print(f"Request failed with status code: {response.status_code}")
        print("Response content:", response.text)

if __name__ == "__main__":
    test_hello_query()
