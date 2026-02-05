-- Neon Postgres Schema for AI Book RAG Chatbot
-- Stores content metadata and chapter/section references
-- Maps Qdrant vector IDs to book references

-- Table to store book/chapter metadata
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    publication_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store chapter/section information
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    title VARCHAR(500) NOT NULL,
    section_number VARCHAR(50),
    page_range VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to map Qdrant vector IDs to book references
-- This enforces the connection between vector embeddings and source material
CREATE TABLE IF NOT EXISTS vector_references (
    id SERIAL PRIMARY KEY,
    qdrant_vector_id VARCHAR(100) UNIQUE NOT NULL,  -- The ID used in Qdrant
    chapter_id INTEGER REFERENCES chapters(id),
    text_content TEXT,               -- Original text that was embedded
    text_hash VARCHAR(64),          -- Hash of the text for deduplication
    embedding_metadata JSONB,       -- Additional metadata about the embedding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vector_references_qdrant_id ON vector_references(qdrant_vector_id);
CREATE INDEX IF NOT EXISTS idx_vector_references_chapter ON vector_references(chapter_id);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Optional: Table for user sessions (can be extended later if needed)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);