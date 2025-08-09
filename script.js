(() => {
  const TILE = 32;
  const W = 20, H = 15;

  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  cvs.width = W * TILE;
  cvs.height = H * TILE;
  ctx.imageSmoothingEnabled = false;

  const assets = {};
  const assetList = [
    'assets/floor.png', 'assets/wall.png', 'assets/door_locked.png',
    'assets/exit.png', 'assets/key.png', 'assets/prisoner.png', 'assets/guard.png'
  ];
  let loaded = 0;

  assetList.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => { if (++loaded === assetList.length) start(); };
    assets[src] = img;
  });

  const map = [
    "####################",
    "#.............#....E",
    "#..######.....#.....",
    "#.............#.....",
    "#....P........#.....",
    "#.............#.....",
    "#.............#.....",
    "######..############",
    "#.............#.....",
    "#.....K.......#.....",
    "#.............#.....",
    "#.............#.....",
    "#.............#.....",
    "#.............#.....",
    "####################"
  ];

  const state = {
    player: { x: 4, y: 4, speed: 4, hasKey: false },
    guards: [
      { x: 10, y: 4, dir: 1, range: 5 },
      { x: 6, y: 10, dir: 0, range: 5 }
    ],
    paused: false
  };

  const keys = {};
  window.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') state.paused = !state.paused;
    keys[e.key] = true;
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  function canMove(x, y) {
    if (map[Math.floor(y)][Math.floor(x)] === '#') return false;
    return true;
  }

  function update(dt) {
    if (state.paused) return;
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w']) dy = -1;
    if (keys['ArrowDown'] || keys['s']) dy = 1;
    if (keys['ArrowLeft'] || keys['a']) dx = -1;
    if (keys['ArrowRight'] || keys['d']) dx = 1;
    const len = Math.hypot(dx, dy);
    if (len) {
      dx /= len; dy /= len;
      const nx = state.player.x + dx * state.player.speed * dt;
      const ny = state.player.y + dy * state.player.speed * dt;
      if (canMove(nx, state.player.y)) state.player.x = nx;
      if (canMove(state.player.x, ny)) state.player.y = ny;
    }

    // איסוף מפתח
    if (!state.player.hasKey && map[Math.floor(state.player.y)][Math.floor(state.player.x)] === 'K') {
      state.player.hasKey = true;
    }

    // פתיחת דלת
    if (state.player.hasKey && map[Math.floor(state.player.y)][Math.floor(state.player.x)] === 'P') {
      map[Math.floor(state.player.y)] = map[Math.floor(state.player.y)].replace('P', '.');
    }

    // יציאה
    if (map[Math.floor(state.player.y)][Math.floor(state.player.x)] === 'E') {
      alert("ניצחת! ברחת מהכלא 🎉");
      reset();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tile = map[y][x];
        if (tile === '#') ctx.drawImage(assets['assets/wall.png'], x*TILE, y*TILE, TILE, TILE);
        else ctx.drawImage(assets['assets/floor.png'], x*TILE, y*TILE, TILE, TILE);

        if (tile === 'P') ctx.drawImage(assets['assets/door_locked.png'], x*TILE, y*TILE, TILE, TILE);
        if (tile === 'E') ctx.drawImage(assets['assets/exit.png'], x*TILE, y*TILE, TILE, TILE);
        if (tile === 'K') ctx.drawImage(assets['assets/key.png'], x*TILE, y*TILE, TILE, TILE);
      }
    }
    ctx.drawImage(assets['assets/prisoner.png'], state.player.x*TILE, state.player.y*TILE, TILE, TILE);
    state.guards.forEach(g => {
      ctx.drawImage(assets['assets/guard.png'], g.x*TILE, g.y*TILE, TILE, TILE);
    });
  }

  function reset() {
    state.player.x = 4;
    state.player.y = 4;
    state.player.hasKey = false;
  }

  function start() {
    let last = performance.now();
    function loop(ts) {
      const dt = (ts - last) / 1000;
      last = ts;
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }
    loop(last);
  }
})();
