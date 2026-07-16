# A/B 벤치 — 꾸준한 품질 테스트 루프
1회 실행 = 같은 한글 카피로 Gemini vs gpt-image-2 나란히 생성 + 마스크 극성 프로브 + HTML 리포트.

```bash
GEMINI_API_KEY=... OPENAI_API_KEY=... node bench/bench.mjs        # 전체
OPENAI_API_KEY=... node bench/bench.mjs --only=mask               # 마스크 프로브만(최우선 실험)
```
- 결과: `bench/out/<시각>/report.html` — 오탈자·작은 라벨 판독성을 눈으로, 엣지 점수는 참고용.
- 시나리오 추가: `bench/scenarios.json`에 실제 캠페인 카피를 계속 쌓으세요(회귀 벤치가 됨).
- 서버에선 cron으로 주기 실행 + out/ 폴더를 정적 서빙하면 팀이 링크로 확인 가능.
- 키는 항상 환경변수로 — 코드/리포에 절대 커밋 금지.
