# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

쿠팡 상세페이지용 카드뉴스 작업실 (MOAV 무릎보호대 Knee Strap). **최종 결과물은 단일 PNG 파일**이어야 한다.

- 기술 스택: 순수 HTML5 + CSS3 (빌드 도구, JavaScript 없음)
- 메인 파일: `cardnews.html` + `cardnews-v16.css` ← 현재 활성 CSS
- 카드 수: 13개, 각 카드 860×1200px 고정

## 실행

빌드 시스템 없음. 브라우저에서 직접 열거나 로컬 서버 사용:

```bash
python3 -m http.server 8080
# → http://localhost:8080/cardnews.html
```

## 최종 PNG 출력 방법

각 카드를 캡처하여 단일 PNG로 병합해야 한다.

**방법 1 — 브라우저 스크린샷 (권장)**
- Chrome DevTools → 각 `.card` 요소 우클릭 → "Capture node screenshot"
- 또는 puppeteer/playwright 스크립트로 자동화

**방법 2 — 기존 PNG 스티칭 (빠른 방법)**
- `export/png/`에 01~13번 카드 PNG 전체 존재 (가장 완전한 세트)
- `exports/final/`에 01~10번 카드 PNG 존재
- ImageMagick으로 수직 병합:
  ```bash
  cd export/png
  convert $(ls -v *.png) -append ../moav-final.png
  # 또는 명시적 순서:
  convert 01-moav.png 02-moav.png 03-moav.png 04-moav.png 05-moav.png \
          06-moav.png 07-moav.png 08-moav.png 09-moav.png 10-moav.png \
          11-moav.png 12-moav.png 13-moav.png -append ../moav-final.png
  ```

## 파일 버전 관리

- `cardnews.html` + `cardnews-v16.css` — **현재 작업 파일** (항상 이 파일 편집)
- `cardnews-v1.html` / `cardnews-v1.css` — 초기 버전 (참고용)
- `cardnews-print.html` — 인쇄 레이아웃 변형 (참고용)
- `exports/` — 버전별 중간 산출물 (v3, v4, v5, final, check 서브폴더)
- `export/png/` — 최신 카드별 PNG (01~13번, 현재 가장 완전)

## 카드 구조

각 카드는 공통 섹션 구조를 따른다:

```html
<section class="card c{N} [dark|blue]" data-screen-label="NN 설명">
  <div class="brand-stamp"><!-- MOAV 로고 + 텍스트 --></div>
  <div class="card-idx">N / 13</div>
  <!-- 카드별 콘텐츠 -->
</section>
```

카드 클래스 순서: `c1 → c2 → c3 → cA → cB → cC → c4 → c5 → cD → c7 → c8-v2 → c9 → c10`

## CSS 아키텍처

**핵심 변수** (`:root`에 정의):
- `--card-w: 860px`, `--card-h: 1200px` — 카드 크기 (변경 금지)
- `--blue: #1E5EFF` — 주요 강조색
- `--ink: #0A0F14` — 기본 다크 배경색

**레이아웃 방식**: 카드 내부는 `position: absolute` 기반 픽셀 단위 배치. 반응형 아님 (고정 크기 인쇄/쿠팡 최적화).

**공통 컴포넌트**:
- `.brand-stamp` — 좌상단 MOAV 브랜드 로고
- `.card-idx` — 우상단 카드 번호 (예: "01 / 13")
- `.eyebrow` — 파란색 대문자 섹션 라벨
- `.hl` — 파란색 인라인 하이라이트 텍스트

**배경 테마**:
- 라이트 카드: `c2, cA, cC, c8-v2` — 흰색/밝은 배경
- 다크 카드: `c1, c3, c5, c7, c10` — `.dark` 클래스
- 블루 카드: `c9` — `.blue` 클래스

## 이미지 에셋

- `assets/` — 제품 사진, 착용 사진 (실제 사용 이미지)
- `uploads/` — 원본 업로드 자료 (편집 소스)
- `exports/` — 버전별 내보낸 카드 PNG/JPG

## 쿠팡 상세페이지 제작 시 유의사항

- 최종 PNG 단일 파일: 모든 카드를 수직으로 이어 붙인 하나의 이미지
- 카드 너비 860px 고정 — 쿠팡 권장 너비에 맞춰 조정이 필요하면 `--card-w` 변수만 수정
- 텍스트는 이미지에 포함되므로 폰트 렌더링 품질에 주의 (브라우저 캡처 시 2× 해상도 권장)
