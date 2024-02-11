let yourPokemon;
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 640;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

const collisonObjects = [];
for (let i = 0; i < collisionObject.length; i += 30) {
  collisonObjects.push(collisionObject.slice(i, 30 + i));
}

const collisonMap = [];
for (let i = 0; i < collisionTree.length; i += 30) {
  collisonMap.push(collisionTree.slice(i, 30 + i));
}

const doorsMap = [];
for (let i = 0; i < collisionDoor.length; i += 30) {
  doorsMap.push(collisionDoor.slice(i, 30 + i));
}

const boundaries = [];
const doorsZones = [];
const offset = {
  x: 23.5 * 2,
  y: 0,
};

collisonObjects.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 6534) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        }),
      );
    }
  });
});

collisonMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 6534) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height,
          },
        }),
      );
    }
  });
});

doorsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 6534) {
      doorsZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        }),
      );
    }
  });
});

doorsZones[0].position.x -= 32;
doorsZones[0].width *= 3;

const imgPalletTown = new Image();
imgPalletTown.src = 'PalletTown.png';

const imgForeground = new Image();
imgForeground.src = 'Foreground.png';

const imgPlayerDown = new Image();
imgPlayerDown.src = 'player-down.png';

const imgPlayerUp = new Image();
imgPlayerUp.src = 'player-up.png';

const imgPlayerLeft = new Image();
imgPlayerLeft.src = 'player-left.png';

const imgPlayerRight = new Image();
imgPlayerRight.src = 'player-right.png';

const playerSprites = [imgPlayerDown, imgPlayerUp, imgPlayerLeft, imgPlayerRight];

const town = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: imgPalletTown,
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const Foreground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: imgForeground,
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const player = new Sprite({
  position: {
    x: 570,
    y: 300,
  },
  image: playerSprites[0],
  frames: {
    val: 1,
    max: 4,
    elapsed: 0,
    initial: 1,
  },
  hold: 15,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  enter: {
    pressed: false,
  },
};

lastKey = '';
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
    case 'Enter':
      keys.enter.pressed = true;
      lastKey = 'enter';
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
    case 'Enter':
      keys.enter.pressed = false;
      break;
  }
});

function collision(rectangle1, rectangle2) {
  return (
    rectangle1.position.x + rectangle1.width - 5 >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + 10 <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}

let currentDoors = {
  outsideDoor: doorsZones[3],
  insideDoor: {},
  name: 'Oak Lab',
};

const teamPokemon = [];

let animateId;
function animate() {
  animateId = window.requestAnimationFrame(animate);
  town.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  doorsZones.forEach((door) => {
    door.draw();
  });
  player.draw();
  Foreground.draw();

  player.animate = false;

  //player walking
  movePlayer(boundaries);

  //activate a door
  if (keys.w.pressed) {
    doorsZones.forEach((door) => {
      const minArea =
        player.position.x >= door.position.x - 10 &&
        player.position.x + player.width <= door.position.x + door.width + 10;
      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y - 1 } },
          door,
        ) &&
        minArea
      ) {
        window.cancelAnimationFrame(animateId);
        doorAnimation.position = {
          x: door.position.x,
          y: door.position.y,
        };
        currentDoors.outsideDoor = door;
        switch (door.position.x) {
          case 271:
            currentDoors.name = 'Pokemon Center';
            currentDoors.insideDoor = doorZonePCenter[0];
            doorAnimation.image.src = doorAnimationSprites[2];
            enteringDoor();
            break;
          case 655:
            currentDoors.name = 'Home';
            currentDoors.insideDoor = doorZoneHome[0];
            doorAnimation.image.src = doorAnimationSprites[1];
            enteringDoor();
            break;
          case 687:
            currentDoors.name = 'Oak Lab';
            currentDoors.insideDoor = doorZoneLab[0];
            doorAnimation.image.src = doorAnimationSprites[0];
            enteringDoor();
            break;
          default:
            currentDoors.name = 'Route 1';
            currentDoors.insideDoor = doorZoneRoute1[0];
            audio.PalletTown.stop();
            audio.Route1.play();
            gsap.to('.overlappingDiv', {
              opacity: 1,
              onComplete() {
                player.position = {
                  x: currentDoors.insideDoor.position.x + 16,
                  y: currentDoors.insideDoor.position.y - currentDoors.insideDoor.height - 20,
                };
                route1();
                gsap.to('.overlappingDiv', {
                  opacity: 0,
                });
              },
            });
            break;
        }
      }
    });
  }
}

