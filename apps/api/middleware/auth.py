"""API Key 认证中间件"""

from fastapi import Depends, HTTPException, Header

from config import settings


async def verify_api_key(x_api_key: str | None = Header(None)) -> bool:
    """验证 API Key

    开发环境 (APP_ENV=development) 下自动跳过认证。
    生产环境必须提供有效的 X-API-Key 请求头。

    Raises:
        HTTPException: 401 - 缺少或无效的 API Key
    """
    if settings.is_development:
        return True

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API Key. Please provide X-API-Key header.",
        )

    valid_keys = settings.get_valid_api_keys()
    if not valid_keys:
        raise HTTPException(
            status_code=500,
            detail="API Key not configured. Please set API_KEY or API_KEYS environment variable.",
        )

    if x_api_key not in valid_keys:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key.",
        )

    return True
