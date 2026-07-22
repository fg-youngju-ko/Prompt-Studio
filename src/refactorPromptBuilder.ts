export interface RefactorPromptInput {
  target: string;
  reason: string;
}

export function buildRefactorPrompt(input: RefactorPromptInput): string {
  const reasonSection = input.reason.trim() || '(특별한 문제점 언급 없음)';

  return `# 리팩토링 대상
${input.target}

# 리팩토링하려는 이유 / 현재 문제점
${reasonSection}

# 리팩토링 원칙
- 동작 유지: 현재 동작(기능)은 그대로 유지하고 구조만 개선한다.
- 기존 구조 분석: 먼저 현재 구조를 파악하고 문제점을 정리한다.
- 더 좋은 구조 제안: 더 나은 구조가 있다면 구체적으로 제안한다.
- 사용자 승인 후 수정: 제안에 대해 승인을 받은 뒤에만 실제로 코드를 수정한다.
- 점진적 수정: 한 번에 너무 많이 바꾸지 않고, 필요한 범위만 수정한다.
- 테스트 수행: 리팩토링 후 기존 동작이 그대로인지 테스트한다.
- 변경 내용 요약: 무엇을 어떻게 바꿨는지 간단히 요약한다.

# 요청
위 대상을 리팩토링하고 싶습니다. 먼저 현재 구조를 분석하고, 더 좋은 구조가 있다면 제안해 주세요. 제 승인 후에 실제 수정을 시작해 주세요.`;
}
