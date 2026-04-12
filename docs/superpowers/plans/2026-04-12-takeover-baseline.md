# Takeover Baseline Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the repository so a single owner can safely continue development with accurate docs, a reproducible runbook, and a working baseline for the web app, backend API, and Python workers.

**Architecture:** Treat this work as a takeover-and-stabilization pass rather than new feature work. First align the repository truth sources (`README`, worklog, current-state docs), then remove the most blocking frontend failures, and finally verify the backend and workers can still operate under the documented flow.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, FastAPI, SQLAlchemy, Pydantic, APScheduler, Python 3.12

---

## File Structure

### Documentation
- Create: `docs/current-state.md` - authoritative snapshot of actual completed modules, known issues, and current technical state
- Create: `docs/runbook.md` - reproducible local startup and verification guide for web, API, and workers
- Create: `docs/takeover-checklist.md` - baseline validation checklist used for future handoffs
- Modify: `README.md` - concise top-level project overview and links to operational docs
- Modify: `docs/worklog.md` - record takeover/stabilization batch
- Modify: `docs/engineering-rules.md` - correct outdated stack references and reinforce safe takeover workflow
- Modify: `docs/phase-3-plan.md` - reconcile plan state with implemented workers and remaining Phase 3 work
- Modify: `docs/data-contract.md` - note current gaps between documented and implemented API domains, or point to a current-state contract addendum

### Frontend
- Modify: `apps/web/package.json` - add any missing runtime dependency required by current routes
- Modify: `apps/web/app/reports/generate/page.tsx` - remove current production build blocker if dependency or behavior needs correction
- Modify: `apps/web/hooks/use-facts.ts` - fix conditional hook usage
- Modify: `apps/web/hooks/use-insights.ts` - fix conditional hook usage
- Modify: `apps/web/hooks/use-raw-records.ts` - fix conditional hook usage
- Modify: `apps/web/hooks/use-sources.ts` - fix conditional hook usage
- Modify: `apps/web/components/prompts/prompt-template-sheet.tsx` - remove effect-driven state sync lint violation
- Modify: `apps/web/components/prompts/prompt-template-test-dialog.tsx` - remove effect-driven state sync lint violation
- Modify: `apps/web/components/sources/source-form.tsx` - remove effect-driven state sync lint violation
- Modify: `apps/web/types/entities.ts` - replace the most disruptive `any` usages that block lint
- Modify: `apps/web/types/logs.ts` - replace the most disruptive `any` usages that block lint
- Modify: `apps/web/types/reports.ts` - replace the most disruptive `any` usages that block lint
- Modify: `apps/web/lib/api/sources.ts` - replace the most disruptive `any` usages that block lint

### Backend and Workers
- Verify: `apps/api/main.py` - startup, health, and scheduler initialization behavior
- Verify: `apps/api/routers/__init__.py` - active API surface
- Verify: `workers/crawler/`
- Verify: `workers/fact_extractor/`
- Verify: `workers/insight_generator/`

---

### Task 1: Establish Repository Truth Sources

**Files:**
- Create: `docs/current-state.md`
- Create: `docs/runbook.md`
- Create: `docs/takeover-checklist.md`
- Modify: `README.md`
- Modify: `docs/worklog.md`

- [ ] **Step 1: Capture the current system state in a dedicated doc**

Document:
- actual stack versions now in use
- active app/api/worker modules
- known blocking issues already observed
- current branch and takeover date
- which docs are authoritative vs historical

- [ ] **Step 2: Write a runbook for the minimum local loop**

Include exact commands for:

```powershell
cd E:\my-projects\ai-research-platform\apps\web
npm.cmd run dev
```

```powershell
cd E:\my-projects\ai-research-platform\apps\api
.\venv\Scripts\python.exe main.py
```

```powershell
cd E:\my-projects\ai-research-platform\workers\fact_extractor
python main.py --help
```

- [ ] **Step 3: Create a takeover checklist**

Checklist must cover:
- branch isolation
- docs updated
- frontend lint status
- frontend build status
- backend health status
- worker import/smoke status
- known risks not yet fixed

- [ ] **Step 4: Tighten the top-level README**

Update `README.md` so it links to:
- `docs/current-state.md`
- `docs/runbook.md`
- `docs/takeover-checklist.md`

- [ ] **Step 5: Record the takeover batch in the worklog**

Add a dated entry with:
- audit summary
- docs added or corrected
- first blocking issues identified

---

### Task 2: Reconcile Historical Planning Docs With Reality

**Files:**
- Modify: `docs/engineering-rules.md`
- Modify: `docs/phase-3-plan.md`
- Modify: `docs/data-contract.md`

- [ ] **Step 1: Correct outdated stack references**

Bring `docs/engineering-rules.md` in line with the actual stack now present in `apps/web/package.json` and the current FastAPI/Python setup.

