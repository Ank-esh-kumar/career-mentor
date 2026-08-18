from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):

    mongodb_uri: str = "mongodb://localhost:27017/ai_pathway"
    mongodb_db_name: str = "ai_pathway"


    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440


    google_client_id: str = ""
    google_client_secret: str = ""


    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"


    chroma_host: str = "localhost"
    chroma_port: int = 8001


    upload_dir: str = "./uploads"
    max_upload_size: int = 10485760


    app_name: str = "Career Mentor"
    app_env: str = "development"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

