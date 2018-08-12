var _pressed = {};
var key = {};

key.UP = 38;
key.DOWN = 40;
key.W = 87;
key.S = 83;

key.isDown = function(keyCode) {
  return _pressed[keyCode];
};

key.onKeydown = function(event) {
  _pressed[event.keyCode] = true;
};

key.onKeyup = function(event) {
  _pressed[event.keyCode] = null;
};

window.addEventListener(
  'keyup',
  function(e) {
    key.onKeyup(e);
  },
  false
);
window.addEventListener(
  'keydown',
  function(e) {
    key.onKeydown(e);
  },
  false
);

module.exports = key;
