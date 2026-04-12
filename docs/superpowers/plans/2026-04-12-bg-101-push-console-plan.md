# BG-101 Push Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real `/push` management console that surfaces push channels, tasks, records, templates, and summary stats through a tabbed workspace wired to the existing backend APIs.

**Architecture:** Build a dedicated `push` frontend domain with focused types, API functions, and SWR hooks first, then assemble a single-page tab workspace with shared patterns from existing `tasks`, `logs`, and `prompts` pages. Mount the page under the `配置中心` navigation group so the new console fits the current information architecture without changing unrelated routes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, SWR, ky, Tailwind CSS 4, shadcn/base-ui components

---

### Task 1: Create Push Domain Types And API Layer

**Files:**
- Create: `E:\my-projects\ai-research-platform\apps\web\types\push.ts`
- Create: `E:\my-projects\ai-research-platform\apps\web\lib\api\push.ts`
- Modify: `E:\my-projects\ai-research-platform\apps\web\lib\api\index.ts`

- [ ] **Step 1: Define push entity types**
- [ ] **Step 2: Add filter and request payload types for channels, tasks, records, templates, and stats**
- [ ] **Step 3: Implement API functions for list/detail/basic actions**
- [ ] **Step 4: Export the new push API module from the shared API index**

---

### Task 2: Create Push Hooks

**Files:**
- Create: `E:\my-projects\ai-research-platform\apps\web\hooks\use-push.ts`
- Modify: `E:\my-projects\ai-research-platform\apps\web\hooks\index.ts`

- [ ] **Step 1: Add SWR query hooks for stats, channels, tasks, records, templates**
- [ ] **Step 2: Add mutation hooks for channel toggle, task enable/disable/trigger, record retry, template preview**
- [ ] **Step 3: Export push hooks from the shared hooks index**

---

### Task 3: Build Shared Push UI Pieces

**Files:**
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-stats.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-shared.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-channel-sheet.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-task-sheet.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-record-sheet.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-template-sheet.tsx`

- [ ] **Step 1: Build shared status badge / metadata helpers for push entities**
- [ ] **Step 2: Build lightweight summary stats cards from `/push/stats`**
- [ ] **Step 3: Build detail sheets for channels, tasks, records, templates**

---

### Task 4: Build The Four Push Tabs

**Files:**
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-channels-tab.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-tasks-tab.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-records-tab.tsx`
- Create: `E:\my-projects\ai-research-platform\apps\web\components\push\push-templates-tab.tsx`

- [ ] **Step 1: Build channels tab with list, filters, details, enable/disable**
- [ ] **Step 2: Build tasks tab with list, filters, details, enable/disable, trigger**
- [ ] **Step 3: Build records tab with list, filters, details, retry**
- [ ] **Step 4: Build templates tab with list, filters, details, preview**

---

### Task 5: Assemble The Push Page And Mount It In Navigation

**Files:**
- Create: `E:\my-projects\ai-research-platform\apps\web\app\push\page.tsx`
- Modify: `E:\my-projects\ai-research-platform\apps\web\types\labels.ts`

- [ ] **Step 1: Create `/push` page with title, summary cards, and tabs**
- [ ] **Step 2: Default the workspace to the `任务` tab**
- [ ] **Step 3: Add `推送管理` to the `配置中心` navigation group**

---

### Task 6: Verify And Record The Work

**Files:**
- Modify: `E:\my-projects\ai-research-platform\docs\backlog-v1.md`
- Modify: `E:\my-projects\ai-research-platform\docs\worklog.md`

- [ ] **Step 1: Run lint in `apps/web`**
- [ ] **Step 2: Run build in `apps/web`**
- [ ] **Step 3: Mark `BG-101` status in backlog**
- [ ] **Step 4: Record the push console delivery in worklog**

---

## Self-Review

- Spec coverage: route, navigation mount, summary stats, tabs, list/detail/basic actions, and validation are all covered.
- Placeholder scan: no TODO/TBD placeholders remain.
- Type consistency: the plan uses the same `channels/tasks/records/templates/stats` domain names throughout.
