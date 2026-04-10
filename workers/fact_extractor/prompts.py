FACT_EXTRACTION_PROMPT = """你是一位专业的投资研究分析师。请从以下原始内容中抽取标准化事实。

## 输入信息

### 公司：{company}
### 来源类型：{source_type}

### 原始内容：
{raw_content}

## 输出要求

请抽取1-5条标准化事实，每条事实必须包含以下字段：
1. fact_summary: 事实摘要（简洁明了的事实描述，不超过200字）
2. topic_level_1: 一级主题（可选值：产品技术, 商业模式, 市场竞争, 组织管理, 财务表现, 法律合规, 其他）
3. topic_level_2: 二级主题（根据一级主题细分，如产品技术下可分为：产品发布, 技术突破, 研发投入, 专利申请等）
4. event_type: 事件类型（可选值：发布, 更新, 收购, 投资, 合作, 竞争, 人事变动, 财务报告, 法律诉讼, 监管处罚, 其他）
5. entity_type: 实体类型（可选值：公司, 产品, 技术, 人物, 市场, 行业, 其他）
6. entity_name: 实体名称（具体的公司名、产品名、技术名、人物名等）
7. importance_level: 重要性级别（可选值：high, medium, low）
8. confidence: 置信度（可选值：high, medium, low）

## 输出格式

请严格按照以下JSON格式输出，不要添加任何其他文字：

```json
{{
  "facts": [
    {{
      "fact_summary": "事实摘要",
      "topic_level_1": "一级主题",
      "topic_level_2": "二级主题",
      "event_type": "事件类型",
      "entity_type": "实体类型",
      "entity_name": "实体名称",
      "importance_level": "重要性级别",
      "confidence": "置信度"
    }}
  ]
}}
```

## 注意事项

1. 事实必须基于原文内容，不要臆测或添加信息
2. 每条事实应该是独立、完整的信息单元
3. 重要性级别判断标准：
   - high: 对公司战略、财务、市场地位有重大影响
   - medium: 有一定影响但非核心
   - low: 信息性内容，影响较小
4. 置信度判断标准：
   - high: 原文明确陈述，无歧义
   - medium: 原文有相关描述，但需要一定推断
   - low: 信息不完整或存在不确定性
5. 如果原文内容无法抽取有效事实，返回空数组：{{"facts": []}}
"""


def build_extraction_prompt(raw_content: str, company: str, source_type: str) -> str:
    return FACT_EXTRACTION_PROMPT.format(
        company=company,
        source_type=source_type,
        raw_content=raw_content,
    )