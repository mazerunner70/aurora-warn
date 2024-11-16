import requests
import json
import time

# Hardcoded API URL
API_URL = "https://39f5vkyeee.execute-api.eu-west-2.amazonaws.com/prod/graphql"

def test_hello_query():
    # GraphQL query for hello
    query = """
    query {
        hello(name: "Tester")
    }
    """
    
    # Make the POST request to the API
    response = requests.post(API_URL, json={'query': query})
    
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
    
    # Make the POST request to the API
    response = requests.post(API_URL, json={'query': query})
    
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

def run_all_tests():
    print("🚀 Starting API Tests...")
    
    tests = {
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
