# BG-102 Sidebar Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the app sidebar into grouped navigation, synchronize desktop collapse state with the layout shell, and reuse the same navigation structure in the mobile drawer.

**Architecture:** Move navigation metadata from a flat array to grouped data in `labels.ts`, then treat `AppLayout` as the single source of truth for desktop collapse state. `Sidebar` becomes a presentational grouped desktop nav, while `Header` owns the mobile drawer and reads the same grouped navigation structure so desktop and mobile stay aligned.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Lucide, existing `Sheet` UI component

---

### Task 1: Group The Navigation Data

**Files:**
- Modify: `E:\my-projects\ai-research-platform\apps\web\types\labels.ts`
- Verify: `E:\my-projects\ai-research-platform\apps\web\components\layout\sidebar.tsx`
- Verify: `E:\my-projects\ai-research-platform\apps\web\components\layout\header.tsx`

- [ ] **Step 1: Replace the flat navigation array with grouped navigation metadata**

Create a typed grouped structure that keeps existing item keys and hrefs intact:

```ts
export const navGroups = [
  {
    key: "workspace",
    label: "工作台",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/" },
      { key: "reports", label: "周报中心", href: "/reports" },
      { key: "logs", label: "系统日志", href: "/logs" },
    ],
  },
]
```

- [ ] **Step 2: Export small helper types for consumers**

Add reusable types:

```ts
export type NavItem = (typeof navGroups)[number]["items"][number]
export type NavGroup = (typeof navGroups)[number]
```

- [ ] **Step 3: Keep label maps unchanged unless the refactor truly needs them**

Do not churn unrelated label maps. Only change navigation-related exports.

- [ ] **Step 4: Verify the grouped data covers every current route in the sidebar**

Check that these routes still exist in the grouped structure:

```text
/, /sources, /tasks, /raw-records, /facts, /insights, /models, /products, /topics, /prompts, /reports, /logs, /settings
```

---

### Task 2: Refactor The Desktop Sidebar

**Files:**
- Modify: `E:\my-projects\ai-research-platform\apps\web\components\layout\sidebar.tsx`
- Reuse: `E:\my-projects\ai-research-platform\apps\web\types\labels.ts`

- [ ] **Step 1: Change `Sidebar` to accept controlled collapse props**

Replace internal ownership with:

```ts
interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}
```

- [ ] **Step 2: Render grouped sections instead of a single nav list**

Render this structure:

```tsx
{navGroups.map((group) => (
  <div key={group.key} className="space-y-1">
    {!collapsed && <p className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/45">{group.label}</p>}
    <div className="space-y-1">
      {group.items.map((item) => ...)}
    </div>
  </div>
))}
```

- [ ] **Step 3: Preserve group rhythm in collapsed mode**

Use vertical spacing between groups even when labels are hidden:

```tsx
className={cn("space-y-3", collapsed && "space-y-4")}
```

- [ ] **Step 4: Strengthen active item styling without changing route logic**

Keep current route match logic, but make the active item visually clearer:

```tsx
isActive
  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
```

- [ ] **Step 5: Add tooltip labels in collapsed mode**

Use the native `title` attribute for the low-risk first pass:

```tsx
<Link title={collapsed ? item.label : undefined} ...>
```

---

### Task 3: Make Layout State Consistent

**Files:**
- Modify: `E:\my-projects\ai-research-platform\apps\web\components\layout\app-layout.tsx`
- Modify: `E:\my-projects\ai-research-platform\apps\web\components\layout\header.tsx`
- Verify: `E:\my-projects\ai-research-platform\apps\web\components\layout\sidebar.tsx`

- [ ] **Step 1: Move collapse state into `AppLayout`**

Add:

```tsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
```

- [ ] **Step 2: Pass controlled props into `Sidebar`**

Use:

```tsx
<Sidebar
  collapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
/>
```

- [ ] **Step 3: Keep main content margin derived from the same state**

Preserve the current desktop widths:

```tsx
const mainContentMarginLeft = sidebarCollapsed ? "64px" : "240px"
```

- [ ] **Step 4: Update `Header` to work with the same layout state**

Keep the desktop margin logic but derive it from the shared prop instead of a fake constant.

---

### Task 4: Add Mobile Drawer Navigation

**Files:**
- Modify: `E:\my-projects\ai-research-platform\apps\web\components\layout\header.tsx`
- Reuse: `E:\my-projects\ai-research-platform\apps\web\components\ui\sheet.tsx`
- Reuse: `E:\my-projects\ai-research-platform\apps\web\types\labels.ts`

- [ ] **Step 1: Add a mobile-only menu trigger**

Add a hamburger button that only shows below `md`:

```tsx
<Button variant="ghost" size="icon" className="md:hidden" ...>
  <Menu className="h-5 w-5" />
</Button>
```

- [ ] **Step 2: Add a left-side `Sheet` drawer for grouped navigation**

Use:

```tsx
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetContent side="left" className="w-[88vw] max-w-xs p-0">
```

- [ ] **Step 3: Reuse `navGroups` inside the mobile drawer**

Render the same group order and item labels. After item click:

```tsx
onClick={() => setMobileOpen(false)}
```

- [ ] **Step 4: Keep the desktop header clean**

On desktop:
- show product title
- keep date / utility area

On mobile:
- show menu trigger + compact title

---

### Task 5: Verify And Record The Refactor

**Files:**
- Modify: `E:\my-projects\ai-research-platform\docs\backlog-v1.md`
- Modify: `E:\my-projects\ai-research-platform\docs\worklog.md`

- [ ] **Step 1: Run lint**

Run:

```powershell
npm.cmd run lint
```

Workdir:

```text
E:\my-projects\ai-research-platform\apps\web
```

Expected:

```text
0 errors
```

- [ ] **Step 2: Run build**

Run:

```powershell
npm.cmd run build
```

Workdir:

```text
E:\my-projects\ai-research-platform\apps\web
```

Expected:

```text
Compiled successfully
```

- [ ] **Step 3: Update backlog status**

Mark `BG-102` as completed when the grouped desktop nav, mobile drawer reuse, and layout-state synchronization are all in place.

- [ ] **Step 4: Update worklog**

Record:
- grouped nav structure
- layout synchronization fix
- mobile drawer reuse
- lint/build results

---

## Self-Review

- Spec coverage: grouped nav, collapse sync, mobile reuse, low-risk scope, and validation are all covered by Tasks 1-5.
- Placeholder scan: no `TODO`/`TBD` placeholders remain.
- Type consistency: `navGroups`, `NavGroup`, `NavItem`, controlled `Sidebar` props, and shared `sidebarCollapsed` state use consistent names across the plan.
