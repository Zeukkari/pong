var loop = require('./loop');
var key = require('./key');
var math = require('mathjs');

var getScreenSize = function() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return { width: parseInt(x * 0.9), height: parseInt(y * 0.9) };
};

var screenSize = getScreenSize();
console.log('screenSize: ', screenSize);
var canvas = document.createElement('canvas');
var screenSize = getScreenSize();

canvas.width = parseInt(screenSize.width);
canvas.height = parseInt(screenSize.height);
canvas.style.backgroundColor = '#000';
document.body.appendChild(canvas);

var ctx = canvas.getContext('2d');

var ROUNDLIMIT = 10;
var PLAYERSIZE = 120;

var gameState, player1, player2, upperWall, lowerWall, ball;

var resetGame = function() {
  // gamePhase: [0,1,2]
  // 1: Intro - press any key to start
  // 2: Game loop
  // 3: Scoreboard - press enter to return
  gameState = {
    gamePhase: 0,
    player1Score: 0,
    player2Score: 0,
    winner: 'nobody'
  };

  player1 = {
    x: parseInt(PLAYERSIZE),
    y: parseInt(canvas.height / 2 - PLAYERSIZE / 2),
    width: 25,
    height: PLAYERSIZE,
    speed: 350,
    color: 'rgba(236, 94, 103, 1)'
  };

  player2 = {
    x: canvas.width - PLAYERSIZE,
    y: parseInt(canvas.height / 2 - PLAYERSIZE / 2),
    width: 25,
    height: PLAYERSIZE,
    speed: 350,
    color: 'rgba(36, 94, 103, 1)'
  };

  upperWall = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: 25,
    color: 'rgba(0, 0, 255, 1)'
  };

  lowerWall = {
    x: 0,
    y: canvas.height - 25,
    width: canvas.width,
    height: 25,
    color: 'rgba(0, 0, 255, 1)'
  };

  var direction = 0.75 + Math.random() / 4;

  ball = {
    x: parseInt(canvas.width / 2),
    y: parseInt(canvas.height / 2),
    radius: 15,
    speed: 350,
    direction: [direction, 1 - direction],
    color: 'rgba(255, 255, 0, 1)'
  };
};

resetGame();

var testCollision = function(circle, rect) {
  var distX = Math.abs(circle.x - rect.x - rect.width / 2);
  var distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > rect.width / 2 + circle.radius) {
    return false;
  }
  if (distY > rect.height / 2 + circle.radius) {
    return false;
  }

  if (distX <= rect.width / 2) {
    return true;
  }
  if (distY <= rect.height / 2) {
    return true;
  }

  var dx = distX - rect.width / 2;
  var dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
};

var player1Movement = function(dt) {
  if (key.isDown(key.W)) {
    player1.y = player1.y - player1.speed * dt;
  }
  if (key.isDown(key.S)) {
    player1.y = player1.y + player1.speed * dt;
  }

  if (player1.y < 0) {
    player1.y = 0;
  } else if (player1.y + player1.height > canvas.height) {
    player1.y = canvas.height - player1.height;
  }
};

var player2Movement = function(dt) {
  if (key.isDown(key.UP)) {
    player2.y = player2.y - player2.speed * dt;
  }
  if (key.isDown(key.DOWN)) {
    player2.y = player2.y + player2.speed * dt;
  }

  if (player2.y < 0) {
    player2.y = 0;
  } else if (player2.y + player2.height > canvas.height) {
    player2.y = canvas.height - player2.height;
  }
};

var pongMovement = function(dt) {
  var normalTop = [0, -1];
  var normalBottom = [0, 1];
  var normalLeft = [-1, 0];
  var normalRight = [1, 0];

  var handleCollision = function(normal) {
    var temp = 2 * math.dot(ball.direction, normal);
    var temp2 = math.multiply(temp, normal);
    var newDirection = math.subtract(ball.direction, temp2);
    ball.direction = newDirection;
  };

  var addVelocity = function() {
    var multiplier = 1.25;
    ball.speed = ball.speed * multiplier;
  };

  if (testCollision(ball, player1)) {
    handleCollision(normalLeft);
    addVelocity();
  }

  if (testCollision(ball, player2)) {
    handleCollision(normalRight);
    addVelocity();
  }
  if (testCollision(ball, lowerWall)) {
    handleCollision(normalBottom);
  }
  if (testCollision(ball, upperWall)) {
    handleCollision(normalTop);
  }

  // Move ball
  ball.x = ball.x + ball.direction[0] * ball.speed * dt;
  ball.y = ball.y + ball.direction[1] * ball.speed * dt;
};

