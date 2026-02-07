# Vertex AI Embeddings Client (Python scaffold)
import os
from google.cloud import aiplatform

aiplatform.init(project=os.getenv("GCP_PROJECT"), location=os.getenv("GCP_LOCATION"))

def embed_text(text: str, model="textembedding-gecko@001"):
    """
    Generate Vertex AI embeddings for text.
    """
    model = aiplatform.Model(model)
    response = model.embed(inputs=[text])
    return response.embeddings[0]
