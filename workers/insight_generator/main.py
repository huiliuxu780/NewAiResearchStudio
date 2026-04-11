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
from generator import InsightGenerator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

WORKER_NAME = "insight_generator"
_start_time = 0

health_app = FastAPI(title="Insight Generator Health Check", docs_url=None, redoc_url=None)


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


async def generate_for_fact_ids(fact_ids: list[str]):
    logger.info(f"Generating insights for fact IDs: {fact_ids}")
    generator = InsightGenerator()
    results = await generator.generate_for_fact_ids(fact_ids)

    logger.info(f"Generation completed: {results['success']} success, {results['failed']} failed, {results['total']} total")
    return results


async def generate_for_company(company: str):
    logger.info(f"Generating insights for company: {company}")
    generator = InsightGenerator()
    results = await generator.generate_for_company(company)

    logger.info(f"Generation completed: {results['success']} success, {results['failed']} failed, {results['total']} total")
    return results


async def generate_for_all():
    logger.info("Generating insights for all confirmed facts")
    generator = InsightGenerator()
    results = await generator.generate_for_all_confirmed()

    logger.info(f"Generation completed: {results['success']} success, {results['failed']} failed, {results['total']} total")
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
        generate_for_all,
        "interval",
        seconds=settings.schedule_interval,
        id="generate_insights",
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
    parser = argparse.ArgumentParser(description="Insight Generator Service")
    parser.add_argument(
        "--fact-ids",
        type=str,
        help="Generate insights for specific fact IDs (comma-separated)",
    )
    parser.add_argument(
        "--company",
        type=str,
        help="Generate insights for a specific company",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate insights for all confirmed facts",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Start scheduled insight generation",
    )

    args = parser.parse_args()

    if args.fact_ids:
        fact_ids = [id.strip() for id in args.fact_ids.split(",")]
        asyncio.run(generate_for_fact_ids(fact_ids))
    elif args.company:
        asyncio.run(generate_for_company(args.company))
    elif args.all:
        asyncio.run(generate_for_all())
    elif args.schedule:
        asyncio.run(run_scheduler())
    else:
        parser.print_help()


if __name__ == "__main__":
    main()