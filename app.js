const games = [
  {
    id: "snake",
    title: "Neon Snake",
    type: "Arcade",
    icon: "S",
    description: "Eat sparks, grow longer, and avoid your own trail.",
    render: renderSnake
  },
  {
    id: "pong",
    title: "Paddle Pop",
    type: "Reflex",
    icon: "P",
    description: "Classic paddle rally with smooth keyboard control.",
    render: renderPong
  },
  {
    id: "breakout",
    title: "Brick Burst",
    type: "Arcade",
    icon: "B",
    description: "Bounce the ball and clear every bright brick.",
    render: renderBreakout
  },
  {
    id: "dodger",
    title: "Meteor Dash",
    type: "Survival",
    icon: "D",
    description: "Slide through falling meteors for as long as possible.",
    render: renderDodger
  },
  {
    id: "memory",
    title: "Flip Match",
    type: "Puzzle",
    icon: "M",
    description: "Match every hidden symbol before your moves get wild.",
    render: renderMemory
  },
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    type: "Strategy",
    icon: "T",
    description: "Play X against a simple computer opponent.",
    render: renderTicTacToe
  },
  {
    id: "twenty48",
    title: "2048 Mini",
    type: "Puzzle",
    icon: "2",
    description: "Slide tiles together and chase bigger numbers.",
    render: render2048
  },
  {
    id: "mines",
    title: "Mine Peek",
    type: "Puzzle",
    icon: "!",
    description: "Reveal safe squares and dodge the hidden mines.",
    render: renderMines
  },
  {
    id: "reaction",
    title: "Quick Click",
    type: "Reflex",
    icon: "Q",
    description: "Wait for green, then click as fast as you can.",
    render: renderReaction
  },
  {
    id: "simon",
    title: "Signal Stack",
    type: "Memory",
    icon: "G",
    description: "Repeat the color pattern as it gets longer.",
    render: renderSimon
  }
];

window.games = games;

const grid = document.querySelector("#gameGrid");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#gameDialog");
const gameMount = document.querySelector("#gameMount");
const gameTitle = document.querySelector("#gameTitle");
const gameType = document.querySelector("#gameType");
const closeGame = document.querySelector("#closeGame");
const template = document.querySelector("#cardTemplate");
const favorites = new Set(JSON.parse(localStorage.getItem("pixelLoungeFavorites") || "[]"));
let activeCleanup = null;

function saveFavorites() {
  localStorage.setItem("pixelLoungeFavorites", JSON.stringify([...favorites]));
}

function renderCards() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = games.filter((game) => {
    const text = `${game.title} ${game.type} ${game.description}`.toLowerCase();
    return text.includes(query);
  });

  grid.innerHTML = "";
  matches
    .sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)))
    .forEach((game) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const favorite = card.querySelector(".favorite");
      card.querySelector(".game-icon").textContent = game.icon;
      card.querySelector(".game-tag").textContent = game.type;
      card.querySelector("h3").textContent = game.title;
      card.querySelector(".game-description").textContent = game.description;
      favorite.classList.toggle("active", favorites.has(game.id));
      favorite.textContent = favorites.has(game.id) ? "★" : "☆";
      favorite.addEventListener("click", () => {
        if (favorites.has(game.id)) favorites.delete(game.id);
        else favorites.add(game.id);
        saveFavorites();
        renderCards();
      });
      card.querySelector(".play-button").addEventListener("click", () => openGame(game));
      grid.append(card);
    });
}

window.renderCards = renderCards;

function openGame(game) {
  if (activeCleanup) activeCleanup();
  gameMount.innerHTML = "";
  gameTitle.textContent = game.title;
  gameType.textContent = game.type;
  activeCleanup = game.render(gameMount);
  dialog.showModal();
}

closeGame.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  if (activeCleanup) activeCleanup();
  activeCleanup = null;
  gameMount.innerHTML = "";
});
searchInput.addEventListener("input", renderCards);
renderCards();

function shell(mount, stats = []) {
  mount.innerHTML = `
    <div class="play-area">
      <div class="stats">${stats.map((label) => `<span class="stat" data-stat="${label}">${label}: 0</span>`).join("")}</div>
      <div class="game-controls"></div>
    </div>
  `;
  return {
    area: mount.querySelector(".play-area"),
    controls: mount.querySelector(".game-controls"),
    stat(name, value) {
      const node = mount.querySelector(`[data-stat="${name}"]`);
      if (node) node.textContent = `${name}: ${value}`;
    }
  };
}

