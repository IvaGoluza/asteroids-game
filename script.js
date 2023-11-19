const canvas = document.getElementById('canvas');  // Get the canvas for the game
const ctx = canvas.getContext('2d');               

canvas.width = window.innerWidth;                  // Set the width and height -> important for keeping track of moving objects
canvas.height = window.innerHeight;

const asteroidImg = document.getElementById('asteroidImg');   // canvas elements
const spaceship = document.getElementById('spaceshipImg');

let bestTime = localStorage.getItem('bestTime') ? localStorage.getItem('bestTime') : -Infinity;   // get the best time from local storage
let startTime = null;

const restartButton = document.getElementById('restartButton');   // button for game restart
restartButton.addEventListener('click', restartGame);

let asteroidsNum = 15;    // default asteroid number is set to medium level
const dots = [];          // dots represent moving stars
const asteroids = [];   
const sound = new Audio('./sound.mp3');  // crashing sound

// define PLAYER (spaceship)
const player = {
    x: canvas.width / 2,   // set the player at the center of the canvas
    y: canvas.height / 2, 
    size: 90,              // player size
    speed: 10,             // player speed
    img: spaceship
};

// function for player drawing
function drawPlayer() {
    ctx.drawImage(player.img, player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);  // moving it by half of its size 
    if (player.x > canvas.width)  player.x = 0;      // if player leaves on right side of the canvas, set it on the left side
    else if (player.x < 0) player.x = canvas.width;  // if player leaves on left side of the canvas, set it on the right side
    if (player.y > canvas.height) player.y = 0;      // if player leaves on bottom side of the canvas, set it on the top side
    else if (player.y < 0) player.y = canvas.height; // if player leaves on top side of the canvas, set it on the bottom side
}

// how the player (spaceship) will be moved
document.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
      case 37: // left
        player.x -= player.speed;
        break;
      case 38: // up
        player.y -= player.speed;
        break;
      case 39: // right
        player.x += player.speed;
        break;
      case 40: // down
        player.y += player.speed;
        break;
    }
});
 
// stars creation
function createDot() {
  const dot = {
    x: Math.random() * canvas.width, 
    y: canvas.width + 150,         // make the stars "come" form the bottom of the screen -> simulate spaceship moving even if it is not   
    size: Math.random() * 2 + 0.5, // make the stars different size 
    speedX: Math.random() * 4 - 2, 
    speedY: -Math.random() * 4 - 2, // stars are going up
  };
  dots.push(dot); 
}

// stars drawing
function drawDot(dot) {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);  // make them move on arched paths
  ctx.fill();
}

// asteroids creation
function createAsteroid() {
    const edgeSide = Math.floor(Math.random() * 4);  // to make asteroids come from different side of screen edge
    let x, y, speedX, speedY;
  
    if (edgeSide === 0) {
      // up, y out of screen down
      x = Math.random() * canvas.width;
      y = -150;
      speedX = Math.random() - 0.5; 
      speedY = Math.random() + 0.5; 
    } else if (edgeSide === 1) {
      // down, y out of screen up
      x = Math.random() * canvas.width;
      y = canvas.height + 150;
      speedX = Math.random() - 0.5; 
      speedY = -(Math.random() + 0.5); 
    } else if (edgeSide === 2) {
      // left, x out of screen, left
      x = -150;
      y = Math.random() * canvas.height;
      speedX = Math.random() + 0.5; 
      speedY = Math.random() - 0.5; 
    } else {
      // right, x out of screen, right
      x = canvas.width + 150;
      y = Math.random() * canvas.height;
      speedX = -(Math.random() + 0.5); 
      speedY = Math.random() - 0.5; 
    }
    speedX = speedX + 2;    // to make them move faster or slower in game dev
    speedY = speedY + 2;

    const asteroid = {
      x,
      y,
      size: 80,
      speedX,
      speedY,
      img: asteroidImg, 
    };
    asteroids.push(asteroid); 
  }

// asteroid drawing
function drawAsteroid(asteroid) {
   ctx.drawImage(asteroid.img, asteroid.x, asteroid.y, asteroid.size, asteroid.size);
}

