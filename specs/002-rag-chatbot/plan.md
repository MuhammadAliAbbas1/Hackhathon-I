# Implementation Plan: Phase 4 – RAG Chatbot Plan

**Feature**: RAG Chatbot for AI/Spec-Driven Book
**Created**: 2026-01-20
**Status**: Draft
**Plan Version**: 1.0

## Overview

This plan outlines the implementation of a minimal RAG Chatbot for the AI/Spec-Driven Book following the approved specification. The implementation will utilize the required technology stack: OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres, and Qdrant Cloud Free Tier. The approach prioritizes hackathon-appropriate scope and simplicity over advanced features while ensuring compliance with the required technology stack.

## Implementation Phases

### Phase 1: Environment Setup and Required Services Configuration
**Task**: Establish the development environment and configure required services (OpenAI, FastAPI, Neon, Qdrant)
- **Dependencies**: None
- **Expected Output**: Configured development environment with access to all required services
- **Mapped Requirements**: All functional requirements
- **Duration Estimate**: 1 day (hackathon-appropriate timeline)

### Phase 2: Content Processing and Vector Database Setup
**Task**: Extract book content and populate Qdrant vector database with content embeddings
- **Dependencies**: Phase 1 completion
- **Expected Output**: Qdrant Cloud Free Tier populated with book content embeddings
- **Mapped Requirements**: FR-001 (retrieve relevant passages), FR-004 (handle natural language queries)
- **Duration Estimate**: 1 day

### Phase 3: Metadata Database Setup
**Task**: Configure Neon Serverless Postgres and populate with content metadata and references
- **Dependencies**: Phase 2 completion
- **Expected Output**: Neon database with chapter/section metadata and references
- **Mapped Requirements**: FR-003 (provide chapter/section references)
- **Duration Estimate**: 0.5 day

### Phase 4: FastAPI Backend Implementation
**Task**: Build FastAPI service to orchestrate the RAG pipeline and integrate with OpenAI Agents
- **Dependencies**: Phase 3 completion
- **Expected Output**: FastAPI service connecting OpenAI, Qdrant, and Neon
- **Mapped Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, FR-009, FR-010, FR-011
- **Duration Estimate**: 1-2 days

### Phase 5: Docusaurus Integration
**Task**: Integrate the RAG functionality into the existing Docusaurus site
- **Dependencies**: Phase 4 completion
- **Expected Output**: Chatbot interface embedded in the book site
- **Mapped Requirements**: FR-006 (simple and intuitive interface), FR-004 (natural language handling)
- **Duration Estimate**: 1 day

### Phase 6: Testing and Validation
**Task**: Validate the system against user stories and ensure proper functionality
- **Dependencies**: Phase 5 completion
- **Expected Output**: Tested and validated RAG system meeting success criteria
- **Mapped Requirements**: All functional and non-functional requirements
- **Duration Estimate**: 1 day

## Data Preparation Flow

### 1. Content Extraction
- Extract all book content from Docusaurus markdown files
- Preserve chapter/section structure and hierarchy
- Prepare content for vector embedding with metadata

### 2. Content Chunking and Embedding
- Split book content into semantically meaningful chunks (paragraphs or sections)
- Maintain source mapping (chapter, section, file) for proper references
- Generate embeddings for each chunk using appropriate model
- Upload embeddings to Qdrant Cloud Free Tier vector database

### 3. Metadata Population
- Store chapter/section metadata in Neon Serverless Postgres
- Include mapping between vector IDs and content references
- Set up schema for tracking content provenance and references

## Retrieval & Response Flow

### 1. Query Processing
- Accept user queries in natural language via FastAPI endpoint with required `selected_text` parameter
- Process query through OpenAI Agents/ChatKit SDKs
- Generate query embedding for vector similarity search within the selected text only

### 2. Content Retrieval
- Search Qdrant Cloud Free Tier vector database using query embedding, restricted to embeddings from the provided `selected_text`
- Retrieve top-k most similar content chunks (k=3-5 for simplicity) from the selected text only
- Fetch associated metadata from Neon Serverless Postgres
- NO IMPLICIT FALLBACK to whole-book or global search

