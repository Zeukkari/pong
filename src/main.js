var loop = require('./loop');
var rand = require('./rand');
var key = require('./key');
var math = require('mathjs');

var canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
canvas.style.backgroundColor = '#000';
document.body.appendChild(canvas);

var ctx = canvas.getContext('2d');

var gameState = {
  player1Score: 0,
  player2Score: 0
};

var player1 = {
  x: rand.int(canvas.width),
  y: rand.int(canvas.height),
  width: 25,
  height: 120,
  speed: 350,
  color: 'rgba(236, 94, 103, 1)'
};

var player2 = {
  x: rand.int(canvas.width),
  y: rand.int(canvas.height),
  width: 25,
  height: 120,
  speed: 350,
  color: 'rgba(36, 94, 103, 1)'
};

var upperWall = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: 25,
  color: 'rgba(0, 0, 255, 1)'
};

var lowerWall = {
  x: 0,
  y: canvas.height - 25,
  width: canvas.width,
  height: 25,
  color: 'rgba(0, 0, 255, 1)'
};

var ball = {
  x: parseInt(canvas.width / 2),
  y: parseInt(canvas.height / 2),
  radius: 25,
  speed: 350,
  direction: [Math.random(), Math.random()],
  color: 'rgba(255, 255, 0, 1)'
};

var RectCircleColliding = function(circle, rect) {
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
  ball.x = ball.x + ball.direction[0] * ball.speed * dt;
  ball.y = ball.y + ball.direction[1] * ball.speed * dt;

  var normalTop = [0, -1];
  var normalBottom = [0, 1];
  var normalLeft = [-1, 0];
  var normalRight = [1, 0];

  var normal;

  // check bounds collisions
  if (RectCircleColliding(ball, player1)) {
    ball.speed = ball.speed * 1.1;
    player1.height = player1.height * 0.9;
    normal = normalLeft;
  }

  if (RectCircleColliding(ball, player2)) {
    ball.speed = ball.speed * 1.1;
    player2.height = player2.height * 0.9;
    normal = normalRight;
  }
  if (RectCircleColliding(ball, lowerWall)) {
    normal = normalBottom;
  }
  if (RectCircleColliding(ball, upperWall)) {
    normal = normalTop;
  }

  if (normal) {
    var temp = 2 * math.dot(ball.direction, normal);
    var temp2 = math.multiply(temp, normal);
    var newDirection = math.subtract(ball.direction, temp2);
    ball.direction = newDirection;
  }
};

var resetBall = function() {
  ball.x = parseInt(canvas.width / 2);
  ball.y = parseInt(canvas.height / 2);
  ball.direction = [Math.random(), Math.random()];
  ball.speed = 350;
};

var testScore = function() {
  if (ball.x < 0) {
    gameState.player1Score++;
    player1.height = 120;
    resetBall();
  }
  if (ball.x > canvas.width) {
    gameState.player2Score++;
    player2.height = 120;
    resetBall();
  }
};

// game loop
loop.start(function(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  var scoreText = `${gameState.player1Score} - ${gameState.player2Score}`;
  ctx.fillText(scoreText, canvas.width / 2, canvas.height * (1 / 4));
});
