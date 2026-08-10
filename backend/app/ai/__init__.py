from app.ai.openrouter import openrouter_client
from app.ai.chromadb_client import chromadb_client
from app.ai.rag import store_resume_embedding, retrieve_context, rag_query, seed_career_knowledge
from app.ai.prompts import (
    resume_analysis_prompt, career_recommendation_prompt,
    skill_gap_prompt, career_roadmap_prompt,
    chat_assistant_prompt, learning_resources_prompt,
)
