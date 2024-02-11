const pokeCenter = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'PokemonCenter.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const foregroundPokeCenter = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'ForegroundPokeCenter.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const nurseSprites = [
  'nurse_sprite/nurse-down.png',
  'nurse_sprite/nurse-left.png',
  'nurse_sprite/nurse-thank.png',
];

const nurse = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: nurseSprites[0],
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const pokeBalls = [];

const collisonObjectsPCenter = [];
for (let i = 0; i < objectsPCenter.length; i += 30) {
  collisonObjectsPCenter.push(objectsPCenter.slice(i, 30 + i));
}

const doorPCenter = [];
for (let i = 0; i < collisionDoorPCenter.length; i += 30) {
  doorPCenter.push(collisionDoorPCenter.slice(i, 30 + i));
}

const boundariesPCenter = [];
const doorZonePCenter = [];

collisonObjectsPCenter.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 333) {
      boundariesPCenter.push(
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

doorPCenter.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 333) {
      doorZonePCenter.push(
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

function pokemonCenter() {
  pokeCenterId = window.requestAnimationFrame(pokemonCenter);
  pokeCenter.draw();
  boundariesPCenter.forEach((boundary) => {
    boundary.draw();
  });
  doorZonePCenter.forEach((door) => {
    door.draw();
  });

  nurse.draw();
  player.draw();
  foregroundPokeCenter.draw();
  pokeBalls.forEach((pokeBall) => {
    pokeBall.draw();
  });

  transition = false;
  player.animate = false;
  doorAnimation.animate = true;
  doorAnimation.frames.val = 0;

  if (!conversation) {
    //player walking
    movePlayer(boundariesPCenter);

    // activate a coversation
    if (keys.enter.pressed) {
      let counterCollision = boundariesPCenter[20];

      if (
        collision(
          { ...player, position: { x: player.position.x, y: player.position.y - 1 } },
          counterCollision,
        )
      ) {
        talkingToNurse();
      }
    }
  }

  //activate a door
  if (keys.s.pressed) {
    doorZonePCenter.forEach((door) => {
      if (
        collision({ ...player, position: { x: player.position.x, y: player.position.y + 1 } }, door)
      ) {
        window.cancelAnimationFrame(pokeCenterId);

        audio.PokemonCenter.stop();
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

function initPokeCenter() {
  let numberOfPokemons = teamPokemon.length;
  let j = 0;
  for (let i = 0; i < numberOfPokemons; i++) {
    if (i % 2 == 0 && i != 0) j++;
    const pokeBall = new Sprite({
      position: {
        x: 426 + i * 12 - j * 24,
        y: 200 + j * 8,
      },
      image: {
        src: 'pokeBall.png',
      },
      frames: {
        val: 0,
        max: 5,
        elapsed: 0,
        initial: 0,
      },
      animate: false,
      hold: 50,
      opacity: 0,
    });

    pokeBalls.push(pokeBall);
  }

  document.querySelector('#yes').removeEventListener('click', listenerYes);
  document.querySelector('#no').removeEventListener('click', listenerNo);

  document.querySelector('#yes').addEventListener('click', (event) => {
    document.querySelector('.buttons').style.display = 'none';
    document.querySelector('.buttons').style.opacity = '0';

    //heal pokemons
    teamPokemon.forEach((pokemon) => {
      pokemon.health = pokemon.hp();
    });

    healingAnimation();
  });

  document.querySelector('#no').addEventListener('click', (event) => {
    document.querySelector('.buttons').style.display = 'none';
    document.querySelector('.buttons').style.opacity = '0';
    queue.push(() => {
      showMessage('We hope to see you again!', false, true);
    });

    queue.push(() => {
      document.querySelector('.userInterface').style.display = 'none';
      conversation = false;
    });
  });
}

function talkingToNurse() {
  conversation = true;
  document.querySelector('.userInterface').style.display = 'block';
  document.querySelector('.dialogueBox').style.display = 'block';
  document.querySelector('.hpBarInterface.enemy').style.display = 'none';
  document.querySelector('.hpBarInterface.player').style.display = 'none';

  showMessage(
    'Welcome to our Pokémon Center! Would you like me to heal your Pokémon to perfect health?',
    true,
    false,
  );
}

function healingAnimation() {
  queue.push(() => {
    showMessage("Okay. I'll take your Pokémon for a few seconds.", false, false);
  });
  nurse.image.src = nurseSprites[1];

  setTimeout(() => {
    audio.pokemonHealed.play();
  }, pokeBalls.length * 1000);

  for (let i = 0; i < pokeBalls.length; i++) {
    setTimeout(() => {
      pokeBalls[i].opacity = 1;
    }, 1000 * i);
    setTimeout(() => {
      pokeBalls[i].animate = true;
    }, pokeBalls.length * 1000);
    setTimeout(() => {
      pokeBalls[i].animate = false;
      pokeBalls[i].val = 0;
    }, pokeBalls.length * 1000 + 3000);
    setTimeout(() => {
      pokeBalls[i].opacity = 0;
    }, pokeBalls.length * 1000 + 4000);
  }

  setTimeout(() => {
    nurse.image.src = nurseSprites[0];
    document.querySelector('.userInterface').style.display = 'block';
    showMessage("Thanks you for waiting. We've restored your Pokémon to full health.", false, true);

    queue.push(() => {
      showMessage('We hope to see you again!', false, true);
    });

    queue.push(() => {
      document.querySelector('.userInterface').style.display = 'none';
      conversation = false;
    });
  }, pokeBalls.length * 1000 + 4000);
}
