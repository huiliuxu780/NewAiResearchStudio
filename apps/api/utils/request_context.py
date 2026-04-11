from fastapi import Request


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "")


def extract_request_context(request: Request) -> dict:
    return {
        "ip_address": get_client_ip(request),
        "user_agent": get_user_agent(request),
    }
