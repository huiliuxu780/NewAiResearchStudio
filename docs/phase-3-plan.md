# AI 研究平台 - Phase 3 计划

## 1. Phase 3 目标

> 2026-04-12 校准说明：本文件是 Phase 3 规划文档，不再完整代表当前实现状态。当前已实现进度与运行现状请同时参考 `docs/current-state.md` 和 `docs/worklog.md`。

### 1.1 总体目标

接入 Qwen API，实现 AI 驱动的事实抽取和结论生成。

### 1.2 Phase 3 做什么

| 任务 | 说明 |
|------|------|
| 创建事实抽取 Worker | 从原始记录抽取标准化事实 |
| 创建结论生成 Worker | 从标准化事实生成研究结论 |
| Prompt 模板管理 | 管理抽取和生成的 Prompt 模板 |
| 人工复核工作台 | 完善复核流程 |
| 日报/周报生成 | 自动生成报告 |

### 1.3 Phase 3 不做什么

| 禁止项 | 说明 |
|--------|------|
| 不做复杂 Agent 编排 | Phase 3 只做单步抽取和生成 |
| 不做多模型对比 | Phase 3 只用 Qwen |
| 不做实时流式处理 | Phase 3 只做批量处理 |

---

## 2. 技术架构

### 2.1 AI 服务架构

```
原始记录 → 事实抽取 Worker → 标准化事实
                                    ↓
                              结论生成 Worker → 研究结论
```

### 2.2 Qwen API 集成

| 配置项 | 说明 |
|--------|------|
| API Key | 环境变量配置 |
| 模型选择 | qwen-plus / qwen-max |
| 温度参数 | 抽取: 0.1, 生成: 0.7 |
| 最大 Token | 抽取: 2000, 生成: 1000 |

### 2.3 Prompt 模板

**事实抽取 Prompt：**
```
你是一个专业的信息抽取助手。请从以下内容中抽取标准化事实。

原始内容：
{content}

请以 JSON 格式输出以下字段：
- fact_summary: 事实摘要
- topic_level_1: 一级主题
- topic_level_2: 二级主题
- event_type: 事件类型
- entity_type: 实体类型
- entity_name: 实体名称
- importance_level: 重要性层级
- confidence: 置信度
```

**结论生成 Prompt：**
```
你是一个专业的 AI 研究分析师。请基于以下事实生成研究结论。

事实列表：
{facts}

请以 JSON 格式输出以下字段：
- insight_content: 结论内容
- insight_type: 结论类型
- impact_level: 影响层级
- confidence: 置信度
- reasoning_brief: 推理简述
- action_suggestion: 行动建议
```

---

## 3. Worker 设计

### 3.1 事实抽取 Worker

```
workers/fact_extractor/
├── __init__.py
├── main.py              # 入口
├── config.py            # 配置
├── extractor.py         # 抽取逻辑
├── prompts.py           # Prompt 模板
├── requirements.txt
└── .env.example
```

**功能：**
- 从后端 API 获取待处理的原始记录
- 调用 Qwen API 进行结构化抽取
- 将抽取结果保存到数据库

### 3.2 结论生成 Worker

```
workers/insight_generator/
├── __init__.py
├── main.py              # 入口
├── config.py            # 配置
├── generator.py         # 生成逻辑
├── prompts.py           # Prompt 模板
├── requirements.txt
└── .env.example
```

**功能：**
- 从后端 API 获取已确认的标准化事实
- 调用 Qwen API 生成研究结论
- 将结论保存到数据库

---

## 4. 任务分解

| 序号 | 任务 | 分支名 | 优先级 | 状态 |
|------|------|--------|--------|------|
| 1 | Phase 3 规划文档 | docs/phase3-plan | P0 | ✅ |
| 2 | 创建事实抽取 Worker | feat/fact-extractor | P0 | 已实现，待基线验证 |
| 3 | 创建结论生成 Worker | feat/insight-generator | P0 | 已实现，待基线验证 |
| 4 | Prompt 模板管理 | feat/prompt-templates | P1 | 已部分实现，待收口 |
| 5 | 人工复核工作台完善 | feat/review-workflow | P1 | 待收口 |
| 6 | 日报/周报生成 | feat/report-generator | P2 | 已部分实现，待收口 |

---

## 5. 验收标准

### 5.1 功能验收

- [ ] 事实抽取 Worker 基线验证通过
- [ ] 结论生成 Worker 基线验证通过
- [ ] Qwen API 调用在有效密钥环境下验证成功
- [ ] 抽取结果保存到数据库
- [ ] 结论保存到数据库

### 5.2 质量验收

- [ ] 事实抽取准确率 > 80%
- [ ] 结论生成相关性 > 85%
- [ ] 单次处理时间 < 10s

---

## 6. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-10 | 初始版本，定义 Phase 3 计划 |
