import qdrant_client
from qdrant_client.http import models
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_qdrant_collection():
    """
    Sets up the Qdrant collection for storing embeddings derived from selected_text.

    The collection is designed to enforce 'selected text only' by storing embeddings
    that are created specifically from user-provided selected_text.
    """
    # Initialize Qdrant client (using local for development, can be configured for cloud)
    qdrant_host = os.getenv("QDRANT_HOST", "localhost")
    qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))

    client = qdrant_client.QdrantClient(
        host=qdrant_host,
        port=qdrant_port,
        # For production/cloud deployments, use:
        # url=os.getenv("QDRANT_URL"),
        # api_key=os.getenv("QDRANT_API_KEY"),
    )

    # Define the collection name
    collection_name = "selected_text_embeddings"

    # Check if collection already exists
    try:
        client.get_collection(collection_name)
        print(f"Collection '{collection_name}' already exists.")
        return client, collection_name
    except:
        pass

    # Create the collection with appropriate vector configuration
    # Using a common embedding size for OpenAI ada-002 (1536 dimensions)
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=1536,  # Size for OpenAI ada-002 embeddings
            distance=models.Distance.COSINE
        ),
        # Define payload schema for metadata
        optimizers_config=models.OptimizersConfigDiff(
            memmap_threshold=20000,
            indexing_threshold=20000
        )
    )

    print(f"Collection '{collection_name}' created successfully.")
    return client, collection_name

# Payload schema description (not directly used in client setup but documented here):
"""
Payload schema for selected_text_embeddings collection:

{
    "text_chunk": str,              # The original text chunk that was embedded
    "book_reference": str,          # Reference to the source book/chapter
    "section_title": str,           # Section title where this text originated
    "created_at": str,              # Timestamp when the embedding was created
    "user_id": Optional[str],       # User ID if tracking per-user selections
    "session_id": Optional[str]     # Session ID for grouping related selections
}
"""

if __name__ == "__main__":
    client, collection_name = setup_qdrant_collection()
    print(f"Qdrant collection '{collection_name}' is ready for use.")