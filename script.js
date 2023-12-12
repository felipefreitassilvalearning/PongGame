let ballMovement = setInterval(moveDot, 1);
let distance = 1;
let isPaused = false;
let isGameOver = false;
let highestScore = 0;
const minDistance = 0.1;
const maxDistance = 6;
const scoreIncrement = 2;
let scoreDecrement = 1;
let activeStick = "left";

window.onload = () => {
  setHighestScore();
}

/**
 * This function gets the highest score from the local storage and displays it
 * @returns {void}
 */
function setHighestScore() {
  const highestScore = localStorage.getItem('highestScore');
  const highestScoreElement = document.getElementById('highestScore');
  if (highestScoreElement === null) return 0;
  const highestScoreValue = parseInt(highestScore || '0');
  highestScoreElement.innerText = highestScoreValue;
}

/**
 * This function resets the game
 * @returns {void}
 */
function resetGame() {
  if (!isGameOver) return;

  const { body } = document;
  body.style.opacity = 1;

  setHighestScore();

  distance = 1;
  scoreDecrement = 1;

  isGameOver = false;
  const gameOver = document.getElementById('gameOver');
  if (gameOver === null) return;
  gameOver.style.display = 'none';

  ballMovement = setInterval(moveDot, 1);

  document.addEventListener('mousemove', moveSticks)
  
  const dot = document.getElementById('dot');
  if (dot === null) return;
  dot.style.left = '50%';
  dot.style.top = '50%';
  dot.dataset.direction = 'bottom right';

  const leftStick = document.getElementById('leftStick');
  if (leftStick === null) return;
  leftStick.style.height = '100px';
  leftStick.style.top = '0';

  const rightStick = document.getElementById('rightStick');
  if (rightStick === null) return;
  rightStick.style.height = '100px';
  rightStick.style.top = '0';

  const score = document.getElementById('score');
  if (score === null) return;
  score.innerText = '0';

  const highestScore = localStorage.getItem('highestScore');
  const highestScoreElement = document.getElementById('highestScore');
  if (highestScoreElement === null) return;
  if (score.innerText > highestScore) {
    highestScoreElement.innerText = score.innerText;
    localStorage.setItem('highestScore', score.innerText);
  }
}

document.addEventListener('mousedown', resetGame);

/**
 * This function ends the game
 * @returns {void}
 */
function endGame() {
  const { body } = document;
  body.style.opacity = 0.5;
  body.style.cursor = "pointer";

  isGameOver = true;
  const gameOver = document.getElementById('gameOver');
  if (gameOver === null) return;
  gameOver.style.display = 'block';

  clearInterval(ballMovement);

  document.removeEventListener('mousemove', moveSticks)

  const highestScoreSaved = localStorage.getItem('highestScore');
  if ((highestScoreSaved === null) || (highestScore > parseInt(highestScoreSaved))) {
    localStorage.setItem('highestScore', highestScore);
  }
}

/**
 * This function freezes the game when the user presses the 'p' key
 * @param {KeyboardEvent} e The keyboard event
 */
function playPause(e) {
  if (e.key.toLowerCase() !== 'p') return;

  if (isGameOver) return;

  const { body } = document;
  const pauseText = document.getElementById('pause');
  if (isPaused) {
    pauseText.style.display = 'none';
    ballMovement = setInterval(moveDot, 1);
    document.addEventListener('mousemove', moveSticks)
    body.style.opacity = 1;
    isPaused = false;
  } else {
    pauseText.style.display = 'block';
    clearInterval(ballMovement);
    document.removeEventListener('mousemove', moveSticks)
    body.style.opacity = 0.5;
    isPaused = true;
  }
}

document.addEventListener('keydown', playPause);

/**
 * This function checks if the dot collides with a stick
 * @param {number} dotX the x position of the dot
 * @param {number} dotY the y position of the dot
 * @returns {[boolean, HTMLElement | null]} [whether the dot collides with a stick, the stick that collides with the dot]
 */
function collidesWithStick(dotX, dotY) {
  const stick = getStick(dotX);
  if (stick === null) return [false, stick];

  const stickX = stick.offsetLeft;
  const stickY = stick.offsetTop;
  const stickWidth = stick.offsetWidth;
  const stickHeight = stick.offsetHeight;

  if (dotX >= stickX && dotX <= stickX + stickWidth && dotY >= stickY && dotY <= stickY + stickHeight) {
    return [true, stick];
  }

  return [false, stick];
}

/**
 * This function gets the directions of the dot movement
 * @param {HTMLElement} dot The dot element
 * @returns {["top" | "bottom", "left" | "right"]} [vertical direction, horizontal direction]
 */
