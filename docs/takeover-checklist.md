# AI 研究平台 - 接手清单

## 一、接手前保护动作

- [ ] 不在 `main` 上直接开发
- [ ] 创建独立接手分支
- [ ] 确认仓库内已有未提交改动，避免误覆盖
- [ ] 明确本轮目标是“稳定基线”还是“继续功能开发”

## 二、文档真相源

- [x] `docs/current-state.md` 已更新
- [x] `docs/runbook.md` 已更新
- [x] `docs/takeover-checklist.md` 已更新
- [x] `README.md` 已链接到上述文档
- [x] `docs/worklog.md` 已记录本轮接手内容

## 三、前端基线

- [x] `apps/web` 依赖完整
- [x] `npm.cmd run lint` 已执行
- [x] `npm.cmd run build` 已执行
- [x] 当前 build 阻塞项已记录
- [x] 当前 lint 阻塞类别已记录

## 四、后端基线

- [x] `apps/api/venv` 可用
- [x] FastAPI 入口可导入
- [x] `/health` 预期可用
- [x] 数据库路径与环境变量说明清晰
- [x] 当前 API 域已记录

## 五、Workers 基线

- [x] `crawler` 入口已验证
- [x] `fact_extractor` 入口已验证
- [x] `insight_generator` 入口已验证
- [x] 需要外部密钥的地方已明确写出

## 六、风险与遗留

- [x] 已列出当前最关键阻塞项
- [x] 已区分“已实现但未收口”和“尚未实现”
- [x] 已给出下一批执行建议

## 七、接手完成判定

满足以下条件时，可认为第一阶段接手完成：

- [x] 文档真相源建立完成
- [x] 前端 build 至少恢复到可继续排障的状态
- [x] 后端与 Python 环境验证通过
- [x] workers 的最小启动/帮助信息验证通过
- [x] 下一阶段优先级已明确
