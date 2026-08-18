"""RAG (Retrieval Augmented Generation) pipeline."""
from typing import Optional
from app.ai.chromadb_client import chromadb_client
from app.ai.openrouter import openrouter_client


async def store_resume_embedding(user_id: str, resume_text: str, metadata: dict = None):
    """Store resume text in ChromaDB for retrieval."""

    chunks = chunk_text(resume_text, chunk_size=500, overlap=50)

    documents = []
    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        documents.append(chunk)
        ids.append(f"{user_id}_resume_{i}")
        metadatas.append({
            "user_id": user_id,
            "type": "resume",
            "chunk_index": i,
            **(metadata or {}),
        })


    try:
        existing = chromadb_client.query("resumes", f"user:{user_id}", n_results=100)
        if existing and existing.get("ids") and existing["ids"][0]:
            chromadb_client.delete_documents("resumes", existing["ids"][0])
    except Exception:
        pass


    chromadb_client.upsert_documents(
        collection_name="resumes",
        documents=documents,
        ids=ids,
        metadatas=metadatas,
    )


async def retrieve_context(query: str, collection: str = "career_knowledge", n_results: int = 3) -> str:
    """Retrieve relevant context from ChromaDB for a query."""
    try:
        results = chromadb_client.query(
            collection_name=collection,
            query_text=query,
            n_results=n_results,
        )

        if results and results.get("documents") and results["documents"][0]:
            context_pieces = results["documents"][0]
            return "\n\n".join(context_pieces)
    except Exception:
        pass

    return ""


async def rag_query(
    messages: list,
    query: str,
    collection: str = "career_knowledge",
    n_results: int = 3,
) -> str:
    """Execute a RAG query: retrieve context, augment prompt, generate response."""

    context = await retrieve_context(query, collection, n_results)


    if context and messages:
        augmented_messages = messages.copy()
        last_msg = augmented_messages[-1]
        if last_msg["role"] == "user":
            augmented_messages[-1] = {
                "role": "user",
                "content": f"{last_msg['content']}\n\nRELEVANT CONTEXT:\n{context}",
            }
        messages = augmented_messages


    response = await openrouter_client.chat_completion(messages)
    return response


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """Split text into overlapping chunks."""
    if not text:
        return []

    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap

    return chunks if chunks else [text]


async def seed_career_knowledge():
    """Seed ChromaDB with career knowledge base."""
    career_docs = [
        {
            "id": "career_software_eng",
            "text": "Software Engineering: Involves designing, developing, testing, and maintaining software applications. Key skills include programming languages (Python, JavaScript, Java), data structures, algorithms, system design, version control (Git), agile methodologies. Average salary: $80,000-$150,000. High demand, strong growth potential. Career paths include Frontend, Backend, Full-Stack, Mobile, DevOps, and Cloud engineering.",
        },
        {
            "id": "career_data_science",
            "text": "Data Science: Combines statistics, programming, and domain expertise to extract insights from data. Key skills: Python, R, SQL, machine learning, deep learning, data visualization, statistics, big data tools (Spark, Hadoop). Average salary: $85,000-$160,000. Very high demand. Career paths include Data Analyst, ML Engineer, AI Researcher, Data Engineer.",
        },
        {
            "id": "career_product_management",
            "text": "Product Management: Involves defining product strategy, roadmap, and features. Key skills: market research, user research, data analysis, communication, leadership, agile/scrum, wireframing, A/B testing. Average salary: $90,000-$170,000. High demand. Career progression: APM → PM → Senior PM → Director → VP of Product → CPO.",
        },
        {
            "id": "career_ux_design",
            "text": "UX/UI Design: Focuses on creating user-centered digital experiences. Key skills: user research, wireframing, prototyping, visual design, Figma, Adobe XD, interaction design, usability testing, design systems. Average salary: $65,000-$130,000. Growing demand. Career paths: UX Designer, UI Designer, UX Researcher, Design Lead.",
        },
        {
            "id": "career_cybersecurity",
            "text": "Cybersecurity: Involves protecting systems, networks, and data from digital attacks. Key skills: network security, ethical hacking, SIEM tools, risk assessment, compliance, incident response, cryptography, penetration testing. Average salary: $75,000-$155,000. Very high demand due to increasing cyber threats.",
        },
        {
            "id": "career_cloud_computing",
            "text": "Cloud Computing: Involves designing and managing cloud infrastructure. Key skills: AWS/Azure/GCP, containerization (Docker, Kubernetes), CI/CD, infrastructure as code (Terraform), serverless, networking, Linux. Average salary: $90,000-$160,000. Extremely high demand.",
        },
        {
            "id": "career_ai_ml",
            "text": "AI/Machine Learning Engineering: Building AI models and deploying them at scale. Key skills: Python, TensorFlow/PyTorch, NLP, computer vision, MLOps, deep learning, mathematics, statistics. Average salary: $100,000-$200,000. Highest growth field in tech.",
        },
        {
            "id": "career_devops",
            "text": "DevOps Engineering: Bridges development and operations for faster delivery. Key skills: CI/CD, Docker, Kubernetes, cloud platforms, monitoring, logging, automation, scripting, Git. Average salary: $85,000-$155,000. High demand across all tech companies.",
        },
    ]

    docs = [d["text"] for d in career_docs]
    ids = [d["id"] for d in career_docs]
    metadatas = [{"type": "career_knowledge"} for _ in career_docs]

    chromadb_client.upsert_documents(
        collection_name="career_knowledge",
        documents=docs,
        ids=ids,
        metadatas=metadatas,
    )
