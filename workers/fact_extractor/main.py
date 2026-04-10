import argparse
import asyncio
import logging
import sys

from apscheduler.schedulers.asyncio import AsyncIOScheduler

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