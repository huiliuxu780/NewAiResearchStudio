from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import (
    WeeklyReportCreate,
    WeeklyReportListResponse,
    WeeklyReportResponse,
    SuccessResponse,
)
from services import get_session, ReportService, ReportGenerator

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/", response_model=WeeklyReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    company: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    items, total, total_pages = await service.get_list(company=company, page=page, page_size=page_size)
    return WeeklyReportListResponse(
        items=[WeeklyReportResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/generate", response_model=WeeklyReportResponse)
async def generate_report(
    data: WeeklyReportCreate,
    session: AsyncSession = Depends(get_session),
):
    generator = ReportGenerator(session)
    try:
        report = await generator.generate_report(data)
        return WeeklyReportResponse.model_validate(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"周报生成失败: {str(e)}")


@router.get("/{report_id}", response_model=WeeklyReportResponse)
async def get_report(
    report_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="周报不存在")
    return WeeklyReportResponse.model_validate(report)


@router.delete("/{report_id}", response_model=SuccessResponse)
async def delete_report(
    report_id: str,
    session: AsyncSession = Depends(get_session),
):
    service = ReportService(session)
    deleted = await service.delete_report(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="周报不存在")
    return SuccessResponse(message="周报删除成功")
