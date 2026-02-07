# Vector Index Manager (Python scaffold)
from google.cloud import aiplatform

def create_vector_index(index_id, dimension):
    """
    Creates a Vertex AI Vector Search index.
    """
    client = aiplatform.VectorSearchClient()
    index = client.create_index(
        parent=f"projects/{os.getenv('GCP_PROJECT')}/locations/{os.getenv('GCP_LOCATION')}",
        index_id=index_id,
        dimension=dimension,
    )
    return index

def add_vectors_to_index(index, vectors, metadata):
    """
    Upserts vectors + metadata to the index.
    """
    index.upsert(vectors=vectors, metadata=metadata)
