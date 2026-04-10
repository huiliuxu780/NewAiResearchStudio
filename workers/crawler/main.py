import argparse
import asyncio
import logging
import sys

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import settings
from tasks import CrawlTask

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


async def crawl_single_source(source_id: str):
    logger.info(f"Starting crawl for source: {source_id}")
    task = CrawlTask()
    result = await task.crawl_source(source_id)

    if result:
        if result.crawl_status == "success":
            logger.info(f"Crawl completed successfully: {result.title}")
        else:
            logger.error(f"Crawl failed: {result.error_message}")
    else:
        logger.error(f"Source not found: {source_id}")


async def crawl_all_sources():
    logger.info("Starting crawl for all enabled sources")
    task = CrawlTask()
    results = await task.crawl_all_sources()

    success_count = sum(1 for r in results if r.crawl_status == "success")
    failed_count = len(results) - success_count

    logger.info(f"Crawl completed: {success_count} success, {failed_count} failed")


async def run_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        crawl_all_sources,
        "interval",
        seconds=settings.schedule_interval,
        id="crawl_all_sources",
        replace_existing=True,
    )

    logger.info(f"Starting scheduler with interval: {settings.schedule_interval} seconds")
    scheduler.start()

    try:
        await asyncio.Event().wait()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down scheduler...")
        scheduler.shutdown()


async def init_crawl4ai():
    from crawl4ai import AsyncWebCrawler, BrowserConfig

    config = BrowserConfig(headless=True, verbose=False)
    async with AsyncWebCrawler(config=config) as crawler:
        logger.info("Crawl4AI initialized successfully")


def main():
    parser = argparse.ArgumentParser(description="Crawl4AI Web Crawler Service")
    parser.add_argument(
        "--source-id",
        type=str,
        help="Crawl a specific source by ID",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Crawl all enabled sources",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Start scheduled crawling",
    )
    parser.add_argument(
        "--init",
        action="store_true",
        help="Initialize Crawl4AI (download browser)",
    )

    args = parser.parse_args()

    if args.init:
        logger.info("Initializing Crawl4AI...")
        asyncio.run(init_crawl4ai())
        return

    if args.source_id:
        asyncio.run(crawl_single_source(args.source_id))
    elif args.all:
        asyncio.run(crawl_all_sources())
    elif args.schedule:
        asyncio.run(run_scheduler())
    else:
        parser.print_help()


if __name__ == "__main__":
    main()