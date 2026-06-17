# Copy-Agnet

Claude Code 기반 개인 작업 환경(workspace) 저장소입니다.

## 개요

이 저장소는 [Claude Code](https://claude.com/claude-code)를 활용한 작업 공간으로,
여러 플러그인을 설치해 코드 이해 · 자동화 · 영상 분석 등의 작업을 수행할 수 있도록 구성되어 있습니다.

## 작업 환경

| 항목 | 내용 |
| --- | --- |
| OS | Windows 11 Pro |
| Shell | PowerShell |
| 주 도구 | Claude Code (CLI) |
| 경로 | `C:\dev\Copy-Agnet` |

## 설치된 플러그인

`.claude/settings.json`에 활성화된 플러그인 목록입니다.

- **watch** (`claude-video`) — 영상(URL/로컬)을 다운로드·프레임 추출·자막/Whisper 전사 후 내용을 분석
- **superpowers** (`claude-plugins-official`) — 브레인스토밍, 계획 수립, TDD, 체계적 디버깅 등 개발 워크플로 스킬 모음
- **understand-anything** (`understand-anything`) — 코드베이스를 분석해 아키텍처·구성요소 관계를 인터랙티브 지식 그래프로 시각화

## 디렉터리 구조

```
Copy-Agnet/
├── .claude/
│   └── settings.json   # 활성화된 플러그인 설정
└── README.md           # 이 문서
```

## 시작하기

```bash
# 저장소 클론
git clone https://github.com/rlflrrlflr/Copy-Agnet.git
cd Copy-Agnet

# Claude Code 실행
claude
```

플러그인을 적용하려면 Claude Code 내에서 `/reload-plugins`를 실행하세요.
