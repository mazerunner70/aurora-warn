import requests
import json
import time
import boto3
import os

# Configuration
API_URL = "https://4iyxm1ix87.execute-api.eu-west-2.amazonaws.com/prod/example"
USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')
USERNAME = os.environ.get('COGNITO_TEST_USERNAME')
PASSWORD = os.environ.get('COGNITO_TEST_PASSWORD')

def get_auth_token():
    """Get authentication token from Cognito using boto3"""
    try:
        client = boto3.client('cognito-idp', region_name='eu-west-2')
        response = client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': USERNAME,
                'PASSWORD': PASSWORD
            }
        )
        
        # Check if the response contains a challenge
        if 'ChallengeName' in response:
            if response['ChallengeName'] == 'NEW_PASSWORD_REQUIRED':
                # Handle the new password required challenge
                new_password = "Cart2*ce"  # Prompt for new password
                session = response['Session']  # Get the session from the response
                
                # Respond to the challenge
                response = client.respond_to_auth_challenge(
                    ClientId=CLIENT_ID,
                    ChallengeName='NEW_PASSWORD_REQUIRED',
                    ChallengeResponses={
                        'NEW_PASSWORD': new_password,
                        'USERNAME': USERNAME
                    },
                    Session=session
                )
        
        #print("Authentication response:", response)  # Log the entire response
        return response['AuthenticationResult']['IdToken']
    
    except Exception as e:
        print(f"❌ Authentication failed: {str(e)}")
        return None

def make_authenticated_request(query):
    """Make an authenticated request to the API"""
    token = get_auth_token()
    if not token:
        raise Exception("Failed to get authentication token")

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/x-amz-json-1.1'
    }
    
    response = requests.post(
        API_URL, 
        headers=headers,
        json={'query': query}
    )
    print("Response:", response.request)
    return response

def test_hello_query():
    # GraphQL query for hello
    query = """
    query {
        hello(name: "Tester")
    }
    """
    
    try:
        # Make the authenticated POST request to the API
        response = make_authenticated_request(query)
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            print("\nHello Query Test:")
            print("API Response:", json.dumps(result, indent=2))
            
            if 'data' in result and 'hello' in result['data']:
                print("✅ Hello test passed! Received:", result['data']['hello'])
                return True
            else:
                print("❌ Hello test failed! 'hello' field not found in the response")
                return False
        else:
            print(f"❌ Request failed with status code: {response.status_code}")
            print("Response content:", response.text)
            return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_aurora_entries():
    # GraphQL query for aurora entries
    query = """
    query {
        auroraEntries(days: 7) {
            epochtime
            statusId
            value
        }
    }
    """
    
    try:
        # Make the authenticated POST request to the API
        response = make_authenticated_request(query)
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            print("\nAurora Entries Test:")
            print("API Response:", json.dumps(result, indent=2))
            
            if 'data' in result and 'auroraEntries' in result['data']:
                entries = result['data']['auroraEntries']
                print(f"✅ Aurora entries test passed! Received {len(entries)} entries")
                
                # Validate entry structure and types
                if entries:
                    first_entry = entries[0]
                    # Check required fields and their types
                    validations = [
                        ('epochtime', int),
                        ('statusId', str),
                        ('value', (int, float))  # value can be int or float
                    ]
                    
                    for field, expected_type in validations:
                        if field not in first_entry:
                            print(f"❌ Field '{field}' missing from entry!")
                            return False
                        if not isinstance(first_entry[field], expected_type):
                            print(f"❌ Field '{field}' has wrong type! Expected {expected_type}, got {type(first_entry[field])}")
                            return False
                    
                    print("✅ Entry structure and type validation passed!")
                    return True
                return True
            else:
                print("❌ Aurora entries test failed! 'auroraEntries' field not found in the response")
                return False
        else:
            print(f"❌ Request failed with status code: {response.status_code}")
            print("Response content:", response.text)
            return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_unauthenticated_access():
    """Test that unauthenticated access is denied"""
    query = """
    query {
        hello(name: "Tester")
    }
    """
    
    try:
        # Make request without authentication
        response = requests.post(API_URL, json={'query': query})
        
        # Should receive a 401 Unauthorized or 403 Forbidden
        if response.status_code in (401, 403):
            print("✅ Unauthenticated access test passed! Access was correctly denied")
            return True
        else:
            print(f"❌ Unauthenticated access test failed! Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def run_all_tests():
    print("🚀 Starting API Tests...")
    
    # Check if environment variables are set
    required_vars = ['COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID', 
                    'COGNITO_TEST_USERNAME', 'COGNITO_TEST_PASSWORD']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    tests = {
        "Unauthenticated Access": test_unauthenticated_access,
        "Hello Query": test_hello_query,
        "Aurora Entries": test_aurora_entries
    }
    
    results = []
    for test_name, test_func in tests.items():
        print(f"\n📝 Running {test_name} test...")
        try:
            result = test_func()
            results.append(result)
            print(f"{'✅' if result else '❌'} {test_name} test {'passed' if result else 'failed'}")
        except Exception as e:
            print(f"❌ {test_name} test failed with error: {str(e)}")
            results.append(False)
    
    # Summary
    print("\n📊 Test Summary:")
    print(f"Total Tests: {len(tests)}")
    print(f"Passed: {sum(results)}")
    print(f"Failed: {len(results) - sum(results)}")
    
    # Exit with appropriate status code
    return all(results)

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