function addCanvas(area, width = 640, height = 480) {
  const canvas = document.createElement("canvas");
  canvas.className = "game-canvas";
  canvas.width = width;
  canvas.height = height;
  area.append(canvas);
  return [canvas, canvas.getContext("2d")];
}

function renderSnake(mount) {
  const ui = shell(mount, ["Score"]);
  const [canvas, ctx] = addCanvas(ui.area, 600, 450);
  const size = 25;
  let snake = [{ x: 5, y: 5 }];
  let food = { x: 15, y: 10 };
  let direction = { x: 1, y: 0 };
  let nextDirection = direction;
  let score = 0;
  let ended = false;

  const reset = () => {
    snake = [{ x: 5, y: 5 }];
    food = { x: 15, y: 10 };
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0;
    ended = false;
    ui.stat("Score", score);
  };
  ui.controls.append(button("Restart", reset));

  const key = (event) => {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }
    };
    if (!map[event.key]) return;
    event.preventDefault();
    const candidate = map[event.key];
    if (candidate.x !== -direction.x || candidate.y !== -direction.y) nextDirection = candidate;
  };
  window.addEventListener("keydown", key);

  const tick = setInterval(() => {
    if (ended) return drawMessage(ctx, canvas, "Press Restart");
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= canvas.width / size || head.y >= canvas.height / size;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) ended = true;
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      food = {
        x: Math.floor(Math.random() * (canvas.width / size)),
        y: Math.floor(Math.random() * (canvas.height / size))
      };
    } else {
      snake.pop();
    }
    ui.stat("Score", score);
    ctx.fillStyle = "#0b0c10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#54f5b5";
    snake.forEach((part) => ctx.fillRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4));
    ctx.fillStyle = "#ff7867";
    ctx.fillRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6);
  }, 115);

  return () => {
    clearInterval(tick);
    window.removeEventListener("keydown", key);
  };
}

function renderPong(mount) {
  const ui = shell(mount, ["Player", "Bot"]);
  const [canvas, ctx] = addCanvas(ui.area);
  let player = 190;
  let bot = 190;
  let ball = { x: 320, y: 240, vx: 5, vy: 3 };
  let playerScore = 0;
  let botScore = 0;
  const keys = new Set();
  const keydown = (event) => keys.add(event.key);
  const keyup = (event) => keys.delete(event.key);
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);

  function resetBall(sign = 1) {
    ball = { x: 320, y: 240, vx: 5 * sign, vy: (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1) };
  }

  let frame;
  function loop() {
    if (keys.has("ArrowUp")) player -= 7;
    if (keys.has("ArrowDown")) player += 7;
    player = clamp(player, 0, canvas.height - 90);
    bot += clamp(ball.y - (bot + 45), -4.5, 4.5);
    bot = clamp(bot, 0, canvas.height - 90);
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;
    if (ball.x < 32 && ball.y > player && ball.y < player + 90) ball.vx = Math.abs(ball.vx) + 0.2;
    if (ball.x > canvas.width - 32 && ball.y > bot && ball.y < bot + 90) ball.vx = -Math.abs(ball.vx) - 0.2;
    if (ball.x < 0) {
      botScore++;
      resetBall(1);
    }
    if (ball.x > canvas.width) {
      playerScore++;
      resetBall(-1);
    }
    ui.stat("Player", playerScore);
    ui.stat("Bot", botScore);
    ctx.fillStyle = "#0b0c10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#3a3244";
    for (let y = 0; y < canvas.height; y += 28) ctx.fillRect(canvas.width / 2 - 2, y, 4, 14);
    ctx.fillStyle = "#54f5b5";
    ctx.fillRect(20, player, 12, 90);
    ctx.fillStyle = "#67d6ff";
    ctx.fillRect(canvas.width - 32, bot, 12, 90);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 9, 0, Math.PI * 2);
    ctx.fill();
    frame = requestAnimationFrame(loop);
  }
  loop();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  };
}

