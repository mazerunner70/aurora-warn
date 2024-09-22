import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
import boto3
import os  # Import os to access environment variables
from decimal import Decimal  # Add this import

# Initialize DynamoDB and SNS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
table_name = 'aurora-warn-uk' 
table = dynamodb.Table(table_name)

# Get the SNS phone number from environment variables
SNS_PHONE_NUMBER = os.environ.get('SNS_PHONE_NUMBER')  # Read from environment variable

def parse_lower_thresholds(root):
    thresholds = []
    for threshold in root.findall('.//lower_threshold'):
        thresholds.append({
            'status_id': threshold.get('status_id'),
            'value': int(threshold.text)
        })
    return thresholds

def parse_datetime(root):
    updated_str = root.find('.//updated/datetime').text
    dt = datetime.strptime(updated_str, "%Y-%m-%dT%H:%M:%S%z")
    return {
        'epochtime': int(dt.timestamp()),
        'iso_string': dt.isoformat()
    }

def parse_activities(root):
    activities = []
    for activity in root.findall('.//activity'):
        datetime_str = activity.find('datetime').text
        dt = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S%z")
        activity_record = {
            'epochtime': int(dt.timestamp()),            
            'iso_string': dt.isoformat(),
            'status_id': activity.get('status_id'),
            'value': activity.find('value').text
        }
        activities.append(activity_record)
        print(activity_record)
        write_to_dynamodb(activity_record)  # Write each activity to DynamoDB
    return activities

def write_to_dynamodb(activity):
    try:
        table.put_item(Item=activity)
    except Exception as e:
        print(f"Error writing to DynamoDB: {e}")

def analyze_last_six_hours():
    six_hours_ago = datetime.now(timezone.utc) - timedelta(hours=6)
    six_hours_epoch = int(six_hours_ago.timestamp())

    # Scan the DynamoDB table for records in the last six hours
    response = table.scan(
        FilterExpression="epochtime >= :six_hours_epoch",
        ExpressionAttributeValues={":six_hours_epoch": Decimal(six_hours_epoch)}
    )
    
    # Check if any records have status_id "green"
    green_records = [item for item in response['Items'] if item['status_id'] == 'green']
    
    if green_records:
        send_email(green_records)

def send_email(green_records):
    # Prepare the message
    message = "The following records have a green status in the last six hours:\n\n"
    for record in green_records:
        message += f"Timestamp: {record['iso_string']}, Status ID: {record['status_id']}, Value: {record['value']}\n"

    # Publish the message to the SNS topic
    try:
        response = sns.publish(
            TopicArn=os.environ['SNS_TOPIC_ARN'],  # Use the environment variable for the topic ARN
            Message=message,
            Subject='Green Status Notification'  # Optional subject for the email
        )
        print(f"Email sent! Message ID: {response['MessageId']}")
    except Exception as e:
        print(f"Error sending email: {e}")

def lambda_handler(event, context):
    api_url = "https://aurorawatch-api.lancs.ac.uk/0.2.5/status/project/awn/sum-activity.xml"
    
    try:
        with urllib.request.urlopen(api_url) as response:
            xml_data = response.read().decode()
        
        # Parse XML
        root = ET.fromstring(xml_data)
        
        # Extract relevant information
        datetime_info = parse_datetime(root)
        lower_thresholds = parse_lower_thresholds(root)
        activities = parse_activities(root)
        
        # Analyze the last six hours for green status
        analyze_last_six_hours()
        
        result = {
            'datetime': datetime_info,
            'lower_thresholds': lower_thresholds,
            'activities': activities
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

if __name__ == "__main__":
    print("hello")
    print(lambda_handler(None, None))