const home = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'PlayerHome.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const foregroundHome = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'ForegroundHome.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const momSprites = [
  'mom_sprite/mom-down.png',
  'mom_sprite/mom-left.png',
  'mom_sprite/mom-right.png',
  'mom_sprite/mom-up.png',
  'mom_sprite/mom-hair-down.png',
  'mom_sprite/mom-hair-left.png',
  'mom_sprite/mom-hair-right.png',
];

const mom = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: momSprites[0],
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const momHair = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: momSprites[4],
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const collisonObjectsHome = [];
for (let i = 0; i < objectsHome.length; i += 30) {
  collisonObjectsHome.push(objectsHome.slice(i, 30 + i));
}

const collisonWallHome = [];
for (let i = 0; i < wallHome.length; i += 30) {
  collisonWallHome.push(wallHome.slice(i, 30 + i));
}

const doorHome = [];
for (let i = 0; i < collisionDoorHome.length; i += 30) {
  doorHome.push(collisionDoorHome.slice(i, 30 + i));
}

const boundariesHome = [];
const doorZoneHome = [];

collisonObjectsHome.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 303) {
      boundariesHome.push(
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

collisonWallHome.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 303) {
      boundariesHome.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height + 7 * 2,
          },
        }),
      );
    }
  });
});

doorHome.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 303) {
      doorZoneHome.push(
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

function playerHome() {
  homeId = window.requestAnimationFrame(playerHome);
  home.draw();
  boundariesHome.forEach((boundary) => {
    boundary.draw();
  });
  doorZoneHome.forEach((door) => {
    door.draw();
  });

  mom.draw();
  player.draw();
  foregroundHome.draw();
  momHair.draw();

  transition = false;
  player.animate = false;
  doorAnimation.animate = true;
  doorAnimation.frames.val = 0;

  if (!conversation) {
    //player walking
    movePlayer(boundariesHome);

    //activate a coversation
    if (keys.enter.pressed) {
      let momCollision = boundariesHome[26];

      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y - 1 } },
          momCollision,
        )
      ) {
        mom.image.src = momSprites[0];
        momHair.image.src = momSprites[4];
        talkingToMom();
      }
      if (
        collision(
          { ...player, position: { x: player.position.x + 1, y: player.position.y } },
          momCollision,
        )
      ) {
        mom.image.src = momSprites[1];
        momHair.image.src = momSprites[5];
        talkingToMom();
      }
      if (
        collision(
          { ...player, position: { x: player.position.x - 1, y: player.position.y } },
          momCollision,
        )
      ) {
        mom.image.src = momSprites[2];
        momHair.image.src = momSprites[6];
        talkingToMom();
      }

      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y + 1 } },
          momCollision,
        )
      ) {
        mom.image.src = momSprites[3];
        momHair.image.src = momSprites[4];
        talkingToMom();
      }
    }
  }

  //activate a door
  if (keys.s.pressed) {
    doorZoneHome.forEach((door) => {
      if (
        collision({ ...player, position: { x: player.position.x, y: player.position.y + 1 } }, door)
      ) {
        window.cancelAnimationFrame(homeId);

        gsap.to('.overlappingDiv', {
          opacity: 1,
          onComplete() {
            player.position = {
              x: currentDoors.outsideDoor.position.x,
              y: currentDoors.outsideDoor.position.y + player.height,
            };
            animate();
            gsap.to('.overlappingDiv', {
              opacity: 0,
            });
          },
        });
      }
    });
  }
}

function talkingToMom() {
  conversation = true;
  document.querySelector('.userInterface').style.display = 'block';
  document.querySelector('.dialogueBox').style.display = 'block';
  document.querySelector('.hpBarInterface.enemy').style.display = 'none';
  document.querySelector('.hpBarInterface.player').style.display = 'none';

  showMessage(
    'Hi son! Be careful when going Route 1. There are a lot of wild pokémons.',
    false,
    true,
  );

  queue.push(() => {
    document.querySelector('.userInterface').style.display = 'none';
    conversation = false;
  });
}
