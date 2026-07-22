import Anthropic from '@anthropic-ai/sdk';

const CLARIFY_SYSTEM_PROMPT = `당신은 바이브 코딩 프로젝트 기획을 도와주는 어시스턴트입니다.
사용자가 짧은 한 줄 아이디어를 주면, 프로젝트를 구체화하는 데 꼭 필요한
역질문을 한국어로 만들어 주세요.

- 질문은 3개에서 6개 사이로 만드세요.
- 대상 사용자, 플랫폼, 로그인 필요 여부, 데이터 저장 방식, 실시간 동기화 필요 여부,
  AI 기능 필요 여부 등 프로젝트 기획에 실제로 영향을 주는 질문만 만드세요.
- 각 질문은 한 문장으로, 사용자가 바로 답할 수 있도록 구체적으로 작성하세요.`;

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: { type: 'string' },
      description: '아이디어를 구체화하기 위한 역질문 목록 (3~6개)'
    }
  },
  required: ['questions'],
  additionalProperties: false
} as const;

export async function fetchClarifyingQuestions(apiKey: string, idea: string): Promise<string[]> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: CLARIFY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: idea }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: QUESTIONS_SCHEMA
      }
    }
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    return [];
  }

  const parsed = JSON.parse(textBlock.text) as { questions: string[] };
  return parsed.questions;
}
