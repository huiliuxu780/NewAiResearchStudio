# AI 研究平台 - 统一 Backlog V1

本文件是当前仓库的主 backlog。  
如果 [requirements-pool.md](E:\my-projects\ai-research-platform\docs\requirements-pool.md)、[requirements-triage.md](E:\my-projects\ai-research-platform\docs\requirements-triage.md)、历史 phase 文档与代码现状之间出现冲突，以本文件为准。

## 使用方式

- 原始输入：`docs/requirements-pool.md`
- 证据分诊：`docs/requirements-triage.md`
- 当前执行：`docs/backlog-v1.md`

使用规则：

1. 新任务先判断它是“收口已有域”还是“新增功能”
2. 只有进入本文件的条目，才算当前正式 backlog
3. 原需求池保留，但不再直接驱动开发顺序

## 当前主结论

当前项目不缺“功能方向”，缺的是“统一执行面”。

所以接下来优先顺序不是继续往系统里堆新名词，而是：

1. 收口已经存在但完成度不足的域
2. 降低前端和文档噪音
3. 再做真正未实现的新能力

---

## P0 当前批次

### BG-001 前端 Warning 收口

- 状态：已完成（2026-04-12）
- 目标：把当前前端 `lint` 剩余 warning 再压一轮，降低后续协作噪音
- 为什么现在做：前端 `build` 已恢复，但 warning 会让真实问题更难被看见
- 涉及目录/文件：
  - `E:\my-projects\ai-research-platform\apps\web\app\`
  - `E:\my-projects\ai-research-platform\apps\web\components\`
  - `E:\my-projects\ai-research-platform\apps\web\hooks\`
- 完成定义：
  - `apps/web` 的 `npm.cmd run lint` warning 数量明显下降
  - 不引入新的 `build` 失败
  - 保持现有页面行为不回退

当前批次实际完成：

- 清理页面、组件、类型定义中的未使用导入和未使用变量
- 修复 `lucide-react` 的 `Image` 图标命名与 a11y 规则误判冲突
- 保持现有页面功能不变的前提下，将 `apps/web` 的 `lint` 收口到零 warning
- 复验 `apps/web` 的 `build`，确认没有引入新的生产构建问题

### BG-002 模型管理页接真实 API

- 状态：已完成当前批次范围（2026-04-12）
- 目标：把当前模型管理页从本地 state 展示页收口成真实后端闭环
- 为什么现在做：AI 模型管理域后端已存在，但前端页面仍偏演示态
- 涉及目录/文件：
  - [page.tsx](E:\my-projects\ai-research-platform\apps\web\app\models\page.tsx)
  - `E:\my-projects\ai-research-platform\apps\web\lib\api\`
  - `E:\my-projects\ai-research-platform\apps\web\hooks\`
  - `E:\my-projects\ai-research-platform\apps\api\routers\ai_models.py`
- 完成定义：
  - 模型列表来自真实 API
  - 启停/默认模型/基础编辑有真实请求
  - 页面不再依赖硬编码模型数据

当前批次实际完成：

- 真实列表
- 启用/停用
- 设为默认
- 模型测试

仍留待后续：

- 新建
- 编辑
- 删除

### BG-003 API / 数据契约校对

- 状态：已完成（2026-04-12）
- 目标：把当前文档契约和真实 API 域对齐
- 为什么现在做：代码域已经超过历史文档域，后续协作会继续踩空
- 涉及目录/文件：
  - [data-contract.md](E:\my-projects\ai-research-platform\docs\data-contract.md)
  - [current-state.md](E:\my-projects\ai-research-platform\docs\current-state.md)
  - `E:\my-projects\ai-research-platform\apps\api\routers\`
  - `E:\my-projects\ai-research-platform\apps\api\models\`
- 完成定义：
  - 文档覆盖当前主要 API 域
  - 标出哪些域已实现、哪些域部分实现
  - 后续开发不再依赖过期 phase 文档判断现状

当前批次实际完成：

- `docs/data-contract.md` 增加 2026-04-12 校准说明
- 修正 `Company`、`CrawlStrategy`、`ReviewStatus`、`Priority`、`SocialPlatform` 等关键枚举差异
- 将 `Source`、`WeeklyReport` 等关键字段定义更新为真实 schema 形态
- 补充 `/api/v1` 已实现域总览，覆盖 dashboard、logs、ai_models、prompt_templates、crawl_tasks、system_settings、reports、push
- 为 AI 模型、Prompt 模板、采集任务、操作日志、AI 日志、系统设置、推送渠道 / 任务 / 记录 / 模板 / 统计补齐逐字段契约表
- 补充扩展域请求 / 返回模型映射，明确每个域的 create / update / response schema 入口
- 更新 `docs/current-state.md`，同步最新基线与前后端完成度说明

### BG-004 需求池去陈旧化

- 目标：把原始需求池中已过期或已实现的条目标记出主 backlog 之外
- 为什么现在做：避免后续团队重复开发、重复建模
- 涉及目录/文件：
  - [requirements-pool.md](E:\my-projects\ai-research-platform\docs\requirements-pool.md)
  - [requirements-triage.md](E:\my-projects\ai-research-platform\docs\requirements-triage.md)
  - [backlog-v1.md](E:\my-projects\ai-research-platform\docs\backlog-v1.md)
- 完成定义：
  - 团队知道“看哪份文档开工”
  - 已过期条目不再被当作当前待开发项
  - 新任务统一先写入本 backlog

---

## P1 下一批次

### BG-101 推送模块前端管理台

- 目标：给已有推送后端域补前端管理入口
- 为什么现在做：推送后端基础已经很完整，但前端管理台明显缺位
- 涉及目录/文件：
  - `E:\my-projects\ai-research-platform\apps\api\routers\push.py`
  - `E:\my-projects\ai-research-platform\apps\api\services\push\`
  - `E:\my-projects\ai-research-platform\apps\web\app\`
  - `E:\my-projects\ai-research-platform\apps\web\components\`
- 完成定义：
  - 至少具备渠道、任务、记录、模板的基础管理视图
  - 能查看列表、详情、基础操作
  - 与现有后端接口真实连通

### BG-102 侧边栏导航分组重构

- 状态：已完成（2026-04-12）
- 目标：把当前 13 项扁平导航改成分组导航
- 为什么现在做：这是明确存在的前端体验债，而且与实际导航复杂度匹配
- 涉及目录/文件：
  - [labels.ts](E:\my-projects\ai-research-platform\apps\web\types\labels.ts)
  - [sidebar.tsx](E:\my-projects\ai-research-platform\apps\web\components\layout\sidebar.tsx)
  - `E:\my-projects\ai-research-platform\apps\web\components\layout\`
- 完成定义：
  - 导航改为分组结构
  - 折叠/展开和当前路由状态可用
  - 桌面与移动端都不退化

当前批次实际完成：

- 导航从单层 `navItems` 重构为 `工作台 / 情报数据 / 知识资产 / 配置中心` 四组
- 新增共享导航渲染组件，桌面侧边栏与移动端抽屉复用同一套分组数据
- `AppLayout` 上提 `sidebarCollapsed` 状态，修复侧边栏与主内容区边距不同步问题
- 桌面端保留折叠态组间节奏，折叠后使用图标列 + `title` tooltip
- 移动端补齐左侧抽屉导航入口
- `apps/web` 的 `lint` / `build` 持续通过

### BG-103 数据导出能力设计与落地

- 目标：为列表类页面补统一导出能力
- 为什么现在做：这是当前明确未实现、但业务价值高的缺口
- 涉及目录/文件：
  - `E:\my-projects\ai-research-platform\apps\api\routers\`
  - `E:\my-projects\ai-research-platform\apps\api\services\`
  - `E:\my-projects\ai-research-platform\apps\web\components\`
- 完成定义：
  - 先明确格式策略和字段选择策略
  - 至少落一个最小可用导出链路
  - 不用一次做完 Excel / PDF / CSV 全套

### BG-104 Workers 健康检查

- 目标：给 crawler / fact_extractor / insight_generator 建立比 `--help` 更实用的健康检查
- 为什么现在做：当前 worker 仅完成 CLI 级 smoke check，缺少运行态可观测性
- 涉及目录/文件：
  - `E:\my-projects\ai-research-platform\workers\crawler\`
  - `E:\my-projects\ai-research-platform\workers\fact_extractor\`
  - `E:\my-projects\ai-research-platform\workers\insight_generator\`
- 完成定义：
  - 至少有统一健康检查入口或自检命令
  - 能覆盖依赖、配置、API 可达性中的关键项

### BG-105 搜索关键词与官方号观测真实联调

- 目标：把已存在的策略代码从“代码存在”推进到“真实联调可判断”
- 为什么现在做：这两类策略目前更像已接线、未彻底验收
- 涉及目录/文件：
  - [crawler.py](E:\my-projects\ai-research-platform\workers\crawler\crawler.py)
  - `E:\my-projects\ai-research-platform\workers\crawler\search_client.py`
  - `E:\my-projects\ai-research-platform\workers\crawler\social_client.py`
- 完成定义：
  - 明确外部依赖
  - 有最小联调记录
  - 明确失败时的降级与错误输出

---

## P2 后续批次

### BG-201 推送模块真实渠道联调

- 目标：在前端管理台补完后，验证飞书 / 邮件等真实渠道
- 为什么放后面：后端基础已在，但需要真实凭据和环境
- 完成定义：
  - 至少一种真实渠道完成发送验证
  - 有失败重试和错误记录可查

### BG-202 筛选体验统一化

- 目标：统一各列表页的日期筛选、默认值、关键词搜索和说明
- 为什么放后面：价值明确，但不如 P0/P1 紧迫
- 完成定义：
  - 关键列表页筛选策略一致
  - 说明文案和交互模式统一

### BG-203 AI 调用统计与可视化收口

- 目标：把已有 AI 日志域升级成更可用的统计与成本视图
- 为什么放后面：已有基础，不阻塞当前主线
- 完成定义：
  - 至少有调用量、成功率、token 或耗时中的主指标

---

## 暂缓 / 冰箱区

这些需求不是没价值，而是当前不应该先做：

- 国际化支持
- 多角色权限体系
- 过早扩展更多推送渠道
- 大规模视觉翻新但不解决当前闭环问题的 UI 改造

---

## 不再作为主 Backlog 的文档

以下文档仍保留，但不再直接决定当前开发顺序：

- [requirements-pool.md](E:\my-projects\ai-research-platform\docs\requirements-pool.md)
- [requirements-triage.md](E:\my-projects\ai-research-platform\docs\requirements-triage.md)
- `docs/phase-1-plan.md`
- `docs/phase-2-plan.md`
- `docs/phase-3-plan.md`

这些文档分别承担：

- 原始输入
- 证据分诊
- 历史规划

而不是当前主执行面。
