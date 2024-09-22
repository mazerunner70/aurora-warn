import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import boto3
from decimal import Decimal  # Add this import

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = 'aurora-warn-uk' 
table = dynamodb.Table(table_name)

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
            'value': Decimal(activity.find('value').text)
        }
        activities.append(activity_record)
        write_to_dynamodb(activity_record)  # Write each activity to DynamoDB
    return activities

def write_to_dynamodb(activity):
    try:
        table.put_item(Item=activity)
    except Exception as e:
        print(f"Error writing to DynamoDB: {e}")

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