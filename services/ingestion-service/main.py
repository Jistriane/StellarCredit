import os
import json
import time
from stellar_sdk import Server
from kafka import KafkaProducer
from dotenv import load_dotenv

load_dotenv()

# Configuration
HORIZON_URL = os.getenv("STELLAR_HORIZON_URL", "https://horizon-testnet.stellar.org")
KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "localhost:9092")
TOPIC_NAME = "stellar.transactions"

def create_producer():
    while True:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda x: json.dumps(x).encode('utf-8')
            )
            print(f"Connected to Kafka at {KAFKA_BROKER}")
            return producer
        except Exception as e:
            print(f"Failed to connect to Kafka: {e}. Retrying in 5s...")
            time.sleep(5)

def stream_transactions():
    server = Server(horizon_url=HORIZON_URL)
    producer = create_producer()
    
    print(f"Starting Stellar Ingestion from {HORIZON_URL}...")
    
    # Start from now
    cursor = "now"
    
    while True:
        try:
            # Stream transactions
            for tx in server.transactions().cursor(cursor).stream():
                # Extract relevant data
                payload = {
                    "id": tx["id"],
                    "hash": tx["hash"],
                    "created_at": tx["created_at"],
                    "source_account": tx["source_account"],
                    "fee_charged": tx["fee_charged"],
                    "operation_count": tx["operation_count"],
                    "memo": tx.get("memo"),
                    "memo_type": tx.get("memo_type"),
                    "successful": tx["successful"]
                }
                
                # Publish to Kafka
                producer.send(TOPIC_NAME, value=payload)
                print(f"Published tx: {tx['hash']}")
                
                # Update cursor
                cursor = tx["paging_token"]
                
        except Exception as e:
            print(f"Error in stream: {e}. Reconnecting in 5s...")
            time.sleep(5)

if __name__ == "__main__":
    stream_transactions()
