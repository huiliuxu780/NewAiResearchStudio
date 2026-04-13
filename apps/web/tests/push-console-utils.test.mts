import test from "node:test";
import assert from "node:assert/strict";
import {
  buildChannelDependencyMessage,
  buildTemplateDependencyMessage,
  getRetryableRecords,
  matchesTaskRiskFilter,
  summarizeChannelDependencies,
  summarizeTaskRisk,
  summarizeTemplateDependencies,
} from "../lib/push-console-utils.ts";

test("summarizeChannelDependencies tracks enabled delivery and alert tasks", () => {
  const summary = summarizeChannelDependencies("channel-1", [
    {
      id: "task-1",
      name: "日报推送",
      is_enabled: true,
      channel_ids: ["channel-1"],
      alert_on_failure: false,
      alert_channel_id: null,
    },
    {
      id: "task-2",
      name: "失败告警",
      is_enabled: true,
      channel_ids: [],
      alert_on_failure: true,
      alert_channel_id: "channel-1",
    },
    {
      id: "task-3",
      name: "已停用任务",
      is_enabled: false,
      channel_ids: ["channel-1"],
      alert_on_failure: false,
      alert_channel_id: null,
    },
  ] as never[]);

  assert.deepEqual(summary.enabledDeliveryTaskNames, ["日报推送"]);
  assert.deepEqual(summary.enabledAlertTaskNames, ["失败告警"]);
  assert.deepEqual(summary.deliveryTaskNames, ["日报推送", "已停用任务"]);
});

test("buildChannelDependencyMessage warns when enabled tasks still depend on the channel", () => {
  const message = buildChannelDependencyMessage(
    { id: "channel-1", name: "主飞书渠道" } as never,
    [
      {
        id: "task-1",
        name: "日报推送",
        is_enabled: true,
        channel_ids: ["channel-1"],
        alert_on_failure: false,
        alert_channel_id: null,
      },
    ] as never[],
    "disable"
  );

  assert.match(message, /主飞书渠道/);
  assert.match(message, /日报推送/);
  assert.match(message, /启用任务依赖/);
});

test("summarizeTemplateDependencies only counts linked tasks", () => {
  const summary = summarizeTemplateDependencies("template-1", [
    {
      id: "task-1",
      name: "欢迎消息",
      is_enabled: true,
      template_id: "template-1",
    },
    {
      id: "task-2",
      name: "归档通知",
      is_enabled: false,
      template_id: "template-1",
    },
    {
      id: "task-3",
      name: "其他模板任务",
      is_enabled: true,
      template_id: "template-2",
    },
  ] as never[]);

  assert.deepEqual(summary.taskNames, ["欢迎消息", "归档通知"]);
  assert.deepEqual(summary.enabledTaskNames, ["欢迎消息"]);
});

test("buildTemplateDependencyMessage warns when enabled tasks still use the template", () => {
  const message = buildTemplateDependencyMessage(
    { id: "template-1", name: "主模板" } as never,
    [
      {
        id: "task-1",
        name: "欢迎消息",
        is_enabled: true,
        template_id: "template-1",
      },
    ] as never[],
    "delete"
  );

  assert.match(message, /主模板/);
  assert.match(message, /欢迎消息/);
  assert.match(message, /发送链路会受影响/);
});

test("summarizeTaskRisk collects failure, disabled template and disabled channel reasons", () => {
  const summary = summarizeTaskRisk(
    {
      id: "task-1",
      name: "欢迎消息",
      failure_count: 3,
      channel_ids: ["channel-1", "channel-2"],
      template_id: "template-1",
    } as never,
    {
      "channel-1": { id: "channel-1", is_enabled: true },
      "channel-2": { id: "channel-2", is_enabled: false },
    } as never,
    {
      "template-1": { id: "template-1", is_enabled: false },
    } as never
  );

  assert.equal(summary.hasRisk, true);
  assert.equal(summary.disabledChannelCount, 1);
  assert.equal(summary.disabledTemplate, true);
  assert.deepEqual(summary.reasons, ["累计失败 3 次", "模板已停用", "1 个渠道已停用"]);
});

test("matchesTaskRiskFilter distinguishes failing and dependency risks", () => {
  const failureOnly = {
    hasRisk: true,
    failureCount: 2,
    disabledChannelCount: 0,
    disabledTemplate: false,
    reasons: ["累计失败 2 次"],
  };
  const dependencyOnly = {
    hasRisk: true,
    failureCount: 0,
    disabledChannelCount: 1,
    disabledTemplate: false,
    reasons: ["1 个渠道已停用"],
  };

  assert.equal(matchesTaskRiskFilter(failureOnly, "all"), true);
  assert.equal(matchesTaskRiskFilter(failureOnly, "risk"), true);
  assert.equal(matchesTaskRiskFilter(failureOnly, "failing"), true);
  assert.equal(matchesTaskRiskFilter(failureOnly, "dependency"), false);
  assert.equal(matchesTaskRiskFilter(dependencyOnly, "failing"), false);
  assert.equal(matchesTaskRiskFilter(dependencyOnly, "dependency"), true);
});

test("getRetryableRecords only returns failed records", () => {
  const retryable = getRetryableRecords([
    { id: "record-1", status: "failed", title: "失败" },
    { id: "record-2", status: "retrying", title: "重试中" },
    { id: "record-3", status: "pending", title: "待处理" },
    { id: "record-4", status: "success", title: "成功" },
  ] as never[]);

  assert.deepEqual(
    retryable.map((record) => record.id),
    ["record-1"]
  );
});