function renderBreakout(mount) {
  const ui = shell(mount, ["Score"]);
  const [canvas, ctx] = addCanvas(ui.area);
  let paddle = 270;
  let ball = { x: 320, y: 390, vx: 4, vy: -4 };
  let score = 0;
  const keys = new Set();
  const bricks = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 9; x++) bricks.push({ x: 35 + x * 64, y: 45 + y * 28, alive: true });
  }
  const keydown = (event) => keys.add(event.key);
  const keyup = (event) => keys.delete(event.key);
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);

  let frame;
  function loop() {
    if (keys.has("ArrowLeft")) paddle -= 8;
    if (keys.has("ArrowRight")) paddle += 8;
    paddle = clamp(paddle, 0, canvas.width - 100);
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.x < 8 || ball.x > canvas.width - 8) ball.vx *= -1;
    if (ball.y < 8) ball.vy *= -1;
    if (ball.y > canvas.height) ball = { x: 320, y: 390, vx: 4, vy: -4 };
    if (ball.y > 405 && ball.y < 424 && ball.x > paddle && ball.x < paddle + 100) ball.vy = -Math.abs(ball.vy);
    bricks.forEach((brick) => {
      if (!brick.alive) return;
      const hit = ball.x > brick.x && ball.x < brick.x + 52 && ball.y > brick.y && ball.y < brick.y + 18;
      if (hit) {
        brick.alive = false;
        ball.vy *= -1;
        score += 5;
      }
    });
    ui.stat("Score", score);
    ctx.fillStyle = "#0b0c10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bricks.forEach((brick, index) => {
      if (!brick.alive) return;
      ctx.fillStyle = ["#54f5b5", "#ffd166", "#ff7867", "#67d6ff"][index % 4];
      ctx.fillRect(brick.x, brick.y, 52, 18);
    });
    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(paddle, 414, 100, 12);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
    ctx.fill();
    frame = requestAnimationFrame(loop);
  }
  loop();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  };
}

function renderDodger(mount) {
  const ui = shell(mount, ["Time"]);
  const [canvas, ctx] = addCanvas(ui.area);
  let player = { x: 300, y: 405 };
  let meteors = [];
  let time = 0;
  let over = false;
  const keys = new Set();
  const keydown = (event) => keys.add(event.key);
  const keyup = (event) => keys.delete(event.key);
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  ui.controls.append(button("Restart", () => {
    meteors = [];
    time = 0;
    over = false;
    player.x = 300;
  }));

  let frame;
  function loop() {
    if (!over) {
      if (keys.has("ArrowLeft")) player.x -= 7;
      if (keys.has("ArrowRight")) player.x += 7;
      player.x = clamp(player.x, 0, canvas.width - 34);
      if (Math.random() < 0.045) meteors.push({ x: Math.random() * (canvas.width - 22), y: -25, s: 3 + Math.random() * 4 });
      meteors.forEach((meteor) => meteor.y += meteor.s);
      meteors = meteors.filter((meteor) => meteor.y < canvas.height + 30);
      over = meteors.some((meteor) => Math.abs(meteor.x - player.x) < 30 && Math.abs(meteor.y - player.y) < 30);
      time++;
    }
    ui.stat("Time", Math.floor(time / 60));
    ctx.fillStyle = "#0b0c10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#67d6ff";
    ctx.fillRect(player.x, player.y, 34, 34);
    ctx.fillStyle = "#ff7867";
    meteors.forEach((meteor) => {
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    if (over) drawMessage(ctx, canvas, "Crashed!");
    frame = requestAnimationFrame(loop);
  }
  loop();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  };
}

function renderMemory(mount) {
  const ui = shell(mount, ["Moves"]);
  const board = document.createElement("div");
  board.className = "board";
  board.style.gridTemplateColumns = "repeat(4, 1fr)";
  ui.area.append(board);
  const symbols = ["◆", "●", "▲", "■", "★", "✚", "◇", "☼"];
  let deck = shuffle([...symbols, ...symbols]);
  let open = [];
  let matched = new Set();
  let moves = 0;

  function draw() {
    board.innerHTML = "";
    deck.forEach((symbol, index) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.textContent = matched.has(index) || open.includes(index) ? symbol : "?";
      card.disabled = matched.has(index) || open.includes(index);
      card.addEventListener("click", () => flip(index));
      board.append(card);
    });
    ui.stat("Moves", moves);
  }

  function flip(index) {
    open.push(index);
    if (open.length === 2) {
      moves++;
      const [a, b] = open;
      if (deck[a] === deck[b]) {
        matched.add(a);
        matched.add(b);
        open = [];
      } else {
        setTimeout(() => {
          open = [];
          draw();
        }, 650);
      }
    }
    draw();
  }

  ui.controls.append(button("Shuffle", () => {
    deck = shuffle([...symbols, ...symbols]);
    open = [];
    matched = new Set();
    moves = 0;
    draw();
  }));
  draw();
  return () => {};
}

