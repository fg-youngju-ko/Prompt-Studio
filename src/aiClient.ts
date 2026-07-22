import Anthropic from '@anthropic-ai/sdk';
import { QuestionAnswer } from './ideaPromptBuilder';

const CLARIFY_SYSTEM_PROMPT = `당신은 바이브 코딩 프로젝트 기획을 도와주는 어시스턴트입니다.
사용자가 짧은 한 줄 아이디어를 주면, 프로젝트를 구체화하는 데 꼭 필요한
역질문을 한국어로 만들어 주세요.

- 질문은 3개에서 6개 사이로 만드세요.
- 대상 사용자, 플랫폼, 로그인 필요 여부, 데이터 저장 방식, 실시간 동기화 필요 여부,
  AI 기능 필요 여부 등 프로젝트 기획에 실제로 영향을 주는 질문만 만드세요.
- 각 질문은 한 문장으로, 사용자가 바로 답할 수 있도록 구체적으로 작성하세요.
- 질문 문장 안에 "(예: ...)" 같은 괄호 예시를 절대 덧붙이지 마세요. 질문 자체만 간결하게 작성하세요.
- 사용자의 아이디어 문장에 이미 답이 드러나 있는 질문이 있다면, suggestedAnswer에 그 답을
  사용자가 직접 답한 것처럼 간결하게 적으세요. 아이디어에서 추론할 수 없는 항목은
  suggestedAnswer를 빈 문자열("")로 두세요. 근거 없이 답을 지어내지 마세요.`;

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '괄호 예시 없이 간결한 질문 한 문장' },
          suggestedAnswer: {
            type: 'string',
            description: '아이디어에 이미 답이 드러나 있으면 그 답, 아니면 빈 문자열'
          }
        },
        required: ['question', 'suggestedAnswer'],
        additionalProperties: false
      },
      description: '아이디어를 구체화하기 위한 역질문 목록 (3~6개)'
    }
  },
  required: ['questions'],
  additionalProperties: false
} as const;

const SUMMARY_SYSTEM_PROMPT = `당신은 사용자의 아이디어와 질문-답변을 자연스러운 한국어 문단으로
정리하는 어시스턴트입니다.

- 질문과 답변을 그대로 나열하지 말고, 실제 사람이 자기 프로젝트를 설명하듯
  자연스럽게 이어지는 문장으로 작성하세요.
- 답변이 비어 있거나 의미 없는 항목은 무시하세요.
- 근거 없는 내용을 지어내지 말고, 주어진 아이디어와 답변에 있는 정보만 사용하세요.
- 미사여구나 군더더기 없이 핵심만 담아 3~6문장 정도로 작성하세요.
- 결과는 문단 텍스트만 출력하세요. 제목이나 목록 형식을 쓰지 마세요.`;

export interface ClarifyingQuestion {
  question: string;
  suggestedAnswer: string;
}

export async function fetchClarifyingQuestions(
  apiKey: string,
  idea: string
): Promise<ClarifyingQuestion[]> {
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

  const parsed = JSON.parse(textBlock.text) as { questions: ClarifyingQuestion[] };
  return parsed.questions;
}

export async function synthesizeProjectSummary(
  apiKey: string,
  idea: string,
  qa: QuestionAnswer[]
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const answered = qa.filter((item) => item.answer.trim().length > 0);
  const qaText = answered.map((item) => `${item.question} ${item.answer}`).join('\n');

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 512,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `아이디어: ${idea}\n\n질문과 답변:\n${qaText || '(답변 없음)'}`
      }
    ]
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return textBlock ? textBlock.text.trim() : idea;
}
