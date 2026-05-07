const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOver = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');

const headImg = new Image();
headImg.src = 'assets/benzi-head.png';

const titleImg = new Image();
titleImg.src = 'assets/title-screen.png';

let state = 'menu';
let keys = {};
let cameraX = 0;
let score = 0;
let cansLeft = 0;
let time = 0;

const gravity = 0.65;
const worldWidth = 3100;

const player = {
  x: 90, y: 250, w: 54, h: 82,
  vx: 0, vy: 0,
  speed: 4.2, jump: 14,
  onGround: false,
  dir: 1
};

const platforms = [
  {x: 0, y: 482, w: 650, h: 58},
  {x: 740, y: 435, w: 250, h: 45},
  {x: 1080, y: 382, w: 240, h: 45},
  {x: 1410, y: 455, w: 360, h: 45},
  {x: 1880, y: 390, w: 300, h: 45},
  {x: 2280, y: 465, w: 350, h: 45},
  {x: 2700, y: 420, w: 360, h: 45}
];

const cans = [
  {x: 260, y: 420, got: false}, {x: 380, y: 420, got: false},
  {x: 815, y: 370, got: false}, {x: 920, y: 370, got: false},
  {x: 1160, y: 315, got: false}, {x: 1260, y: 315, got: false},
  {x: 1515, y: 390, got: false}, {x: 1650, y: 390, got: false},
  {x: 1990, y: 325, got: false}, {x: 2090, y: 325, got: false},
  {x: 2390, y: 405, got: false}, {x: 2540, y: 405, got: false},
  {x: 2840, y: 360, got: false}, {x: 2980, y: 360, got: false}
];

const enemies = [
  {x: 560, y: 446, w: 42, h: 36, vx: -1.2, min: 440, max: 620},
  {x: 1540, y: 419, w: 42, h: 36, vx: 1.1, min: 1440, max: 1720},
  {x: 2390, y: 429, w: 42, h: 36, vx: -1.3, min: 2300, max: 2590}
];

function resetGame() {
  player.x = 90; player.y = 250; player.vx = 0; player.vy = 0; player.onGround = false;
  cameraX = 0; score = 0; time = 0;
  cans.forEach(c => c.got = false);
  cansLeft = cans.length;
}

