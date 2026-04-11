import functools
import json
from datetime import datetime
from typing import Any, Callable

from fastapi import Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from models import Base
from models import OperationLog
from schemas import OperationLogCreate
from services import log_service, async_session
from utils import extract_request_context
from utils.logging import get_logger

logger = get_logger(__name__)


def _make_json_serializable(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def _get_entity_id_from_kwargs(kwargs: dict, path_param_name: str = "source_id") -> str | None:
    for key in ["source_id", "fact_id", "insight_id", "record_id", "entity_id"]:
        if key in kwargs:
            return str(kwargs[key])
    return None


def _get_entity_type_from_path(path: str) -> str:
    path_parts = path.strip("/").split("/")
    if len(path_parts) >= 2:
        return path_parts[1]
    return "unknown"


def _extract_model_data(model: Any) -> dict | None:
    if model is None:
        return None
    if isinstance(model, BaseModel):
        data = model.model_dump()
        return _convert_datetimes(data)
    if hasattr(model, "__dict__"):
        data = {k: v for k, v in model.__dict__.items() if not k.startswith("_")}
        return _convert_datetimes(data)
    return None


def _convert_datetimes(data: Any) -> Any:
    if isinstance(data, datetime):
        return data.isoformat()
    if isinstance(data, dict):
        return {k: _convert_datetimes(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_convert_datetimes(item) for item in data]
    return data


def log_operation(action: str, entity_type: str | None = None, entity_id_param: str | None = None):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request | None = kwargs.get("request")
            session: AsyncSession | None = kwargs.get("session")

            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if not session:
                for arg in args:
                    if isinstance(arg, AsyncSession):
                        session = arg
                        break

            context = extract_request_context(request) if request else {}
            actual_entity_type = entity_type
            if not actual_entity_type and request:
                actual_entity_type = _get_entity_type_from_path(request.url.path)

            entity_id = kwargs.get(entity_id_param) if entity_id_param else None
            if not entity_id:
                entity_id = _get_entity_id_from_kwargs(kwargs)

            old_value = None
            new_value = None
            status = "success"
            error_message = None

            try:
                result = await func(*args, **kwargs)

                if action in ["create", "update"] and result:
                    new_value = _extract_model_data(result)

                try:
                    async with async_session() as log_session:
                        log_entry = OperationLog(
                            action=action,
                            entity_type=actual_entity_type or "unknown",
                            entity_id=str(entity_id) or "unknown",
                            old_value=old_value,
                            new_value=new_value,
                            status=status,
                            error_message=error_message,
                            **context,
                        )
                        log_session.add(log_entry)
                        await log_session.commit()
                except Exception as log_err:
                    logger.warning(f"Failed to create operation log: {log_err}")

                return result
            except Exception as e:
                status = "failed"
                error_message = str(e)

                try:
                    async with async_session() as log_session:
                        log_entry = OperationLog(
                            action=action,
                            entity_type=actual_entity_type or "unknown",
                            entity_id=str(entity_id) or "unknown",
                            old_value=old_value,
                            new_value=new_value,
                            status=status,
                            error_message=error_message,
                            **context,
                        )
                        log_session.add(log_entry)
                        await log_session.commit()
                except Exception as log_err:
                    logger.warning(f"Failed to create operation log: {log_err}")

                raise

        return wrapper
    return decorator