function movePlayer(boundaries) {
  let moving = true;

  if (keys.w.pressed && lastKey == 'w') {
    player.animate = true;
    player.image = playerSprites[1];

    boundaries.forEach((boundary) => {
      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y - 1 } },
          boundary,
        )
      ) {
        moving = false;
      }
    });

    if (moving) {
      player.position.y -= 1;
    }
  } else if (keys.a.pressed && lastKey == 'a') {
    player.animate = true;
    player.image = playerSprites[2];

    boundaries.forEach((boundary) => {
      if (
        collision(
          { ...player, position: { x: player.position.x - 1, y: player.position.y } },
          boundary,
        )
      ) {
        moving = false;
      }
    });

    if (moving) {
      player.position.x -= 1;
    }
  } else if (keys.s.pressed && lastKey == 's') {
    player.animate = true;
    player.image = playerSprites[0];

    boundaries.forEach((boundary) => {
      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y + 1 } },
          boundary,
        )
      ) {
        moving = false;
      }
    });

    if (moving) {
      player.position.y += 1;
    }
  } else if (keys.d.pressed && lastKey == 'd') {
    player.animate = true;
    player.image = playerSprites[3];

    boundaries.forEach((boundary) => {
      if (
        collision(
          { ...player, position: { x: player.position.x + 1, y: player.position.y } },
          boundary,
        )
      ) {
        moving = false;
      }
    });

    if (moving) {
      player.position.x += 1;
    }
  }
}

// button run
document.querySelector('.run').addEventListener('click', () => {
  audio.runAway.play();
  queue.push(() => {
    audio.battle.stop();
    transitionMap();
  });
  document.querySelector('.dialogueBox').style.display = 'block';
  showMessage('Got away safely!');
});

// choose pokemon screen
function introduction() {
  document.querySelector('.instructions').addEventListener('click', () => {
    document.querySelector('.userInterface').style.display = 'block';
    document.querySelector('.dialogueBox').style.display = 'block';
    document.querySelector('.hpBarInterface.enemy').style.display = 'none';
    document.querySelector('.hpBarInterface.player').style.display = 'none';
    document.querySelector('.introduction').style.display = 'grid';
    document.querySelector('.instructions').style.display = 'none';
    audio.soundEffect.play();
    audio.introduction.play();

    showMessage('Choose your pokemon!', false, false);
  });

  document.querySelectorAll('.starter').forEach((option) => {
    option.addEventListener('click', () => {
      queue = [];
      document.querySelector('.buttons').style.display = 'none';
      document.querySelector('.buttons').style.opacity = '0';
      audio.soundEffect.play();
      yourPokemon = option.classList[1];
      showMessage('Do you choose ' + yourPokemon + '?', true, false);
    });
  });

  document.querySelector('#yes').addEventListener('click', listenerYes);
  document.querySelector('#no').addEventListener('click', listenerNo);
}

function listenerYes() {
  document.querySelector('.buttons').style.display = 'none';
  document.querySelector('.buttons').style.opacity = '0';
  queue.push(() => {
    showMessage(
      'Good choice, take care of ' +
        yourPokemon +
        ' and have a good adventure in the world of pokemons.',
      false,
      true,
    );

    switch (yourPokemon) {
      case 'Bulbasaur':
        pokemonPlayer = new Pokemon(pokemons.bulbasaur);
        break;
      case 'Charmander':
        pokemonPlayer = new Pokemon(pokemons.charmander);
        break;
      case 'Squirtle':
        pokemonPlayer = new Pokemon(pokemons.squirtle);
        break;
    }
    teamPokemon.push(pokemonPlayer);
  });

  queue.push(() => {
    //transition to map
    audio.introduction.stop();
    gsap.to('.overlappingDiv', {
      opacity: 1,
      onComplete: () => {
        document.querySelector('.introduction').style.display = 'none';
        document.querySelector('.userInterface').style.display = 'none';
        laboratory();
        gsap.to('.overlappingDiv', {
          opacity: 0,
        });
        audio.OakLaboratory.play();
      },
    });
  });
}

function listenerNo() {
  document.querySelector('.buttons').style.display = 'none';
  document.querySelector('.buttons').style.opacity = '0';
  queue.push(() => {
    showMessage('Choose your pokemon!', false, false);
  });
}

introduction();
