import type { PushChannel, PushRecord, PushTask, PushTemplate } from "../types/push";

export interface PushChannelDependencySummary {
  deliveryTaskNames: string[];
  enabledDeliveryTaskNames: string[];
  alertTaskNames: string[];
  enabledAlertTaskNames: string[];
}

export interface PushTemplateDependencySummary {
  taskNames: string[];
  enabledTaskNames: string[];
}

export interface PushTaskRiskSummary {
  hasRisk: boolean;
  failureCount: number;
  disabledChannelCount: number;
  disabledTemplate: boolean;
  reasons: string[];
}

export type PushTaskRiskFilter = "all" | "risk" | "failing" | "dependency";

export function summarizeChannelDependencies(channelId: string, tasks: PushTask[]): PushChannelDependencySummary {
  const deliveryTasks = tasks.filter((task) => task.channel_ids.includes(channelId));
  const alertTasks = tasks.filter((task) => task.alert_channel_id === channelId);

  return {
    deliveryTaskNames: deliveryTasks.map((task) => task.name),
    enabledDeliveryTaskNames: deliveryTasks.filter((task) => task.is_enabled).map((task) => task.name),
    alertTaskNames: alertTasks.map((task) => task.name),
    enabledAlertTaskNames: alertTasks.filter((task) => task.is_enabled && task.alert_on_failure).map((task) => task.name),
  };
}

export function summarizeTemplateDependencies(templateId: string, tasks: PushTask[]): PushTemplateDependencySummary {
  const linkedTasks = tasks.filter((task) => task.template_id === templateId);

  return {
    taskNames: linkedTasks.map((task) => task.name),
    enabledTaskNames: linkedTasks.filter((task) => task.is_enabled).map((task) => task.name),
  };
}

export function buildChannelDependencyMessage(channel: PushChannel, tasks: PushTask[], action: "disable" | "delete") {
  const summary = summarizeChannelDependencies(channel.id, tasks);
  const enabledImpactCount = summary.enabledDeliveryTaskNames.length + summary.enabledAlertTaskNames.length;

  if (!enabledImpactCount) {
    return action === "delete"
      ? `确定要删除渠道“${channel.name}”吗？此操作不可撤销。`
      : `确定要停用渠道“${channel.name}”吗？停用后将不会继续通过该渠道发送。`;
  }

  const examples = [...summary.enabledDeliveryTaskNames, ...summary.enabledAlertTaskNames].slice(0, 3).join("、");

  return action === "delete"
    ? `渠道“${channel.name}”仍被 ${enabledImpactCount} 个启用任务依赖，例如：${examples}。继续删除后，这些任务的发送或告警链路会受影响。`
    : `渠道“${channel.name}”仍被 ${enabledImpactCount} 个启用任务依赖，例如：${examples}。继续停用后，这些任务的发送或告警链路会受影响。`;
}

export function buildTemplateDependencyMessage(template: PushTemplate, tasks: PushTask[], action: "disable" | "delete") {
  const summary = summarizeTemplateDependencies(template.id, tasks);
  const enabledImpactCount = summary.enabledTaskNames.length;

  if (!enabledImpactCount) {
    return action === "delete"
      ? `确定要删除模板“${template.name}”吗？此操作不可撤销。`
      : `确定要停用模板“${template.name}”吗？停用后任务将无法继续使用该模板。`;
  }

  const examples = summary.enabledTaskNames.slice(0, 3).join("、");

  return action === "delete"
    ? `模板“${template.name}”仍被 ${enabledImpactCount} 个启用任务使用，例如：${examples}。继续删除后，这些任务的发送链路会受影响。`
    : `模板“${template.name}”仍被 ${enabledImpactCount} 个启用任务使用，例如：${examples}。继续停用后，这些任务的发送链路会受影响。`;
}

export function summarizeTaskRisk(
  task: PushTask,
  channelById: Record<string, PushChannel>,
  templateById: Record<string, PushTemplate>
): PushTaskRiskSummary {
  const linkedChannels = task.channel_ids.map((channelId) => channelById[channelId]).filter(Boolean);
  const disabledChannelCount = linkedChannels.filter((channel) => !channel.is_enabled).length;
  const template = task.template_id ? templateById[task.template_id] : null;
  const disabledTemplate = Boolean(template && !template.is_enabled);
  const reasons: string[] = [];

  if (task.failure_count > 0) {
    reasons.push(`累计失败 ${task.failure_count} 次`);
  }

  if (disabledTemplate) {
    reasons.push("模板已停用");
  }

  if (disabledChannelCount > 0) {
    reasons.push(`${disabledChannelCount} 个渠道已停用`);
  }

  return {
    hasRisk: reasons.length > 0,
    failureCount: task.failure_count,
    disabledChannelCount,
    disabledTemplate,
    reasons,
  };
}

export function matchesTaskRiskFilter(summary: PushTaskRiskSummary, filter: PushTaskRiskFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "risk") {
    return summary.hasRisk;
  }

  if (filter === "failing") {
    return summary.failureCount > 0;
  }

  return summary.disabledTemplate || summary.disabledChannelCount > 0;
}

export function getRetryableRecords(records: PushRecord[]) {
  return records.filter((record) => record.status === "failed");
}
