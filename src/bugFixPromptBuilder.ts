export interface BugFixPromptInput {
  symptom: string;
  errorMessage: string;
  desiredResult: string;
}

export function buildBugFixPrompt(input: BugFixPromptInput): string {
  const errorSection = input.errorMessage.trim() || '(에러 메시지 없음)';

  return `# 증상
${input.symptom}

# 에러 메시지
${errorSection}

# 원하는 결과
${input.desiredResult}

# 디버깅 원칙
- 원인 파악 우선: 증상만 보고 바로 고치지 말고, 먼저 원인을 파악한다.
- 재현 조건 확인: 어떤 상황에서 이 문제가 발생하는지 확인한다.
- 최소 수정: 문제와 관련 없는 코드는 건드리지 않는다.
- 회귀 방지: 수정 후 다른 기능이 깨지지 않았는지 확인한다.
- 테스트 수행: 수정 후 실제로 증상이 재현되지 않는지 테스트한다.
- 변경 내용 요약: 원인과 수정 내용을 간단히 요약한다.

# 요청
위 증상을 해결하고 싶습니다. 먼저 원인을 분석하고, 어떻게 고칠지 설명해 주세요. 제 승인 후에 수정을 시작해 주세요.`;
}