function renderTicTacToe(mount) {
  const ui = shell(mount, ["Wins"]);
  const board = document.createElement("div");
  board.className = "board";
  board.style.gridTemplateColumns = "repeat(3, 1fr)";
  ui.area.append(board);
  let cells = Array(9).fill("");
  let wins = Number(localStorage.getItem("pixelLoungeTicWins") || 0);
  ui.stat("Wins", wins);

  function winner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b, c] of lines) if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    return cells.includes("") ? "" : "Draw";
  }

  function botMove() {
    const empty = cells.map((value, index) => value ? null : index).filter((value) => value !== null);
    const pick = empty[Math.floor(Math.random() * empty.length)];
    if (pick !== undefined) cells[pick] = "O";
  }

  function draw() {
    board.innerHTML = "";
    cells.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.textContent = value;
      cell.addEventListener("click", () => {
        if (cells[index] || winner()) return;
        cells[index] = "X";
        if (!winner()) botMove();
        if (winner() === "X") {
          wins++;
          localStorage.setItem("pixelLoungeTicWins", wins);
        }
        ui.stat("Wins", wins);
        draw();
      });
      board.append(cell);
    });
  }
  ui.controls.append(button("New Round", () => {
    cells = Array(9).fill("");
    draw();
  }));
  draw();
  return () => {};
}

function render2048(mount) {
  const ui = shell(mount, ["Score"]);
  const board = document.createElement("div");
  board.className = "board";
  board.style.gridTemplateColumns = "repeat(4, 1fr)";
  ui.area.append(board);
  let grid = Array(16).fill(0);
  let score = 0;

  function spawn() {
    const empty = grid.map((value, index) => value ? null : index).filter((value) => value !== null);
    if (empty.length) grid[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.85 ? 4 : 2;
  }

  function draw() {
    board.innerHTML = "";
    grid.forEach((value) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = value || "";
      tile.style.opacity = value ? "1" : "0.28";
      board.append(tile);
    });
    ui.stat("Score", score);
  }

  function merge(line) {
    const values = line.filter(Boolean);
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] === values[i + 1]) {
        values[i] *= 2;
        score += values[i];
        values.splice(i + 1, 1);
      }
    }
    return [...values, ...Array(4 - values.length).fill(0)];
  }

  function move(key) {
    const before = grid.join(",");
    for (let i = 0; i < 4; i++) {
      const line = [0, 1, 2, 3].map((j) => key.includes("Left") || key.includes("Right") ? grid[i * 4 + j] : grid[j * 4 + i]);
      const merged = merge(key.includes("Right") || key.includes("Down") ? line.reverse() : line);
      const finalLine = key.includes("Right") || key.includes("Down") ? merged.reverse() : merged;
      finalLine.forEach((value, j) => {
        if (key.includes("Left") || key.includes("Right")) grid[i * 4 + j] = value;
        else grid[j * 4 + i] = value;
      });
    }
    if (grid.join(",") !== before) spawn();
    draw();
  }

  const keydown = (event) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    move(event.key);
  };
  window.addEventListener("keydown", keydown);
  ui.controls.append(button("Restart", () => {
    grid = Array(16).fill(0);
    score = 0;
    spawn();
    spawn();
    draw();
  }));
  spawn();
  spawn();
  draw();
  return () => window.removeEventListener("keydown", keydown);
}