function startGame() {
  resetGame();
  state = 'playing';
  menu.classList.remove('active');
  gameOver.classList.remove('active');
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if ([' ', 'arrowup', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  time += 1/60;
  const left = keys['a'] || keys['arrowleft'];
  const right = keys['d'] || keys['arrowright'];
  const jump = keys['w'] || keys[' '] || keys['arrowup'];

  player.vx = 0;
  if (left) { player.vx = -player.speed; player.dir = -1; }
  if (right) { player.vx = player.speed; player.dir = 1; }
  if (jump && player.onGround) { player.vy = -player.jump; player.onGround = false; }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    if (player.x + player.w > p.x && player.x < p.x + p.w &&
        player.y + player.h > p.y && player.y + player.h - player.vy <= p.y) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  player.x = Math.max(0, Math.min(worldWidth - player.w, player.x));
  cameraX = Math.max(0, Math.min(worldWidth - canvas.width, player.x - 250));

  for (const c of cans) {
    if (!c.got && rectsOverlap(player, {x: c.x, y: c.y, w: 34, h: 42})) {
      c.got = true;
      score += 10;
      cansLeft--;
    }
  }

  for (const e of enemies) {
    e.x += e.vx;
    if (e.x < e.min || e.x > e.max) e.vx *= -1;
    if (rectsOverlap(player, e)) endGame('BENZI JE PAO U BLEJU');
  }

  if (player.y > 620) endGame('BENZI JE PAO');
  if (player.x > 3000 && cansLeft === 0) endGame('POBEDA!');
}

function endGame(title) {
  state = 'over';
  document.getElementById('gameOverTitle').textContent = title;
  finalScore.textContent = `Score: ${score}`;
  gameOver.classList.add('active');
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#16a8ff');
  g.addColorStop(1, '#96ecff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,.85)';
  drawCloud(120 - cameraX * .2, 90, 1);
  drawCloud(520 - cameraX * .2, 70, .8);
  drawCloud(850 - cameraX * .2, 130, .7);
  drawCloud(1300 - cameraX * .2, 80, 1);

  ctx.fillStyle = '#3cc26b';
  drawHill(120 - cameraX * .35, 482, 260, 160);
  drawHill(520 - cameraX * .35, 482, 320, 210);
  drawHill(1080 - cameraX * .35, 482, 330, 180);
  drawHill(1750 - cameraX * .35, 482, 360, 220);
  drawHill(2350 - cameraX * .35, 482, 300, 190);
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 26*s, 0, Math.PI*2);
  ctx.arc(x+28*s, y-14*s, 34*s, 0, Math.PI*2);
  ctx.arc(x+62*s, y, 28*s, 0, Math.PI*2);
  ctx.arc(x+32*s, y+10*s, 32*s, 0, Math.PI*2);
  ctx.fill();
}

function drawHill(x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x+w/2, y-h, x+w, y);
  ctx.closePath();
  ctx.fill();
}

function drawPlatforms() {
  for (const p of platforms) {
    const x = p.x - cameraX;
    ctx.fillStyle = '#7b3e12';
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = '#3bc83b';
    ctx.fillRect(x, p.y, p.w, 16);
    ctx.strokeStyle = '#184b12';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, p.y, p.w, p.h);
    for (let i = 0; i < p.w; i += 38) {
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.beginPath();
      ctx.arc(x+i+18, p.y+32, 12, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function drawCan(x, y) {
  x -= cameraX;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#0a9b45';
  ctx.strokeStyle = '#083d1f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(0, 0, 34, 42, 7);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f8e58a';
  ctx.beginPath(); ctx.ellipse(17, 21, 14, 11, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PIVO', 17, 25);
  ctx.fillStyle = '#e9e9e9';
  ctx.fillRect(7, -2, 20, 5);
  ctx.restore();
}

function drawEnemy(e) {
  const x = e.x - cameraX;
  ctx.fillStyle = '#8b3a12';
  ctx.beginPath();
  ctx.roundRect(x, e.y, e.w, e.h, 10);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x+13, e.y+13, 6, 0, Math.PI*2); ctx.arc(x+29, e.y+13, 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x+14, e.y+14, 2, 0, Math.PI*2); ctx.arc(x+30, e.y+14, 2, 0, Math.PI*2); ctx.fill();
}

function drawPlayer() {
  const x = player.x - cameraX;
  const y = player.y;
  ctx.save();
  ctx.translate(x + player.w/2, y + player.h/2);
  ctx.scale(player.dir, 1);

  ctx.fillStyle = '#246cff';
  ctx.fillRect(-20, 8, 40, 38);
  ctx.fillStyle = '#111';
  ctx.fillRect(-22, 42, 16, 18);
  ctx.fillRect(6, 42, 16, 18);
  ctx.fillStyle = '#ffd24b';
  ctx.fillRect(-30, 12, 12, 28);
  ctx.fillRect(18, 12, 12, 28);

  ctx.beginPath();
  ctx.arc(0, -22, 34, 0, Math.PI*2);
  ctx.clip();
  ctx.drawImage(headImg, -38, -60, 76, 76);
  ctx.restore();

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + player.w/2, y + 19, 35, 0, Math.PI*2);
  ctx.stroke();
}

function drawHud() {
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(18, 16, 220, 52);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Limenke: ${score/10}/${cans.length}`, 32, 50);
}

function drawMenuBackground() {
  if (titleImg.complete) ctx.drawImage(titleImg, 0, 0, canvas.width, canvas.height);
  else drawBackground();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (state === 'menu') {
    drawMenuBackground();
    return;
  }
  drawBackground();
  drawPlatforms();
  cans.forEach(c => { if (!c.got) drawCan(c.x, c.y); });
  enemies.forEach(drawEnemy);
  drawPlayer();
  drawHud();

  ctx.fillStyle = '#111';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('CILJ →', 2850 - cameraX, 340);
}

function loop() {
  if (state === 'playing') update();
  draw();
  requestAnimationFrame(loop);
}
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

function bindButton(btn, key) {
  if (!btn) return;

  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    keys[key] = true;
  });

  btn.addEventListener('pointerup', e => {
    e.preventDefault();
    keys[key] = false;
  });

  btn.addEventListener('pointerleave', () => {
    keys[key] = false;
  });
}

bindButton(leftBtn, 'a');
bindButton(rightBtn, 'd');
bindButton(jumpBtn, 'w');

loop();
