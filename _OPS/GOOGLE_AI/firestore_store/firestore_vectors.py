# Firestore Vector Store Scaffold (Python)
from google.cloud import firestore

db = firestore.Client()

def upsert_document_with_embedding(collection, doc_id, text, embedding):
    """
    Stores a document with an embedding vector in Firestore.
    """
    doc_ref = db.collection(collection).document(doc_id)
    doc_ref.set({
        "text": text,
        "vector": embedding
    })
