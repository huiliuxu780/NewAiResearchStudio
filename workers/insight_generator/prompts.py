INSIGHT_GENERATION_PROMPT = """你是一位专业的投资研究分析师。请根据以下标准化事实生成研究结论。

## 输入信息

### 公司：{company}
### 时间范围：{time_range}

### 标准化事实列表：
{facts_text}

## 输出要求

请生成1-3条研究结论，每条结论必须包含以下字段：
1. insight_content: 结论内容（简洁明了的研究洞察）
2. insight_type: 结论类型（可选值：competitive_advantage, risk_warning, growth_opportunity, operational_efficiency, market_position）
3. impact_level: 影响级别（可选值：high, medium, low）
4. confidence: 置信度（可选值：high, medium, low）
5. reasoning_brief: 推理简述（简要说明得出该结论的依据）
6. action_suggestion: 行动建议（针对该结论的建议行动）

## 输出格式

请严格按照以下JSON格式输出，不要添加任何其他文字：

```json
{{
  "insights": [
    {{
      "insight_content": "结论内容",
      "insight_type": "结论类型",
      "impact_level": "影响级别",
      "confidence": "置信度",
      "reasoning_brief": "推理简述",
      "action_suggestion": "行动建议"
    }}
  ]
}}
```

## 注意事项

1. 结论必须基于提供的事实，不要臆测
2. 每条结论应该有明确的商业价值
3. 影响级别和置信度要客观评估
4. 行动建议要具体可执行
"""


def format_facts_for_prompt(facts: list[dict]) -> str:
    formatted = []
    for i, fact in enumerate(facts, 1):
        text = f"""
事实 {i}:
- 公司: {fact.get('company', 'N/A')}
- 摘要: {fact.get('fact_summary', 'N/A')}
- 主题: {fact.get('topic_level_1', 'N/A')} / {fact.get('topic_level_2', 'N/A')}
- 事件类型: {fact.get('event_type', 'N/A')}
- 实体类型: {fact.get('entity_type', 'N/A')}
- 实体名称: {fact.get('entity_name', 'N/A')}
- 重要性: {fact.get('importance_level', 'N/A')}
- 能力级别: {fact.get('capability_level', 'N/A')}
- 置信度: {fact.get('confidence', 'N/A')}
- 发布时间: {fact.get('published_at', 'N/A')}
- 来源: {fact.get('source_url', 'N/A')}
"""
        formatted.append(text)
    return "\n".join(formatted)


def build_insight_prompt(facts: list[dict], company: str, time_range: str = "近30天") -> str:
    facts_text = format_facts_for_prompt(facts)
    return INSIGHT_GENERATION_PROMPT.format(
        company=company,
        time_range=time_range,
        facts_text=facts_text,
    )