/**
 * capture.mjs — 카드뉴스 단일 PNG 출력 스크립트
 *
 * 사용법:
 *   1) 로컬 서버 실행:  python3 -m http.server 8080
 *   2) 캡처 실행:       node capture.mjs
 *
 * 출력:
 *   export/png/01-moav.png ~ 13-moav.png  (카드별 개별 PNG)
 *   export/moav-final.png                  (전체 병합 단일 PNG)
 *
 * 전제조건:
 *   npm install playwright  (최초 1회)
 *   npx playwright install chromium  (최초 1회)
 *   brew install imagemagick  (병합에 필요)
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:8000/cardnews.html';
const OUT_DIR = join(__dirname, 'export', 'png');
const FINAL_PNG = join(__dirname, 'export', 'moav-final.png');

// HTML 순서와 동일한 카드 목록
const CARDS = [
  { sel: '.c1',    name: '01-moav' },
  { sel: '.c2',    name: '02-moav' },
  { sel: '.c3',    name: '03-moav' },
  { sel: '.cA',    name: '04-moav' },
  { sel: '.cB',    name: '05-moav' },
  { sel: '.cC',    name: '06-moav' },
  { sel: '.c4',    name: '07-moav' },
  { sel: '.c5',    name: '08-moav' },
  { sel: '.cD',    name: '09-moav' },
  { sel: '.c7',    name: '10-moav' },
  { sel: '.c8-v2', name: '11-moav' },
  { sel: '.c9',    name: '12-moav' },
  { sel: '.cREV',  name: '13-moav' },
  { sel: '.c10',   name: '14-moav' },
];

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  // deviceScaleFactor 2 = 2× 해상도 (1720×2400px per card)
  const page = await browser.newPage({
    deviceScaleFactor: 2,
  });

  await page.setViewportSize({ width: 900, height: 1200 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 폰트 완전 로드 대기
  await page.waitForTimeout(2000);

  // PNG에 포함되면 안 되는 UI 요소 숨기기
  await page.evaluate(() => {
    const hide = ['#export-btn', '.top-label'];
    hide.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    });
  });

  // 각 카드 캡처
  for (const { sel, name } of CARDS) {
    const outPath = join(OUT_DIR, `${name}.png`);
    const el = page.locator(`.card${sel}`).first();
    await el.screenshot({ path: outPath, type: 'png' });
    console.log(`✓ ${name}.png`);
  }

  await browser.close();
  console.log(`\n카드 ${CARDS.length}장 캡처 완료 → ${OUT_DIR}`);

  // ImageMagick으로 수직 병합 → 단일 PNG
  try {
    execSync('which convert', { stdio: 'ignore' });
    const files = CARDS.map(c => `"${join(OUT_DIR, c.name + '.png')}"`).join(' ');
    execSync(`convert ${files} -append "${FINAL_PNG}"`);
    console.log(`\n✅ 최종 단일 PNG → ${FINAL_PNG}`);
  } catch {
    console.log('\n⚠️  ImageMagick 미설치 — 개별 PNG만 저장됨');
    console.log('병합하려면: brew install imagemagick 후 다시 실행');
    console.log('\n수동 병합 명령어:');
    const files = CARDS.map(c => `export/png/${c.name}.png`).join(' \\\n  ');
    console.log(`convert \\\n  ${files} \\\n  -append export/moav-final.png`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
