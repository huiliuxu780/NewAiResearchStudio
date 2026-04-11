"""带重试和速率限制的 Qwen API 客户端"""

import asyncio
import logging
import time
from typing import Any

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

logger = logging.getLogger(__name__)


class QwenAPIError(Exception):
    """Qwen API 调用错误"""
    pass


class QwenRateLimitError(Exception):
    """Qwen API 速率限制错误"""
    pass


class RateLimiter:
    """简单的令牌桶速率限制器"""

    def __init__(self, rate: float):
        """
        Args:
            rate: 每秒允许的最大请求数
        """
        self._rate = rate
        self._min_interval = 1.0 / rate if rate > 0 else 0
        self._last_request_time = 0.0
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """等待直到可以发送下一个请求"""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self._min_interval:
                await asyncio.sleep(self._min_interval - elapsed)
            self._last_request_time = time.monotonic()


class QwenClient:
    """Qwen API 客户端，内置重试和速率限制

    用法:
        client = QwenClient(
            api_key="your-key",
            model="qwen-plus",
            max_retries=3,
            rate_limit_rps=2.0,
        )
        result = await client.call(prompt="...")
    """

    def __init__(
        self,
        api_key: str,
        model: str = "qwen-plus",
        temperature: float = 0.1,
        max_tokens: int = 2000,
        max_retries: int = 3,
        rate_limit_rps: float = 2.0,
    ):
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.max_retries = max_retries
        self._rate_limiter = RateLimiter(rate_limit_rps)
        self._semaphore = asyncio.Semaphore(5)

    async def call_with_retry(
        self,
        call_func,
        *args,
        **kwargs,
    ) -> Any:
        """使用重试机制调用 Qwen API

        Args:
            call_func: 异步调用函数，返回 (success, result) 元组
                      success: bool - 是否成功
                      result: 调用结果或错误信息
            *args, **kwargs: 传递给 call_func 的参数

        Returns:
            调用结果

        Raises:
            QwenAPIError: 当所有重试都失败时
        """
        attempt = 0

        @retry(
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            retry=retry_if_exception_type((QwenAPIError, QwenRateLimitError)),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            reraise=True,
        )
        async def _retry_wrapper():
            nonlocal attempt
            attempt += 1
            await self._rate_limiter.acquire()

            async with self._semaphore:
                success, result = await call_func(*args, **kwargs)

                if not success:
                    error_msg = result.get("error", "Unknown error") if isinstance(result, dict) else str(result)
                    status_code = result.get("status_code", 0) if isinstance(result, dict) else 0

                    # 429 速率限制错误需要重试
                    if status_code == 429:
                        raise QwenRateLimitError(f"Rate limited: {error_msg}")

                    # 5xx 服务器错误需要重试
                    if status_code >= 500:
                        raise QwenAPIError(f"Server error (attempt {attempt}): {error_msg}")

                    # 其他错误不重试，直接返回空结果
                    logger.error(f"Qwen API call failed (non-retryable): {error_msg}")
                    return result

                return result

        try:
            return await _retry_wrapper()
        except (QwenAPIError, QwenRateLimitError) as e:
            logger.error(f"Qwen API call failed after {self.max_retries} retries: {e}")
            return {"error": str(e), "status_code": 0}