- [ ] **Step 2: Mark Phase 3 implementation reality**

Update `docs/phase-3-plan.md` so completed workers and current remaining gaps are reflected honestly.

- [ ] **Step 3: Add a contract gap note**

Document that the implemented API surface currently includes domains beyond the original contract, including:
- dashboard
- logs
- ai_models
- prompt_templates
- crawl_tasks
- system_settings
- reports
- push

---

### Task 3: Remove Frontend Build Blockers

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/app/reports/generate/page.tsx`

- [ ] **Step 1: Fix the missing runtime dependency**

Resolve the current `sonner` import failure by either:
- adding the dependency if the project already intends to use it, or
- replacing it with an existing notification path if the app already has one

- [ ] **Step 2: Re-run the production build**

Run:

```powershell
cd E:\my-projects\ai-research-platform\apps\web
npm.cmd run build
```

Expected:
- build reaches the next blocking issue, or
- build passes

---

### Task 4: Fix Hook-Order Violations in Data Hooks

**Files:**
- Modify: `apps/web/hooks/use-facts.ts`
- Modify: `apps/web/hooks/use-insights.ts`
- Modify: `apps/web/hooks/use-raw-records.ts`
- Modify: `apps/web/hooks/use-sources.ts`

- [ ] **Step 1: Remove conditional hook execution**

Refactor each hook so `useSWR(...)` is always called exactly once per render.

Pattern to use:

```typescript
const fetcher = isMock
  ? async () => emptyPaginatedResponse
  : async () => getFacts(filter);

return useSWR<PaginatedResponse<Fact>>(key, fetcher);
```

- [ ] **Step 2: Verify lint catches no hook-order error for these files**

Run:

```powershell
cd E:\my-projects\ai-research-platform\apps\web
npm.cmd run lint
```

Expected:
- no `react-hooks/rules-of-hooks` errors remain for these hooks

---

### Task 5: Fix Effect-Driven State Sync Violations

**Files:**
- Modify: `apps/web/components/prompts/prompt-template-sheet.tsx`
- Modify: `apps/web/components/prompts/prompt-template-test-dialog.tsx`
- Modify: `apps/web/components/sources/source-form.tsx`

- [ ] **Step 1: Replace effect-setState initialization with safer state hydration**

Use one of these approaches per file:
- initialize state from props in the state factory
- reset state in explicit open/change handlers
- derive form defaults with memoized values instead of effect-driven synchronous setState

- [ ] **Step 2: Re-run lint and confirm these specific violations are gone**

Look for removal of:
- `react-hooks/set-state-in-effect`

---

### Task 6: Reduce the Most Disruptive `any` Usage

**Files:**
- Modify: `apps/web/types/entities.ts`
- Modify: `apps/web/types/logs.ts`
- Modify: `apps/web/types/reports.ts`
- Modify: `apps/web/lib/api/sources.ts`

- [ ] **Step 1: Replace obvious `any` with `unknown`, concrete interfaces, or indexed object types**

Prioritize only the `any` usages currently causing lint errors in the baseline.

- [ ] **Step 2: Re-run lint and capture remaining error categories**

The output after this pass should be smaller and easier to batch.

---

### Task 7: Verify Backend and Worker Operability

**Files:**
- Verify: `apps/api/main.py`
- Verify: `workers/crawler/`
- Verify: `workers/fact_extractor/`
- Verify: `workers/insight_generator/`

- [ ] **Step 1: Confirm backend imports and startup path**

Run:

```powershell
cd E:\my-projects\ai-research-platform\apps\api
.\venv\Scripts\python.exe -c "from main import app; print('api-import-ok')"
```

- [ ] **Step 2: Confirm worker entrypoints import cleanly**

Run representative import checks for each worker package.

- [ ] **Step 3: Record what still requires environment secrets or real API credentials**

Document missing prerequisites rather than guessing.

---

### Task 8: Close the First Takeover Batch

**Files:**
- Modify: `docs/worklog.md`
- Modify: `docs/current-state.md`

- [ ] **Step 1: Summarize completed stabilization work**

Include:
- what is green now
- what remains red
- what the next batch should target

- [ ] **Step 2: Record exact verification results**

Capture:
- lint status
- build status
- backend import/health status
- worker import status

---

## Self-Review

### Spec coverage
- Direct takeover readiness is covered by Tasks 1, 2, and 8.
- Documentation gaps are covered by Tasks 1 and 2.
- Frontend baseline stabilization is covered by Tasks 3, 4, 5, and 6.
- Python/backend operability is covered by Task 7.

### Placeholder scan
- No `TODO`, `TBD`, or deferred references remain.

### Type consistency
- The plan consistently treats the first batch as baseline stabilization, not feature expansion.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-12-takeover-baseline.md`. Execution will continue inline in this session because the repository has already been handed over for direct takeover.
