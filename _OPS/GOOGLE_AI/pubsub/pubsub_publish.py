# Pub/Sub Publisher Stub (Python)
from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
topic = os.getenv("PUBSUB_TOPIC_MEMORY")

def publish_memory_event(event_json: str):
    """
    Publishes memory system events to Pub/Sub for downstream processing.
    """
    publisher.publish(topic, event_json.encode("utf-8"))
