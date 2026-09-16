# PIC4U (Picture + 4 + You) | 감성 네컷 사진 스튜디오

> **PIC4U**는 *"Picture for You"* — 오직 당신만을 위한 감성 네컷 사진을 완성하는 현대적인 모바일/웹 스튜디오입니다. 모바일, 태블릿, 데스크톱 어디서나 1초 만에 감성 샘플 사진으로 시작하여 나만의 레이아웃, 컬러 테마, 스티커, 문구를 커스텀하고 1200px 초고화질로 저장 및 공유할 수 있습니다.

---

## ✨ Features

* **1초 만에 바로 체험하는 감성 샘플 사진 채우기 (1-Click Demo Fill)**
  * 사진을 직접 찾을 필요 없이, 버튼 하나로 감성적인 노을, 카페, 벚꽃, 시티 나이트 사진 4장을 즉시 채워 바로 체험 가능
* **5가지 감성 프레임 레이아웃**
  * `1x4 (세로 4컷)`: 오리지널 인생네컷 스타일 (종횡비 2.9:1)
  * `2x2 (정사각 4컷)`: 인스타그램 피드 최적화 그리드 (종횡비 1.28:1)
  * `1+3 (메인1 + 보조3)`: 주인공을 돋보이게 하는 하이브리드 레이아웃
  * `2x3 (와이드 6컷)`: 다채로운 6가지 추억
  * `3x2 (파노라마 6컷)`: 넓은 시야의 6컷 그리드
* **원클릭 프레임 스타일 프리셋**
  * `[클래식 슬림]`: 가장 익숙한 슬림 프레임
  * `[폴라로이드]`: 아날로그 감성 여백
  * `[모던 라운드]`: 트렌디한 16px 둥근 모서리
  * `[보더리스 와이드]`: 사진이 가득 차는 시원한 스타일
* **8가지 PIC4U 감성 컬러 테마**
  * 인크 블랙 (Ink Black), 스튜디오 화이트 (Studio White), 웜 샌드 (Warm Sand), 세피아 필름 (Sepia Film), 블러시 로즈 (Blush Rose), 마린 틸 (Marine Teal), 뮤트 핑크 (Muted Pink), 세이지 리프 (Sage Leaf)
* **캔버스 직접 조작 플로팅 툴바 (Direct Canvas Toolbar)**
  * 캔버스에서 사진을 터치하면 그 자리에 미니멀 SVG 퀵 액션 표시:
    * `[회전]` : 90도 회전
    * `[반전]` : 좌우 거울 반전
    * `[맞춤]` : 줌 & 터치 팬 위치/구도 조정
    * `[교체]` : 새 사진으로 즉시 교체
    * `[삭제]` : 해당 슬롯 비우기
  * 비어있는 슬롯(`+`)을 터치하면 해당 슬롯에 사진이 즉시 업로드
* **아카이브 스탬프 & 스티커 꾸미기 (Stickers & Stamps)**
  * 프레임 위에 자유롭게 붙이고 드래그할 수 있는 감성 스티커 팔레트
  * `❤️`, `✨`, `🍒`, `📷`, `🍀`, `😊`, `🎀`, `☁️`, `💫`, `🐱`
* **드래그 텍스트 오버레이 & 키보드 미세 조정**
  * 메인 타이틀 & 날짜/서브 설명 각인
  * 글자 크기 `[작게]`, `[보통]`, `[크게]`, 스타일 `[심플]`, `[소프트 섀도우]`, `[외곽선 아웃라인]`
  * `[오늘 날짜 자동 입력]` 버튼
* **초고화질 인쇄 저장 & 카메라 셔터 플래시 연출**
  * 저장 시 실제 카메라가 터지는 듯한 화이트 플래시 애니메이션
  * 하단 미세 워터마크 (`PIC4U STUDIO · ARCHIVAL PRINT`) 각인
  * Web Share API (`navigator.share`) 지원 기기(iOS Safari, Android)에서 사진 앱/카카오톡으로 즉시 공유
  * 1200px 무손실 PNG 다운로드 및 모바일 롱프레스 저장 모달 지원

---

## 🛠️ Tech Stack

* **Framework / Bundler**: [Vite 6](https://vitejs.dev/)
* **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
* **Styling**: Vanilla CSS Design System (Custom Properties, Zero Runtime Overhead)
* **Graphics**: Native HTML5 Canvas 2D API (DPR Idempotent Transforms)
* **Testing**: [Vitest](https://vitest.dev/) (20개 단위 및 E2E 시뮬레이션 테스트 100% 통과)

---

## 🚀 Getting Started

```bash
git clone https://github.com/PARSA1021/picture_with_four.git
cd picture_with_four
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/`으로 접속합니다.

### Build
```bash
npm run build
```

### Test
```bash
npm run test
```

---

## 📱 Responsive & Multi-Input Support

* **Mobile (320px ~ 640px)**: 화면 하단에 고정된 `[📥 고화질 사진 저장 / 공유하기]` 플로팅 바 제공, 44px 이상 터치 타깃.
* **Desktop (820px ~ 2560px)**: 캔버스 바로 아래에 저장 버튼이 상시 배치된 스튜디오 2열 레이아웃.
* **입력 방식**: 마우스, 터치 제스처, 트랙패드, 키보드(Tab, Enter, Space, 방향키) 완벽 대응.
