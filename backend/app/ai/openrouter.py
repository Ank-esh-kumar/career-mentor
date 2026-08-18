import httpx
from typing import Optional, AsyncGenerator
from app.config import settings


class OpenRouterClient:
    """Client for OpenRouter API (OpenAI-compatible)."""

    def __init__(self):
        self.base_url = settings.openrouter_base_url
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.frontend_url,
            "X-Title": settings.app_name,
        }

    async def chat_completion(
        self,
        messages: list,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        response_format: Optional[dict] = None,
    ) -> str:
        """Send a chat completion request to OpenRouter with robust manual fallback."""
        primary_model = model or self.model
        fallback_models = [
            primary_model,
            "google/gemma-4-26b-a4b-it:free",
            "inclusionai/ling-3.0-flash:free",
            "nvidia/nemotron-3-nano-30b-a3b:free",
            "openai/gpt-oss-20b:free"
        ]
        unique_models = []
        for m in fallback_models:
            if m not in unique_models:
                unique_models.append(m)

        last_error = None
        async with httpx.AsyncClient(timeout=120.0) as client:
            for current_model in unique_models:
                payload = {
                    "model": current_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format:
                    payload["response_format"] = response_format

                try:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=self.headers,
                        json=payload,
                    )

                    if response.status_code == 200:
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        last_error = f"API error ({response.status_code}): {response.text}"
                        print(f"Model {current_model} failed: {last_error}")
                        continue
                except Exception as e:
                    last_error = str(e)
                    print(f"Model {current_model} exception: {last_error}")
                    continue

            raise Exception(f"All fallback models failed. Last error: {last_error}")

    async def chat_completion_stream(
        self,
        messages: list,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[str, None]:
        """Stream a chat completion response with robust manual fallback."""
        primary_model = model or self.model
        fallback_models = [
            primary_model,
            "google/gemma-4-26b-a4b-it:free",
            "inclusionai/ling-3.0-flash:free",
            "nvidia/nemotron-3-nano-30b-a3b:free",
            "openai/gpt-oss-20b:free"
        ]
        unique_models = []
        for m in fallback_models:
            if m not in unique_models:
                unique_models.append(m)

        last_error = None
        async with httpx.AsyncClient(timeout=120.0) as client:
            for current_model in unique_models:
                payload = {
                    "model": current_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True,
                }

                try:

                    async with client.stream(
                        "POST",
                        f"{self.base_url}/chat/completions",
                        headers=self.headers,
                        json=payload,
                    ) as response:
                        if response.status_code != 200:
                            last_error = f"API error ({response.status_code})"
                            print(f"Model {current_model} stream failed: {last_error}")
                            continue


                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str == "[DONE]":
                                    break
                                try:
                                    import json
                                    data = json.loads(data_str)
                                    delta = data["choices"][0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        yield content
                                except Exception:
                                    continue

                        return
                except Exception as e:
                    last_error = str(e)
                    print(f"Model {current_model} stream exception: {last_error}")
                    continue


            yield f"Error: All AI models are currently overwhelmed or unavailable. Please try again later. Last error: {last_error}"



openrouter_client = OpenRouterClient()
