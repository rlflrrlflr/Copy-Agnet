# 소재냥인 인계서 (→ Warp / 타 에이전트용)

## 프로젝트 한 줄
퍼포먼스 마케터용 DA 배너 기획·제작 툴. 단일 HTML(무CDN·바닐라JS), 4단계: 브리프→카피→기획(캔버스 에디터)→완성(AI 생성). 텍스트=Gemini 3.1 Pro, 이미지=Nano Banana Pro(gemini-3-pro-image-preview, 2K).

## 히스토리 경로 (전부)
| 무엇 | 어디 |
|---|---|
| **코드 리포** | github.com/rlflrrlflr/Copy-Agnet · 브랜치 `claude/fervent-mccarthy-67gjks` (98+커밋, 커밋 메시지=라운드 단위) |
| **라운드별 무엇/왜 기록** | `변경이력.md` (v27→현재 40차까지, 각 수정의 증상·원인·검증 기록 — **가장 먼저 읽을 것**) |
| **아키텍처 판단 기록** | `제로베이스_개선안.md`(33차) · `제로베이스_개선안_v2.md`(39차 — 트릴레마 진단·재스탬프·실무 조사) |
| **과거 인계서** | `v27_Code인계서.md`(Cowork→Code 전환점) · `v29_재설계_노트.md` · `사용성_평가.md` |
| **버전 스냅샷** | `v30_07~32_studio.html`, `v31_34~38_studio.html`, `v32_39~40_studio.html` (라운드별 동결본) · canonical: `v30/v31/v32_studio.html` |
| **테스트(재현 가능한 사양서)** | `_test_*.js` 60여 종 — puppeteer 헤드리스, `node _test_v32.js`로 실행. 각 파일이 해당 라운드의 요구사항 명세 역할 |
| **v1~v26 (이 리포에 없음)** | 로컬 OneDrive: `C:\Users\seokwoo.kang\OneDrive - Performance by TBWA\바탕 화면\Claude Cowork\카피 엔진 제작` (vN_copy_engine.html 계열, "Cowork" 시절) |
| **실무 맥락** | 사내 Slack #pm-creation-*·#planning-creation-* (제작 요청 워크플로) · Google Drive 기획안 슬라이드(예: 알리 618 소재기획) |

Warp에서 시작: `git clone https://github.com/rlflrrlflr/Copy-Agnet && cd Copy-Agnet` → `변경이력.md` → `v32_studio.html`(현행) 순서로 읽기.

## 현재 상태 (2026-07, 40차)
- 기본 경로: 제품을 AI가 씬에 자연 합성 + 비전 동질성 게이트(`Engine.productCheck`)+1회 재시도. 제품 레이어(원본 픽셀 보존)는 "🔒 제품을 레이어로" 옵트인.
- 4단계: 정밀(기획안 배치 준수) / 크리에이티브(자유 재해석) 듀얼 모드.
- 미해결 핵심 문제: **작은 한글(제품 라벨·미세 카피)이 이미지 생성 시 확률적으로 깨짐.** 게이트로 관리 중이나 근본 해결 아님.

## GPT-Image 2 실험 가이드 (웹 확인: 2026-07 기준 실재, 확정 방향)
모델: `gpt-image-2` · 엔드포인트: `images.generate`(생성) / `images.edit`(편집+마스크)
1. **최우선 실험 — 마스크 인페인팅으로 '융합' 부활**: `images.edit`는 마스크 기반 인페인팅을 지원하며 **마스크 밖 영역은 픽셀 그대로 보존**(API 보장 — Gemini에 없는 기능). v32에서 실패한 융합(제품 불변+주변 그림자만)을 이걸로 재구현: [씬+제품 합성본] + [제품 영역만 보호하는 마스크] + "add contact shadow/reflection around the product" 프롬프트. 39차 재스탬프 설계(`제로베이스_개선안_v2.md`)가 API 보장으로 성립. ※ 마스크 극성(흰색=편집영역 vs 투명=편집영역)은 공식 문서로 재확인 후 사용 — gpt-image-1 시절 마스크가 전체를 다시 그리던 이슈 리포트가 있었으니 gpt-image-2에서 소규모 검증 먼저.
2. **한글 텍스트 A/B**: gpt-image-2는 텍스트 렌더 정확도가 크게 개선됐다고 알려짐(벤더 주장 ~99%, 검증 필요). 이 리포 `Engine._finalPrompt` 출력물을 그대로 이식해 Nano Banana Pro와 같은 카피로 A/B — 특히 작은 한글 라벨·서브카피가 진짜 기준.
3. **멀티 레퍼런스**: `images.edit`가 복수 참조 이미지+프롬프트를 받음 → 상품컷+KV+레퍼런스를 함께 넣는 현재 `_imgParts` 구조 이식 가능. 해상도도 고정 비율 제한 없이 유연.
4. **연동 지점**: `Engine._geminiImageOnce` 1곳에 provider 분기(+ `Engine._tfetch` 워치독 재사용). 텍스트(카피)는 기존 Claude/Gemini 유지 가능. 브라우저 직접 fetch는 OpenAI CORS 정책 확인(안 되면 로컬 프록시).
5. **검증 루틴 유지**: 같은 productCheck 게이트·엣지 게이트를 gpt-image-2 결과에도 적용해 모델 교체 효과를 수치로 비교(`변경이력.md` 라운드 형식으로 기록).

## 불변 규칙 (지키던 것)
단일 HTML·무CDN 유지 / 라운드마다: 재현 테스트 먼저→수정→전체 회귀→`변경이력.md` 기록→번호 스냅샷→커밋·푸시 / API 키는 코드·리포에 절대 커밋 금지 / 큰 구조 변경은 vN+1 포크(이전 버전 무변경 보존).