function renderMines(mount) {
  const ui = shell(mount, ["Safe"]);
  const board = document.createElement("div");
  board.className = "board";
  board.style.gridTemplateColumns = "repeat(6, 1fr)";
  ui.area.append(board);
  let mines = new Set();
  let revealed = new Set();
  let lost = false;

  function reset() {
    mines = new Set();
    revealed = new Set();
    lost = false;
    while (mines.size < 6) mines.add(Math.floor(Math.random() * 36));
    draw();
  }

  function count(index) {
    const x = index % 6;
    const y = Math.floor(index / 6);
    let total = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 6 && mines.has(ny * 6 + nx)) total++;
      }
    }
    return total;
  }

  function draw() {
    board.innerHTML = "";
    for (let i = 0; i < 36; i++) {
      const cell = document.createElement("button");
      const isOpen = revealed.has(i) || lost;
      cell.className = `cell ${isOpen ? "revealed" : ""} ${lost && mines.has(i) ? "mine" : ""}`;
      cell.textContent = isOpen ? (mines.has(i) ? "!" : count(i) || "") : "";
      cell.addEventListener("click", () => {
        if (lost) return;
        if (mines.has(i)) lost = true;
        else revealed.add(i);
        ui.stat("Safe", revealed.size);
        draw();
      });
      board.append(cell);
    }
  }

  ui.controls.append(button("New Board", reset));
  reset();
  return () => {};
}

function renderReaction(mount) {
  const ui = shell(mount, ["Best"]);
  const savedBest = Number(localStorage.getItem("pixelLoungeReaction") || 0);
  let best = savedBest || "--";
  ui.stat("Best", best);
  const big = document.createElement("button");
  big.className = "big-button";
  ui.area.append(big);
  let readyAt = 0;
  let timeout = null;

  function arm() {
    big.textContent = "Wait...";
    big.style.background = "#ff7867";
    readyAt = 0;
    timeout = setTimeout(() => {
      readyAt = performance.now();
      big.textContent = "CLICK!";
      big.style.background = "#54f5b5";
    }, 900 + Math.random() * 2200);
  }

  big.addEventListener("click", () => {
    if (!readyAt) {
      clearTimeout(timeout);
      big.textContent = "Too early. Tap to retry.";
      big.style.background = "#ffd166";
      readyAt = 0;
      return;
    }
    const result = Math.round(performance.now() - readyAt);
    if (best === "--" || result < best) {
      best = result;
      localStorage.setItem("pixelLoungeReaction", best);
    }
    ui.stat("Best", best);
    big.textContent = `${result}ms. Tap again.`;
    big.style.background = "#67d6ff";
    readyAt = 0;
  });
  ui.controls.append(button("Start", arm));
  big.textContent = "Press Start";
  return () => clearTimeout(timeout);
}

function renderSimon(mount) {
  const ui = shell(mount, ["Level"]);
  const board = document.createElement("div");
  board.className = "board";
  board.style.gridTemplateColumns = "repeat(2, 1fr)";
  ui.area.append(board);
  const colors = ["#54f5b5", "#ff7867", "#ffd166", "#67d6ff"];
  let pattern = [];
  let input = [];
  let accepting = false;

  function draw(active = -1) {
    board.innerHTML = "";
    colors.forEach((color, index) => {
      const pad = document.createElement("button");
      pad.className = "cell";
      pad.style.background = color;
      pad.style.opacity = active === index ? "1" : "0.55";
      pad.addEventListener("click", () => press(index));
      board.append(pad);
    });
    ui.stat("Level", pattern.length);
  }

  function flash(index) {
    draw(index);
    return new Promise((resolve) => setTimeout(() => {
      draw();
      setTimeout(resolve, 180);
    }, 360));
  }

  async function playPattern() {
    accepting = false;
    for (const index of pattern) await flash(index);
    input = [];
    accepting = true;
  }

  function next() {
    pattern.push(Math.floor(Math.random() * 4));
    playPattern();
  }

  function press(index) {
    if (!accepting) return;
    input.push(index);
    flash(index);
    const bad = input.some((value, i) => value !== pattern[i]);
    if (bad) {
      accepting = false;
      pattern = [];
      ui.stat("Level", 0);
    } else if (input.length === pattern.length) {
      accepting = false;
      setTimeout(next, 600);
    }
  }

  ui.controls.append(button("Start", () => {
    pattern = [];
    next();
  }));
  draw();
  return () => {
    accepting = false;
  };
}

function button(label, action) {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = label;
  node.addEventListener("click", action);
  return node;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function drawMessage(ctx, canvas, message) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffaf2";
  ctx.font = "bold 42px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}
