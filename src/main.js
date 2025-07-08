import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

// Platformer Game Setup
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 400;
document.body.innerHTML = '';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Player properties
const player = {
  x: 50,
  y: 300,
  width: 32,
  height: 32,
  vx: 0,
  vy: 0,
  speed: 3,
  jumpPower: 10,
  onGround: false
};

// Platform properties
const platforms = [
  { x: 0, y: 370, width: 640, height: 30 },
  { x: 200, y: 300, width: 120, height: 20 },
  { x: 400, y: 250, width: 100, height: 20 }
];

// Add coins
const coins = [
  { x: 250, y: 270, radius: 10, collected: false },
  { x: 430, y: 220, radius: 10, collected: false },
  { x: 100, y: 340, radius: 10, collected: false }
];
let score = 0;

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function update() {
  // Horizontal movement
  if (keys['ArrowLeft']) player.vx = -player.speed;
  else if (keys['ArrowRight']) player.vx = player.speed;
  else player.vx = 0;

  // Jump
  if (keys['Space'] && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }

  // Gravity
  player.vy += 0.5;

  // Move player
  player.x += player.vx;
  player.y += player.vy;

  // Platform collision (improved: block from all sides)
  player.onGround = false;
  for (const p of platforms) {
    // Calculate previous position
    const prevX = player.x - player.vx;
    const prevY = player.y - player.vy;
    // AABB collision
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y < p.y + p.height &&
      player.y + player.height > p.y
    ) {
      // From above
      if (prevY + player.height <= p.y) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
      // From below
      else if (prevY >= p.y + p.height) {
        player.y = p.y + p.height;
        player.vy = 0;
      }
      // From left
      else if (prevX + player.width <= p.x) {
        player.x = p.x - player.width;
        player.vx = 0;
      }
      // From right
      else if (prevX >= p.x + p.width) {
        player.x = p.x + p.width;
        player.vx = 0;
      }
    }
  }

  // Coin collection
  for (const coin of coins) {
    if (!coin.collected) {
      const dx = player.x + player.width / 2 - coin.x;
      const dy = player.y + player.height / 2 - coin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.width / 2 + coin.radius) {
        coin.collected = true;
        score++;
      }
    }
  }

  // Prevent falling through floor
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Prevent player from going out of bounds (left/right)
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
    player.vx = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw player
  ctx.fillStyle = '#4fc3f7';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Draw platforms
  ctx.fillStyle = '#888';
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
  // Draw coins
  for (const coin of coins) {
    if (!coin.collected) {
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'gold';
      ctx.fill();
      ctx.strokeStyle = '#bfa600';
      ctx.stroke();
    }
  }
  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
