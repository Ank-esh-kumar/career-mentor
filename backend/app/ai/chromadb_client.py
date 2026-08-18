import chromadb
from typing import List, Optional, Dict, Any
from app.config import settings


class ChromaDBClient:
    """Client for ChromaDB vector store operations."""

    def __init__(self):
        self._client = None
        self._collections = {}

    def connect(self):
        """Initialize ChromaDB connection."""
        try:
            self._client = chromadb.HttpClient(
                host=settings.chroma_host,
                port=settings.chroma_port,
            )

            self._client.heartbeat()
            print(f"Connected to ChromaDB at {settings.chroma_host}:{settings.chroma_port}")
        except Exception:

            self._client = chromadb.PersistentClient(path="./chroma_data")
            print("Using local ChromaDB (persistent)")


        self._collections["resumes"] = self._client.get_or_create_collection(
            name="resumes",
            metadata={"description": "Resume embeddings for RAG"},
        )
        self._collections["career_knowledge"] = self._client.get_or_create_collection(
            name="career_knowledge",
            metadata={"description": "Career information and job descriptions"},
        )
        self._collections["skills_knowledge"] = self._client.get_or_create_collection(
            name="skills_knowledge",
            metadata={"description": "Skills and learning resources"},
        )

    def get_collection(self, name: str):
        """Get a ChromaDB collection."""
        if name not in self._collections:
            self._collections[name] = self._client.get_or_create_collection(name=name)
        return self._collections[name]

    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        ids: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ):
        """Add documents to a collection."""
        collection = self.get_collection(collection_name)
        collection.add(
            documents=documents,
            ids=ids,
            metadatas=metadatas,
        )

    def query(
        self,
        collection_name: str,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Query a collection for similar documents."""
        collection = self.get_collection(collection_name)
        params = {
            "query_texts": [query_text],
            "n_results": min(n_results, collection.count() or 1),
        }
        if where:
            params["where"] = where

        try:
            results = collection.query(**params)
            return results
        except Exception:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    def delete_documents(self, collection_name: str, ids: List[str]):
        """Delete documents from a collection."""
        collection = self.get_collection(collection_name)
        collection.delete(ids=ids)

    def upsert_documents(
        self,
        collection_name: str,
        documents: List[str],
        ids: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ):
        """Upsert documents in a collection."""
        collection = self.get_collection(collection_name)
        collection.upsert(
            documents=documents,
            ids=ids,
            metadatas=metadatas,
        )



chromadb_client = ChromaDBClient()
