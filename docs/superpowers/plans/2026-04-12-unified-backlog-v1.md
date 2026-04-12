# Unified Backlog V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one canonical backlog document for the repo so future work is driven by a single, reality-checked task list instead of scattered requirement and triage docs.

**Architecture:** Keep the original requirement pool as historical input, keep the triage document as evidence, and introduce one unified backlog as the main execution surface. Update the project entry documents so future contributors know which file to read first.

**Tech Stack:** Markdown documentation, repository docs structure, existing takeover docs

---

### Task 1: Define Backlog Ownership And Structure

**Files:**
- Modify: `E:\my-projects\ai-research-platform\docs\requirements-triage.md`
- Create: `E:\my-projects\ai-research-platform\docs\backlog-v1.md`

- [ ] **Step 1: Confirm the source hierarchy**

Use this document hierarchy:

```text
requirements-pool.md      -> original input from another team
requirements-triage.md    -> evidence-based status assessment
backlog-v1.md             -> canonical executable backlog
```

- [ ] **Step 2: Define backlog sections**

Use these sections in `docs/backlog-v1.md`:

```markdown
## 使用方式
## 当前主结论
## P0 当前批次
## P1 下一批次
## P2 后续批次
## 暂缓/冰箱区
## 不再作为主 backlog 的文档
```

- [ ] **Step 3: Keep the backlog action-oriented**

Each backlog item must include:

```markdown
- ID
- 目标
- 为什么现在做
- 涉及目录/文件
- 完成定义
- 依赖/风险（如果有）
```

### Task 2: Write The Canonical Backlog

**Files:**
- Create: `E:\my-projects\ai-research-platform\docs\backlog-v1.md`

- [ ] **Step 1: Add the document header and operating rules**

Write a short header that says:

```markdown
# AI 研究平台 - 统一 Backlog V1

本文件是当前仓库的主 backlog。
如果 `requirements-pool.md`、历史 phase 文档、页面现状之间出现冲突，以本文件为准。
```

- [ ] **Step 2: Populate P0 items from takeover findings**

Add P0 items for:

```markdown
BG-001 前端 warning 收口
BG-002 模型管理页接真实 API
BG-003 API / 数据契约校对
BG-004 需求池去陈旧化
```

- [ ] **Step 3: Populate P1 items from partially implemented domains**

Add P1 items for:

```markdown
BG-101 推送模块前端管理台
BG-102 侧边栏导航分组重构
BG-103 数据导出能力设计与落地
BG-104 workers 健康检查
BG-105 搜索关键词与官方号观测真实联调
```

- [ ] **Step 4: Populate P2 and icebox**

Move lower-confidence or less urgent work into:

```markdown
P2 后续批次
暂缓/冰箱区
```

Only keep items there when they are truly non-blocking.

### Task 3: Add Entry Links In Core Docs

**Files:**
- Modify: `E:\my-projects\ai-research-platform\README.md`
- Modify: `E:\my-projects\ai-research-platform\docs\current-state.md`
- Modify: `E:\my-projects\ai-research-platform\docs\worklog.md`

- [ ] **Step 1: Link the backlog from README**

Add links for:

```markdown
- 统一 Backlog
- 需求池分诊
```

- [ ] **Step 2: Mark backlog-v1 as a current authority doc**

In `docs/current-state.md`, include `docs/backlog-v1.md` in the current authority docs list.

- [ ] **Step 3: Record the change in worklog**

Add a short entry describing:

```markdown
- why backlog unification was needed
- what document became the canonical backlog
- how future work should be selected
```

### Task 4: Final Consistency Pass

**Files:**
- Modify: `E:\my-projects\ai-research-platform\docs\backlog-v1.md`
- Modify: `E:\my-projects\ai-research-platform\README.md`
- Modify: `E:\my-projects\ai-research-platform\docs\current-state.md`

- [ ] **Step 1: Check naming consistency**

Ensure the final names are used consistently:

```text
requirements-pool.md
requirements-triage.md
backlog-v1.md
```

- [ ] **Step 2: Check authority wording**

Ensure only `backlog-v1.md` is described as the main executable backlog.

- [ ] **Step 3: Check for duplication**

Do not duplicate the entire triage content into the backlog. The backlog should stay execution-oriented, while the triage file remains the evidence file.