### 3. Response Generation
- Pass retrieved content and original query to OpenAI Agents/ChatKit SDKs
- Generate response based solely on retrieved book content from the selected text
- Include proper chapter/section references from metadata

### 4. Response Formatting
- Format responses with clear distinction between AI-generated text and book excerpts
- Include clickable links to referenced book sections
- Handle cases where no relevant content is found in the selected text by indicating limitations

## Docusaurus Integration Approach

### 1. Frontend Component
- Create a React component for the chat interface
- Place the component as a sidebar element or dedicated page
- Implement simple chat UI with message history and input field

### 2. Backend Integration
- Connect to FastAPI backend service for query processing
- Send queries to the FastAPI endpoint which orchestrates the full RAG pipeline
- Receive responses with proper chapter/section references

### 3. Styling and UX
- Match the existing Docusaurus theme and styling
- Ensure responsive design for different screen sizes
- Implement loading indicators for query processing

## Minimal Testing Strategy

### 1. Unit Testing
- Test content extraction and chunking logic
- Validate query processing and tokenization
- Verify reference generation accuracy

### 2. Integration Testing
- Test end-to-end query-response flow
- Validate chapter/section reference linking
- Verify out-of-scope query handling

### 3. User Story Validation
- **User Story 1**: Test that questions about selected text return accurate answers from those sections
- **User Story 2**: Verify that responses include proper chapter/section references
- **User Story 3**: Test that out-of-scope queries are handled appropriately
- **User Story 4**: Confirm that the system indicates limitations for unsupported queries

### 4. Performance Validation
- Measure response times under normal usage conditions
- Verify that the system handles concurrent users appropriately
- Test accuracy of responses against book content

## Deployment Approach

### 1. Backend Deployment
- Deploy FastAPI service to cloud hosting (e.g., Railway, Render, or similar)
- Configure environment variables for OpenAI, Qdrant, and Neon connections
- Set up monitoring and logging for the API service

### 2. GitHub Pages Deployment
- Leverage existing Docusaurus GitHub Actions workflow
- Update frontend to connect to deployed FastAPI endpoint
- Maintain the same deployment process for the static site

### 3. Service Integration
- Ensure secure API key management for all services
- Set up proper CORS configuration for frontend-backend communication
- Implement connection pooling and error handling for external services

## Technology Stack (Required for Hackathon)

### Frontend
- React components within Docusaurus framework
- JavaScript for API communication
- CSS modules for styling (consistent with existing theme)

### Backend Services
- **FastAPI**: Primary backend framework for API endpoints and RAG orchestration
- **OpenAI Agents/ChatKit SDKs**: For query processing and response generation
- **Qdrant Cloud Free Tier**: Vector database for semantic search and content retrieval
- **Neon Serverless Postgres**: Database for content metadata and references

### Architecture Constraints
- **One FastAPI backend service**: Single service architecture without microservices
- **One Qdrant collection**: All embeddings stored in a single collection
- **One Neon schema**: All metadata stored in a single schema
- **No authentication**: No user authentication or personalization features
- **API-level enforcement**: Selected text restriction enforced at FastAPI endpoint level

### Tools
- Python for backend development
- Existing Docusaurus development environment
- Standard web technologies for maximum compatibility

## Risk Mitigation

### Performance Risk
- Monitor API response times across all services (OpenAI, Qdrant, Neon)
- Implement proper caching mechanisms in FastAPI service
- Set realistic performance targets considering external API latencies

### Complexity Risk
- Focus on core RAG functionality first, then enhance iteratively
- Maintain tight scope to avoid feature creep
- Prioritize integration of required services over advanced features

### Service Dependency Risk
- Implement proper error handling for external service failures
- Set up health checks for OpenAI, Qdrant, and Neon services
- Have fallback plans for service unavailability during hackathon

## Success Criteria Mapping

- **SC-001**: Target accuracy achieved through proper testing and validation
- **SC-002**: Chapter/section references implemented in response generation
- **SC-003**: Performance targets validated during testing phase
- **SC-004**: Concurrency handled through client-side architecture
- **SC-005**: Out-of-scope handling implemented in response logic