function getDirections(dot) {
  const direction = dot.dataset.direction;
  if (direction === undefined) {
    console.warn("An error occured while getting the directions of the dot")
    return ["bottom", "right"];
  }
  const [vertical, horizontal] = direction.split(' ');
  return [vertical, horizontal];
}

/**
 * This function moves the dot around the screen
 * @returns {void}
 */
function moveDot() {
  const dot = document.getElementById('dot');
  if (dot === null) return;

  const score = document.getElementById('score');
  if (score === null) return;
  const scoreValue = parseInt(score.innerText || '0');

  const dotX = dot.offsetLeft;
  const dotY = dot.offsetTop;

  const [collides, stick] = collidesWithStick(dotX, dotY);
  if (stick === null) return;
  let [vertical, horizontal] = getDirections(dot);
  if (collides) {
    if (stick.id.startsWith(activeStick)) {
      stick.style.outline = '2px solid green';
    }
    
    score.innerText = scoreValue + scoreIncrement;
    if (scoreValue + scoreIncrement > highestScore) {
      highestScore = scoreValue + scoreIncrement;
    }

    if (distance < maxDistance) {
      distance += 0.1;
    }

    if (stick.id === "leftStick") {
      dot.dataset.direction = `${vertical} right`
    } else if (stick.id === "rightStick") {
      dot.dataset.direction = `${vertical} left`
    }

    const stickHeight = stick.offsetHeight;
    if (stickHeight > 15) {
      stick.style.height = stickHeight * 0.9 + 'px';
    }
  } else {
    if (stick.id.startsWith(activeStick)) {
      stick.style.outline = '2px solid red';
    }

    const tooFarLeft = dotX <= 0;
    const tooFarRight = dotX + dot.offsetWidth >= window.innerWidth;
    const tooFarTop = dotY <= 0;
    const tooFarBottom = dotY + dot.offsetHeight >= window.innerHeight;

    if (tooFarLeft || tooFarRight) {
      score.innerText = scoreValue - scoreDecrement;
      if (scoreValue - scoreDecrement < 0) {
        endGame();
        return;
      }
      scoreDecrement += 1;

      if (distance > minDistance) {
        distance -= 0.1;
      }

      const stickHeight = stick.offsetHeight;
      if (stickHeight < 100) {
        stick.style.height = stickHeight * 1.1 + 'px';
      }
    }

    if (tooFarLeft) {
      dot.dataset.direction = `${vertical} right`
    } else if (tooFarRight) {
      dot.dataset.direction = `${vertical} left`
    }

    if (tooFarTop) {
      dot.dataset.direction = `bottom ${horizontal}`
    } else if (tooFarBottom) {
      dot.dataset.direction = `top ${horizontal}`
    }
  }

  [vertical, horizontal] = getDirections(dot);
  if (horizontal === "right") {
    dot.style.left = dotX + distance + 'px';
  } else if (horizontal === "left") {
    dot.style.left = dotX - distance + 'px';
  }

  if (vertical === "top") {
    dot.style.top = dotY - distance + 'px';
  } else if (vertical === "bottom") {
    dot.style.top = dotY + distance + 'px';
  }
}

/**
 * This function determines which stick to move according to the mouse position
 * It also sets which stick is active for highlighting purposes
 * @param {number} x The x position of the mouse
 * @returns {HTMLElement | null} The stick that is on the side of the mouse
 */
function getStick(x) {
  const leftStick = document.getElementById('leftStick');
  const rightStick = document.getElementById('rightStick');
  leftStick.style.outline = 'none';
  rightStick.style.outline = 'none';
  
  if (x < window.innerWidth / 2) {
    activeStick = "left";
    return leftStick;
  }
  
  activeStick = "right";
  return rightStick;
}

/**
 * This function moves the stick vertically according to the mouse position
 * @param {HTMLElement} stick The stick to move
 * @param {number} y The y position of the mouse
 * @returns 
 */
function moveStick(stick, y) {
  if (stick === null) return;

  const stickHeight = stick.offsetHeight;

  if (y + stickHeight > window.innerHeight) return;

  stick.style.top = y + 'px';
}

/**
 * This function chooses which stick to move and calls the moveStick function
 * @param {MouseEvent} e The mouse event with the cursor position
 * @returns {void}
 */
function moveSticks(e) {
  const x = e.clientX;
  const y = e.clientY;
  
  const stick = getStick(x);
  if (stick === null) return;

  moveStick(stick, y);
}

document.addEventListener('mousemove', moveSticks)