var newRound = function() {
  if (gameState.player2Score < gameState.player1Score) {
    ball.direction[0] = ball.direction[0];
    ball.direction[1] = Math.random() * 0.5;
    ball.x = player2.x - 25;
    ball.y = player2.y + player2.height / 2;
  } else {
    ball.direction[0] = -ball.direction[0];
    ball.direction[1] = Math.random() * 0.5;
    ball.x = player1.x + 25;
    ball.y = player1.y + player1.height / 2;
  }

  ball.speed = 350;
};

var testScore = function() {
  if (ball.x < 0) {
    gameState.player2Score++;
    newRound();
  }
  if (ball.x > canvas.width) {
    gameState.player1Score++;
    newRound();
  }

  if (gameState.player1Score == ROUNDLIMIT) {
    gameState.winner = 'Left';
    gameState.gamePhase = 2;
  }
  if (gameState.player2Score == ROUNDLIMIT) {
    gameState.winner = 'Right';
    gameState.gamePhase = 2;
  }
};

var runGame = function(dt) {
  player1Movement(dt);
  player2Movement(dt);
  pongMovement(dt);
  testScore();

  // draw walls
  ctx.fillStyle = upperWall.color;
  ctx.fillRect(upperWall.x, upperWall.y, upperWall.width, upperWall.height);
  ctx.fillStyle = lowerWall.color;
  ctx.fillRect(lowerWall.x, lowerWall.y, lowerWall.width, lowerWall.height);

  // draw player1
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, player1.width, player1.height);

  // draw player2
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

  // draw ball
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = ball.color;
  ctx.fill();

  // draw score
  ctx.font = '30px Georgia';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  var scoreText = `${gameState.player1Score} - ${gameState.player2Score}`;
  ctx.fillText(scoreText, canvas.width / 2, canvas.height * (1 / 4));
};

var runIntro = function(dt) {
  if (key.isDown(key.ENTER)) {
    gameState.gamePhase = 1;
  }

  // draw walls
  ctx.fillStyle = upperWall.color;
  ctx.fillRect(upperWall.x, upperWall.y, upperWall.width, upperWall.height);
  ctx.fillStyle = lowerWall.color;
  ctx.fillRect(lowerWall.x, lowerWall.y, lowerWall.width, lowerWall.height);

  // draw player1
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, player1.width, player1.height);

  // draw player2
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

  // draw score
  ctx.font = '30px Georgia';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText('PONG', canvas.width / 2, canvas.height / 2);
  ctx.font = '18px Georgia';
  ctx.fillText(
    'Press ENTER to start game',
    canvas.width / 2,
    (canvas.height / 4) * 3
  );
};

var runScoreboard = function(dt) {
  if (key.isDown(key.BACKSPACE)) {
    resetGame();
  }
  // draw score
  ctx.font = '36px Georgia';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  var scoreText = `${gameState.player1Score} - ${gameState.player2Score}`;
  ctx.fillText(scoreText, canvas.width / 2, canvas.height * (1 / 4));
  ctx.font = '45px Georgia';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height * (2 / 4));

  // draw score
  ctx.font = '30px Georgia';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText(
    `${gameState.winner} wins - press backspace to return`,
    canvas.width / 2,
    (canvas.height / 4) * 3
  );
};

// game loop
loop.start(function(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //console.log('gameState: ', gameState);
  //console.log('screenSize: ', getScreenSize());
  if (gameState.gamePhase == 0) runIntro(dt);
  if (gameState.gamePhase == 1) runGame(dt);
  if (gameState.gamePhase == 2) runScoreboard(dt);
});
