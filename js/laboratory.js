const doorAnimationSprites = ['animationDoor1.png', 'animationDoor2.png', 'animationDoor3.png'];

const doorAnimation = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: doorAnimationSprites[0],
  },
  frames: {
    val: 0,
    max: 3,
    elapsed: 0,
    initial: 0,
  },
  animate: true,
  hold: 60,
});

const lab = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'OakLab.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const foregroundLab = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'ForegroundLab.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const oakSprites = [
  'oak_sprite/oak-down.png',
  'oak_sprite/oak-left.png',
  'oak_sprite/oak-right.png',
  'oak_sprite/oak-up.png',
  'oak_sprite/oak-hair-down.png',
  'oak_sprite/oak-hair-left.png',
  'oak_sprite/oak-hair-right.png',
  'oak_sprite/oak-hair-up.png',
];

const profOak = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: oakSprites[0],
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const profOakHair = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: oakSprites[4],
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const collisonObjectsLab = [];
for (let i = 0; i < objectsLab.length; i += 30) {
  collisonObjectsLab.push(objectsLab.slice(i, 30 + i));
}

const collisonTable = [];
for (let i = 0; i < table.length; i += 30) {
  collisonTable.push(table.slice(i, 30 + i));
}

const collisionOak = [];
for (let i = 0; i < collisionPeople.length; i += 30) {
  collisionOak.push(collisionPeople.slice(i, 30 + i));
}

const doorLab = [];
for (let i = 0; i < collisionDoorLab.length; i += 30) {
  doorLab.push(collisionDoorLab.slice(i, 30 + i));
}

const boundariesLab = [];
const doorZoneLab = [];
const offsetLab = {
  x: 0,
  y: 3 * 2,
};

collisonObjectsLab.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 183) {
      boundariesLab.push(
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

collisonTable.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 183) {
      boundariesLab.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offsetLab.x,
            y: i * Boundary.height + offsetLab.y,
          },
        }),
      );
    }
  });
});

collisionOak.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 183) {
      boundariesLab.push(
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

doorLab.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 183) {
      doorZoneLab.push(
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

let conversation = false;
let transition = false;
function enteringDoor() {
  enteringDoorId = window.requestAnimationFrame(enteringDoor);

  town.draw();
  doorAnimation.draw();
  player.draw();

  if (transition) {
    return;
  }

  transition = true;

  gsap.to(player.position, {
    y: doorAnimation.position.y,
    duration: 2,
    onComplete() {
      player.animate = false;
      doorAnimation.animate = false;
      doorAnimation.frames.val = 2;
      doorAnimation.draw();
      player.draw();
      window.cancelAnimationFrame(enteringDoorId);
      gsap.to('.overlappingDiv', {
        opacity: 1,
        onComplete() {
          audio.PalletTown.stop();
          player.position = {
            x: currentDoors.insideDoor.position.x,
            y: currentDoors.insideDoor.position.y - currentDoors.insideDoor.height - 20,
          };
          switch (currentDoors.name) {
            case 'Home':
              audio.PalletTown.play();
              playerHome();
              break;
            case 'Oak Lab':
              audio.OakLaboratory.play();
              laboratory();
              break;
            case 'Pokemon Center':
              audio.PokemonCenter.play();
              initPokeCenter();
              pokemonCenter();
              break;
          }
          gsap.to('.overlappingDiv', {
            opacity: 0,
          });
        },
      });
    },
  });
}

let labId;
function laboratory() {
  labId = window.requestAnimationFrame(laboratory);
  lab.draw();
  boundariesLab.forEach((boundary) => {
    boundary.draw();
  });
  doorZoneLab.forEach((door) => {
    door.draw();
  });

  profOak.draw();
  player.draw();
  foregroundLab.draw();
  profOakHair.draw();

  transition = false;
  player.animate = false;
  doorAnimation.animate = true;
  doorAnimation.frames.val = 0;

  if (!conversation) {
    //player walking
    movePlayer(boundariesLab);

    //activate a coversation
    if (keys.enter.pressed) {
      let profOakCollision = boundariesLab[boundariesLab.length - 1];

      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y - 1 } },
          profOakCollision,
        )
      ) {
        profOak.image.src = oakSprites[0];
        profOakHair.image.src = oakSprites[4];
        talkingToOak();
      }
      if (
        collision(
          { ...player, position: { x: player.position.x + 1, y: player.position.y } },
          profOakCollision,
        )
      ) {
        profOak.image.src = oakSprites[1];
        profOakHair.image.src = oakSprites[5];
        talkingToOak();
      }
      if (
        collision(
          { ...player, position: { x: player.position.x - 1, y: player.position.y } },
          profOakCollision,
        )
      ) {
        profOak.image.src = oakSprites[2];
        profOakHair.image.src = oakSprites[6];
        talkingToOak();
      }

      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y + 1 } },
          profOakCollision,
        )
      ) {
        profOak.image.src = oakSprites[3];
        profOakHair.image.src = oakSprites[7];
        talkingToOak();
      }
    }
  }

  //activate a door
  if (keys.s.pressed) {
    doorZoneLab.forEach((door) => {
      if (
        collision({ ...player, position: { x: player.position.x, y: player.position.y + 1 } }, door)
      ) {
        window.cancelAnimationFrame(labId);

        audio.OakLaboratory.stop();
        audio.PalletTown.play();
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

function talkingToOak() {
  conversation = true;
  document.querySelector('.userInterface').style.display = 'block';
  document.querySelector('.dialogueBox').style.display = 'block';
  document.querySelector('.hpBarInterface.enemy').style.display = 'none';
  document.querySelector('.hpBarInterface.player').style.display = 'none';

  showMessage(
    'Hello! My name is Oak. People affectionately refer to me as the Pokémon Professor.',
    false,
    true,
  );

  let descriptionPoke = '';
  switch (yourPokemon) {
    case 'Bulbasaur':
      descriptionPoke =
        'There is a plant seed on its back right from the day this pokémon is born. The seed slowly grows larger';
      break;
    case 'Charmander':
      descriptionPoke =
        "The flame on its tail indicates Charmander's life force. If it is healthy, the flame burns brightly.";
      break;
    case 'Squirtle':
      descriptionPoke =
        'When it retracts its long neck into its shell, it squirts out water with vigorous force.';
      break;
  }

  queue.push(() => {
    showMessage('Oh! You choose ' + yourPokemon + '. ' + descriptionPoke, false, true);
  });

  queue.push(() => {
    document.querySelector('.userInterface').style.display = 'none';
    conversation = false;
  });
}
