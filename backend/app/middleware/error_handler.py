from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handler middleware.

    Only catches unexpected exceptions. FastAPI's built-in exception
    handlers already handle HTTPException, RequestValidationError, etc.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:

            from starlette.exceptions import HTTPException as StarletteHTTPException
            if isinstance(e, StarletteHTTPException):
                raise
            traceback.print_exc()
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "status_code": 500,
                },
            )
