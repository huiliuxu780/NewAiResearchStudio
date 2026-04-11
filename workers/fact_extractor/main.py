import argparse
import asyncio
import logging
import sys
import time
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from config import settings
from extractor import FactExtractor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

WORKER_NAME = "fact_extractor"
_start_time = 0

health_app = FastAPI(title="Fact Extractor Health Check", docs_url=None, redoc_url=None)


class HealthResponse(BaseModel):
    status: str
    worker: str
    timestamp: str
    uptime_seconds: float


@health_app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        worker=WORKER_NAME,
        timestamp=datetime.now().isoformat(),
        uptime_seconds=round(time.time() - _start_time, 1),
    )


async def extract_for_record(record_id: str):
    logger.info(f"Extracting facts for record: {record_id}")
    extractor = FactExtractor()
    result = await extractor.extract_for_record(record_id)

    if result["success"]:
        logger.info(f"Extraction completed: {result['facts_count']} facts extracted")
    else:
        logger.error(f"Extraction failed: {result['error']}")

    return result


async def extract_all_pending():
    logger.info("Extracting facts for all pending records")
    extractor = FactExtractor()
    results = await extractor.extract_all_pending()

    logger.info(f"Extraction completed: {results['success']} success, {results['failed']} failed, {results['total_facts']} total facts")
    return results


async def run_scheduler():
    global _start_time
    _start_time = time.time()
    
    health_task = asyncio.create_task(
        uvicorn.Server(
            uvicorn.Config(health_app, host="0.0.0.0", port=8080, log_level="warning", access_log=False)
        ).serve()
    )
    logger.info("Health check server started on port 8080")
    
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        extract_all_pending,
        "interval",
        seconds=settings.schedule_interval,
        id="extract_facts",
        replace_existing=True,
    )

    logger.info(f"Starting scheduler with interval: {settings.schedule_interval} seconds")
    scheduler.start()

    try:
        await asyncio.Event().wait()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down scheduler...")
        scheduler.shutdown()
        health_task.cancel()


def main():
    parser = argparse.ArgumentParser(description="Fact Extractor Service")
    parser.add_argument(
        "--record-id",
        type=str,
        help="Extract facts for a specific raw record ID",
    )
    parser.add_argument(
        "--all-pending",
        action="store_true",
        help="Extract facts for all pending raw records",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Start scheduled fact extraction",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=None,
        help="Number of records to process in one batch",
    )

    args = parser.parse_args()

    if args.record_id:
        asyncio.run(extract_for_record(args.record_id))
    elif args.all_pending:
        asyncio.run(extract_all_pending())
    elif args.schedule:
        asyncio.run(run_scheduler())
    else:
        parser.print_help()


if __name__ == "__main__":
    main()