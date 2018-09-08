function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return (Math.random() * (min - max) + max).toFixed(4);
}

function getRandomSign(num) {
  return num * [1, -1][getRandomInt(0, 1)];
}

function getElementSize(htmlElem) {
  return {
    width: htmlElem.offsetWidth,
    height: htmlElem.offsetHeight
  }
}

function isMobilePlatform() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
