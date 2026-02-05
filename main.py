from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
import openai
from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Book RAG Chatbot API",
    description="Minimal backend foundation for RAG chatbot using selected text only",
    version="0.1.0"
)

# Request model for the query endpoint
class QueryRequest(BaseModel):
    selected_text: str = Field(..., min_length=1, max_length=10000, description="Text selected by user that will be used for RAG")
    question: Optional[str] = Field(None, max_length=1000, description="Optional question about the selected text")

# Response model for the query endpoint
class QueryResponse(BaseModel):
    answer: str
    source_chunks: List[str]

@app.get("/")
async def root():
    return {"message": "AI Book RAG Chatbot API - Backend Foundation"}

# Initialize OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Qdrant client
qdrant_host = os.getenv("QDRANT_HOST", "localhost")
qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))

qdrant_client = QdrantClient(
    host=qdrant_host,
    port=qdrant_port,
)

COLLECTION_NAME = "selected_text_embeddings"

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Simple function to split text into overlapping chunks.
    """
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

        # Ensure we don't go beyond the text length
        if start >= len(text):
            break

    return chunks

def get_embedding(text: str) -> List[float]:
    """
    Get embedding for a given text using OpenAI API.
    """
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def store_embeddings_in_qdrant(text_chunks: List[str], selected_text_id: str):
    """
    Store text chunks and their embeddings in Qdrant.
    Each request gets its own temporary ID space to enforce selected-text-only retrieval.
    """
    points = []
    for i, chunk in enumerate(text_chunks):
        embedding = get_embedding(chunk)

        point = models.PointStruct(
            id=str(uuid.uuid4()),  # Unique ID for this chunk
            vector=embedding,
            payload={
                "text_chunk": chunk,
                "selected_text_id": selected_text_id,  # Links to the specific selected text request
                "chunk_index": i,
                "created_at": datetime.utcnow().isoformat()
            }
        )
        points.append(point)

    # Store the points in Qdrant
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    return [point.id for point.id in points]  # Return the IDs of stored points

def retrieve_from_qdrant(query_embedding: List[float], selected_text_id: str, limit: int = 3) -> List[str]:
    """
    Retrieve relevant chunks from Qdrant based on query embedding.
    Only returns chunks that belong to the specific selected_text_id to enforce selected-text-only retrieval.
    """
    # Search in Qdrant with a filter to ensure we only retrieve chunks
    # from the same selected_text request (enforcing selected-text-only constraint)
    search_result = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="selected_text_id",
                    match=models.MatchValue(value=selected_text_id)
                )
            ]
        ),
        limit=limit
    )

    # Extract the text chunks from the search results
    retrieved_chunks = []
    for hit in search_result:
        if 'text_chunk' in hit.payload:
            retrieved_chunks.append(hit.payload['text_chunk'])

    return retrieved_chunks

@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    """
    Main RAG query endpoint that works with selected text only.

    This endpoint enforces the 'selected text only' constraint at the API level
    by restricting all retrieval and processing to the provided selected_text.
    There is no fallback to whole-book or global search.
    """
    # Extract the selected text and optional question from the request
    selected_text = request.selected_text
    question = request.question or "What can you tell me about this text?"

    # Validate that selected_text is provided (redundant with Pydantic validation but explicit)
    if not selected_text.strip():
        raise HTTPException(status_code=400, detail="selected_text cannot be empty")

    # Generate a unique ID for this selected text request to enforce isolation
    selected_text_id = str(uuid.uuid4())

    try:
        # Step A: Chunk the selected text into smaller pieces
        text_chunks = chunk_text(selected_text)

        # Step B: Store embeddings of the selected text chunks in Qdrant
        # This enforces the 'selected text only' constraint by associating embeddings
        # with the specific selected_text_id
        store_embeddings_in_qdrant(text_chunks, selected_text_id)

        # Step C: Generate embedding for the question and retrieve relevant chunks
        question_embedding = get_embedding(question)
        retrieved_chunks = retrieve_from_qdrant(question_embedding, selected_text_id)

        # If no specific question was provided, return information about the selected text
        if not request.question:
            answer = f"Based on the selected text, here are the key points: {retrieved_chunks[0] if retrieved_chunks else selected_text[:500]}"
        else:
            # Prepare context for OpenAI
            context = "\n".join(retrieved_chunks) if retrieved_chunks else selected_text

            # Step D: Use OpenAI to generate a response based on the retrieved context
            prompt = f"""Based on the following context, please answer the question.
            If the answer cannot be found in the context, please say so.

            Context: {context}

            Question: {question}

            Answer:"""

            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )

            answer = response.choices[0].message.content

        return QueryResponse(answer=answer, source_chunks=retrieved_chunks)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)