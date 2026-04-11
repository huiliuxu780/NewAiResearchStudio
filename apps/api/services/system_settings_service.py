from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.system_settings import SettingCategory, SystemSettings
from models.base import generate_uuid
from schemas.system_settings import SystemSettingsUpdate
from services.transaction import transaction


class SystemSettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_settings_by_category(
        self, category: SettingCategory
    ) -> list[SystemSettings]:
        result = await self.session.execute(
            select(SystemSettings)
            .where(SystemSettings.category == category)
            .order_by(SystemSettings.key)
        )
        return list(result.scalars().all())

    async def get_all_settings_grouped(self) -> dict[str, list[SystemSettings]]:
        result = await self.session.execute(
            select(SystemSettings).order_by(
                SystemSettings.category, SystemSettings.key
            )
        )
        settings = list(result.scalars().all())

        grouped: dict[str, list[SystemSettings]] = {}
        for setting in settings:
            cat = setting.category.value
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(setting)

        return grouped

    async def get_setting(
        self, category: SettingCategory, key: str
    ) -> SystemSettings | None:
        result = await self.session.execute(
            select(SystemSettings).where(
                SystemSettings.category == category,
                SystemSettings.key == key,
            )
        )
        return result.scalar_one_or_none()

    async def update_settings(
        self, category: SettingCategory, updates: dict[str, str]
    ) -> list[SystemSettings]:
        updated_settings = []
        for key, value in updates.items():
            setting = await self.get_setting(category, key)
            if setting:
                setting.value = value
                updated_settings.append(setting)

        if updated_settings:
            async with transaction(self.session) as txn:
                for setting in updated_settings:
                    txn.add(setting)
                await txn.flush()
                for setting in updated_settings:
                    await txn.refresh(setting)

        return updated_settings

    async def update_setting(
        self, category: SettingCategory, key: str, data: SystemSettingsUpdate
    ) -> SystemSettings | None:
        setting = await self.get_setting(category, key)
        if not setting:
            return None

        async with transaction(self.session) as txn:
            update_data = data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(setting, field, value)
            txn.add(setting)
            await txn.flush()
            await txn.refresh(setting)
        return setting

    async def init_default_settings(self) -> None:
        default_settings = [
            # Company settings
            {
                "key": "company_name",
                "value": "AI Research Platform",
                "category": SettingCategory.company,
                "description": "Company/Platform name",
            },
            {
                "key": "company_logo",
                "value": "/assets/logo.png",
                "category": SettingCategory.company,
                "description": "Company logo URL path",
            },
            {
                "key": "contact_email",
                "value": "contact@airesearch.com",
                "category": SettingCategory.company,
                "description": "Contact email address",
            },
            {
                "key": "contact_phone",
                "value": "+1-555-0123",
                "category": SettingCategory.company,
                "description": "Contact phone number",
            },
            # AI defaults
            {
                "key": "default_model",
                "value": "gpt-4",
                "category": SettingCategory.ai_defaults,
                "description": "Default AI model to use",
            },
            {
                "key": "default_temperature",
                "value": "0.7",
                "category": SettingCategory.ai_defaults,
                "description": "Default temperature for AI responses",
            },
            {
                "key": "default_max_tokens",
                "value": "2048",
                "category": SettingCategory.ai_defaults,
                "description": "Default maximum tokens for AI responses",
            },
            {
                "key": "default_top_p",
                "value": "1.0",
                "category": SettingCategory.ai_defaults,
                "description": "Default top_p value for AI responses",
            },
            # Notifications
            {
                "key": "email_notifications_enabled",
                "value": "true",
                "category": SettingCategory.notifications,
                "description": "Enable email notifications",
            },
            {
                "key": "webhook_url",
                "value": "",
                "category": SettingCategory.notifications,
                "description": "Webhook URL for notifications",
            },
            {
                "key": "webhook_enabled",
                "value": "false",
                "category": SettingCategory.notifications,
                "description": "Enable webhook notifications",
            },
            # System parameters
            {
                "key": "page_size",
                "value": "20",
                "category": SettingCategory.system,
                "description": "Default page size for pagination",
            },
            {
                "key": "max_page_size",
                "value": "100",
                "category": SettingCategory.system,
                "description": "Maximum page size allowed",
            },
            {
                "key": "batch_process_size",
                "value": "50",
                "category": SettingCategory.system,
                "description": "Batch processing size for bulk operations",
            },
            {
                "key": "max_concurrent_tasks",
                "value": "10",
                "category": SettingCategory.system,
                "description": "Maximum number of concurrent tasks",
            },
        ]

        for setting_data in default_settings:
            existing = await self.get_setting(
                setting_data["category"], setting_data["key"]
            )
            if not existing:
                setting = SystemSettings(
                    id=generate_uuid(),
                    key=setting_data["key"],
                    value=setting_data["value"],
                    category=setting_data["category"],
                    description=setting_data["description"],
                )
                self.session.add(setting)

        await self.session.commit()
