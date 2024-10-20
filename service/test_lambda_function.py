import unittest
from unittest.mock import patch, MagicMock
from lambda_function import lambda_handler

class TestLambdaFunction(unittest.TestCase):

    @patch('lambda_function.execute_query')
    def test_lambda_handler(self, mock_execute_query):
        # Mock the execute_query function
        mock_execute_query.return_value = {"data": {"test": "result"}}

        # Create a sample event and context
        event = {
            "body": '{"query": "query { test }"}',
            "httpMethod": "POST"
        }
        context = MagicMock()

        # Call the lambda_handler
        response = lambda_handler(event, context)

        # Assert the response
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(response['body'], '{"data": {"test": "result"}}')

    def test_lambda_handler_get_request(self):
        # Test GET request
        event = {"httpMethod": "GET"}
        context = MagicMock()

        response = lambda_handler(event, context)

        self.assertEqual(response['statusCode'], 200)
        self.assertIn("GraphQL Playground", response['body'])

    def test_lambda_handler_invalid_method(self):
        # Test invalid HTTP method
        event = {"httpMethod": "PUT"}
        context = MagicMock()

        response = lambda_handler(event, context)

        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(response['body'], '{"error": "No GraphQL query found in the request"}')

if __name__ == '__main__':
    unittest.main()
