from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.auth.dependencies import get_current_user
from app.database.mongodb import get_database
from app.ai.openrouter import openrouter_client
from app.ai.prompts import chat_assistant_prompt
from datetime import datetime, timezone
from bson import ObjectId
import json
import uuid

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/message")
async def send_message(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Send a message to the AI career assistant."""
    db = get_database()
    message = data.get("message", "").strip()
    conversation_id = data.get("conversation_id") or str(uuid.uuid4())

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")


    history = []
    cursor = db.chat_messages.find(
        {"user_id": current_user["id"], "conversation_id": conversation_id}
    ).sort("created_at", 1).limit(10)

    async for msg in cursor:
        history.append({"role": msg["role"], "content": msg["content"]})


    messages = [chat_assistant_prompt()]
    messages.extend(history)
    messages.append({"role": "user", "content": message})


    await db.chat_messages.insert_one({
        "user_id": current_user["id"],
        "conversation_id": conversation_id,
        "role": "user",
        "content": message,
        "created_at": datetime.now(timezone.utc),
    })

    try:

        response = await openrouter_client.chat_completion(messages, temperature=0.7)


        await db.chat_messages.insert_one({
            "user_id": current_user["id"],
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": response,
            "created_at": datetime.now(timezone.utc),
        })

        return {
            "response": response,
            "conversation_id": conversation_id,
            "timestamp": datetime.now(timezone.utc),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI assistant error: {str(e)}")


@router.post("/message/stream")
async def send_message_stream(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Send a message and receive a streaming response."""
    db = get_database()
    message = data.get("message", "").strip()
    conversation_id = data.get("conversation_id") or str(uuid.uuid4())

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    history = []
    cursor = db.chat_messages.find(
        {"user_id": current_user["id"], "conversation_id": conversation_id}
    ).sort("created_at", 1).limit(10)

    async for msg in cursor:
        history.append({"role": msg["role"], "content": msg["content"]})

    messages = [chat_assistant_prompt()]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    await db.chat_messages.insert_one({
        "user_id": current_user["id"],
        "conversation_id": conversation_id,
        "role": "user",
        "content": message,
        "created_at": datetime.now(timezone.utc),
    })

    async def stream_response():
        full_response = ""
        async for chunk in openrouter_client.chat_completion_stream(messages):
            full_response += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"


        await db.chat_messages.insert_one({
            "user_id": current_user["id"],
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": full_response,
            "created_at": datetime.now(timezone.utc),
        })
        yield f"data: {json.dumps({'done': True, 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.get("/history")
async def get_chat_history(
    conversation_id: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Get conversation history."""
    db = get_database()

    query = {"user_id": current_user["id"]}
    if conversation_id:
        query["conversation_id"] = conversation_id

    cursor = db.chat_messages.find(query).sort("created_at", 1).limit(50)
    messages = []
    async for msg in cursor:
        messages.append({
            "id": str(msg["_id"]),
            "role": msg["role"],
            "content": msg["content"],
            "conversation_id": msg.get("conversation_id"),
            "timestamp": msg["created_at"],
        })

    return messages


@router.delete("/history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    """Clear all chat history."""
    db = get_database()
    await db.chat_messages.delete_many({"user_id": current_user["id"]})
    return {"message": "Chat history cleared"}
