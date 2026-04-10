import argparse
import asyncio
import logging
import sys

from apscheduler.schedulers.asyncio import AsyncIOScheduler

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