// checks for space collision between spaceship and asteroids
// the function is checking collision between two squares, based on their top left and bottom right edge coordinates 
// we have images objects that are not perfect squares, but there is collisionOffset to make collision more accurate
function checkSpaceCollision() {      
    const collisionOffset = -45     // zero if we use squares as moving objects for the game                       
    for (let i = 0; i < asteroids.length; i++) {
      const asteroid = asteroids[i];
      const x1P = player.x - player.size / 2 - collisionOffset;      // player.x and player.y are object center coordinates, we need top left coordinates 
      const y1P = player.y - player.size / 2 - collisionOffset;
      const x2P = x1P + player.size + collisionOffset * 2;           
      const y2P = y1P + player.size + collisionOffset * 2;
      const x1A = asteroid.x
      const y1A = asteroid.y
      const x2A = asteroid.x + asteroid.size
      const y2A = asteroid.y + asteroid.size
    
      // check if asteroid A and player P collide
      if((x1P < x2A) && (x2P > x1A) && (y1P < y2A) && (y2P > y1A)) {
        sound.play();
        return true;
      } 
    }
    return false; 
}
  
  
function startAnimation() {
  
  if (!startTime) {
    startTime = Date.now(); // remember when the game has started
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear the canvas before new animation
  ctx.fillStyle = 'black';                           
  ctx.fillRect(0, 0, canvas.width, canvas.height);   // space 
  drawPlayer();                                      // player
  updateTimer();                                     // updates the screen timer 

  for (let i = 0; i < dots.length; i++) {            // stars
    const dot = dots[i];
    drawDot(dot);
    // move the stars for the next animation drawing
    dot.x += dot.speedX;
    dot.y += dot.speedY;
    if (dot.x > canvas.width || dot.x < 0 || dot.y > canvas.height || dot.y < 0) {   // if star leaves the screen view take it back 
      dot.x = Math.random() * canvas.width;
      dot.y = Math.random() * canvas.height;
    }
  }
 
  for(let i = 0; i < asteroids.length; i++) {        // asteroids
    const asteroid = asteroids[i];
    drawAsteroid(asteroid);
    // move the asteroids for the next animation drawing
    asteroid.x += asteroid.speedX;
    asteroid.y += asteroid.speedY;

    if (asteroid.y > canvas.height) {                // if asteroid leaves the screen view
      asteroid.x = Math.random() * canvas.width;
      asteroid.y = -50;
    }
  } 

  if (checkSpaceCollision()) {
    endGame()
  } else requestAnimationFrame(startAnimation);  // restart the animation if there was not collision

}


function createSpaceElements() {        // creates stars and asteroids that will be animated
  dots.length = 0;                      // clear everything 
  asteroids.length = 0;   

  for (let i = 0; i < 40; i++) {
    createDot();
  }

  for (let i = 0; i < asteroidsNum; i++) {
    createAsteroid();
  }   
}

  
function endGame() {            // handles end of the game
  const endTime = Date.now();
  const elapsedTime = endTime - startTime;
  
  if (elapsedTime > bestTime) {
    bestTime = elapsedTime;
    localStorage.setItem('bestTime', bestTime);
  }
  // show the results
  updateTimeOfId(elapsedTime, 'timerCurrentTime');
  updateTimeOfId(bestTime, 'timerBestTime');
  updateTimeOfId(elapsedTime, 'infoCurrentTime');
  updateTimeOfId(bestTime, 'infoBestTime');
  document.getElementById('gameInfo').style.display = 'block';
}


function restartGame() {   // handles game restart

  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;  // get level difficulty
  switch(difficulty) {
    case "easy": 
      asteroidsNum = 5;
      break;
    case "medium": 
      asteroidsNum = 15;
      break;
    case "hard": 
      asteroidsNum = 25; 
    break;
  }
 
  updateTimeOfId(bestTime, 'timerBestTime');
  startTime = null;
  document.getElementById('gameInfo').style.display = 'none';
   
  player.x = canvas.width / 2;  // return player to the starting point 
  player.y = canvas.height / 2;
  createSpaceElements();        // create new asteroids and stars
  startAnimation();             // start the game
}

function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;
  updateTimeOfId(elapsedTime, 'timerCurrentTime');
  if(bestTime !== -Infinity) updateTimeOfId(bestTime, 'timerBestTime');
}

function updateTimeOfId(time, id) {    
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(3);
  const timeStr = `${(minutes < 10 ? '0' : '')}${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
  document.getElementById(id).innerText = timeStr; 
} 

createSpaceElements()
startAnimation()