/**
 * Caelis Galeria — Instagram Reels Promo Video Generator v2
 * 
 * Uses local HTTP server for proper rendering (fixes file:// directory listing issue)
 * Style: Minimalist black & white, slow immersive scrolling
 * Output: 1080×1920 (Instagram Reels / TikTok vertical)
 * 
 * Usage: node scripts/generate-promo-video.js
 */

const puppeteer = require('puppeteer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── Config ──
const SITE_DIR = path.resolve(__dirname, '../_site');
const OUTPUT_DIR = path.resolve(__dirname, '../_promo');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'frames');
const FINAL_VIDEO = path.join(OUTPUT_DIR, 'caelis-instagram-reel.mp4');
const PORT = 8765;
const BASE_URL = `http://localhost:${PORT}`;

// Video config
const WIDTH = 1080;
const HEIGHT = 1920;   // 9:16 vertical for Instagram Reels
const FPS = 30;

// ── Scene definitions ──
const SCENES = [
  {
    name: 'Hero - Homepage',
    url: '/',
    duration: 5000,
    actions: [
      { type: 'wait', ms: 2000 },
      { type: 'evaluate', fn: () => {
        const slide = document.querySelector('.hero-slide.opacity-100');
        if (slide) {
          const img = slide.querySelector('[style*="background-image"]');
          if (img) { img.style.transition = 'transform 4s ease-out'; img.style.transform = 'scale(1.08)'; }
        }
      }},
      { type: 'wait', ms: 3000 },
    ],
  },
  {
    name: 'Scroll - Current Exhibitions',
    url: '/',
    duration: 6000,
    actions: [
      { type: 'wait', ms: 1000 },
      { type: 'scroll', fromY: 0, toY: 1400, duration: 4000 },
      { type: 'wait', ms: 1000 },
    ],
  },
  {
    name: 'Exhibitions Page',
    url: '/exhibitions/',
    duration: 5000,
    actions: [
      { type: 'wait', ms: 1500 },
      { type: 'scroll', fromY: 0, toY: 1200, duration: 3000 },
      { type: 'wait', ms: 500 },
    ],
  },
  {
    name: 'Art Insight - Santa Fe',
    url: '/art-insight/santa-fe-artfair-2025/',
    duration: 5000,
    actions: [
      { type: 'wait', ms: 1500 },
      { type: 'scroll', fromY: 0, toY: 2400, duration: 3500 },
    ],
  },
  {
    name: 'Art Insight - LA Art Show',
    url: '/art-insight/la-art-show-2025/',
    duration: 5000,
    actions: [
      { type: 'wait', ms: 1500 },
      { type: 'scroll', fromY: 0, toY: 2000, duration: 3500 },
    ],
  },
  {
    name: 'About Page',
    url: '/about/',
    duration: 5000,
    actions: [
      { type: 'wait', ms: 1500 },
      { type: 'scroll', fromY: 0, toY: 2000, duration: 3500 },
    ],
  },
];

// ── Utilities ──
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function smoothScroll(page, startY, endY, duration) {
  const steps = Math.ceil(duration / 16);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await page.evaluate((y) => window.scrollTo(0, y), startY + (endY - startY) * ease);
    await sleep(16);
  }
}

async function captureScene(page, scene, frameDir, startFrame) {
  const url = `${BASE_URL}${scene.url}`;
  console.log(`\n🎬 Scene: ${scene.name}`);
  console.log(`   URL: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
  await sleep(800);
  
  for (const action of scene.actions) {
    switch (action.type) {
      case 'wait': await sleep(action.ms); break;
      case 'scroll': await smoothScroll(page, action.fromY, action.toY, action.duration); break;
      case 'evaluate': await page.evaluate(action.fn); break;
    }
  }
  
  const totalFrames = Math.round((scene.duration / 1000) * FPS);
  console.log(`   Capturing ${totalFrames} frames (${scene.duration}ms @ ${FPS}fps)`);
  
  for (let i = 0; i < totalFrames; i++) {
    const framePath = path.join(frameDir, `frame_${String(startFrame + i).padStart(6, '0')}.png`);
    await page.screenshot({
      path: framePath, type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    if ((i + 1) % FPS === 0) process.stdout.write(`   ⏱ ${(i+1)/FPS}s/${scene.duration/1000}s\r`);
  }
  console.log(`   ✅ ${totalFrames} frames captured`);
  return startFrame + totalFrames;
}

function startServer() {
  return new Promise((resolve) => {
    // Must cwd to SITE_DIR for python http.server to serve the right files
    const server = spawn('python3', ['-m', 'http.server', String(PORT)], {
      cwd: SITE_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });
    server.stdout.on('data', () => {});
    server.stderr.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg && !msg.includes('::1')) console.log('   [server]', msg);
    });
    setTimeout(() => resolve(server), 800);
  });
}

// ── Main ──
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Caelis Galeria — Promo Video Generator  ║');
  console.log('║  Style: Minimalist B&W · Slow Immersive  ║');
  console.log('╚══════════════════════════════════════════╝');
  
  ensureDir(FRAMES_DIR);
  
  // Start local server
  console.log('\n🌐 Starting local server...');
  const server = startServer();
  console.log(`   Server running at ${BASE_URL}`);
  
  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  let frameIndex = 0;
  for (const scene of SCENES) {
    frameIndex = await captureScene(page, scene, FRAMES_DIR, frameIndex);
  }
  
  await browser.close();
  try { server.kill('SIGTERM'); } catch(e) { /* ignore */ }
  try { process.kill(server.pid, 'SIGTERM'); } catch(e2) { /* ignore */ }
  console.log('\n🖼️  All scenes captured. Compositing video...');
  
  // FFmpeg encode
  const frameCount = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.png')).length;
  const durationSec = frameCount / FPS;
  
  console.log(`⏱️  Encoding ${frameCount} frames → ${durationSec.toFixed(1)}s video...`);
  
  const ffmpegCmd = `"${ffmpegPath}" -y \
    -framerate ${FPS} \
    -i "${FRAMES_DIR}/frame_%06d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart \
    -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2" \
    "${FINAL_VIDEO}"`;
  
  execSync(ffmpegCmd, { stdio: 'inherit' });
  
  // Cleanup
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  
  const stats = fs.statSync(FINAL_VIDEO);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  
  console.log('\n✅ ────────────────────────────────────── ✅');
  console.log(`📹 Video ready: ${FINAL_VIDEO}`);
  console.log(`   Duration: ${durationSec.toFixed(1)}s | Size: ${sizeMB}MB`);
  console.log(`   Resolution: ${WIDTH}×${HEIGHT} (9:16)`);
  console.log('✅ ────────────────────────────────────── ✅\n');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
