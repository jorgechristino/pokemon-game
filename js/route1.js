const backgroundRoute1 = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: {
    src: 'Route1.png',
  },
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const collisonObjectsRoute1 = [];
for (let i = 0; i < objectsRoute1.length; i += 30) {
  collisonObjectsRoute1.push(objectsRoute1.slice(i, 30 + i));
}

const battleZoneMap = [];
for (let i = 0; i < collisionBattle.length; i += 30) {
  battleZoneMap.push(collisionBattle.slice(i, 30 + i));
}

const doorRoute1 = [];
for (let i = 0; i < collisionDoorRoute1.length; i += 30) {
  doorRoute1.push(collisionDoorRoute1.slice(i, 30 + i));
}

const boundariesRoute1 = [];
const battleZones = [];
const doorZoneRoute1 = [];

collisonObjectsRoute1.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1910) {
      boundariesRoute1.push(
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

battleZoneMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1910) {
      battleZones.push(
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

doorRoute1.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1910) {
      doorZoneRoute1.push(
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

doorZoneRoute1[0].width *= 2;

const battle = {
  initilized: false,
};

function route1() {
  route1Id = window.requestAnimationFrame(route1);
  backgroundRoute1.draw();
  boundariesRoute1.forEach((boundary) => {
    boundary.draw();
  });
  doorZoneRoute1.forEach((door) => {
    door.draw();
  });

  player.draw();

  transition = false;
  player.animate = false;

  if (battle.initilized) return;

  //activate a battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    battleZones.forEach((battleZone) => {
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        collision(
          { ...player, position: { x: player.position.x - 1, y: player.position.y } },
          battleZone,
        ) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        //desactivate animation loop
        window.cancelAnimationFrame(route1Id);
        audio.Route1.stop();
        audio.battle.play();
        battle.initilized = true;
        gsap.to('.overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('.overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                //activate a new animation loop
                initBattle();
                animateBattle();
                gsap.to('.overlappingDiv', {
                  opacity: 0,
                  duration: 0.4,
                  onComplete() {
                    gsap.to(battleFields.position, {
                      x: 0,
                      duration: 2,
                    });
                    gsap.to(pikachu.position, {
                      x: pikachu.positionAnimation,
                      duration: 2,
                      onComplete() {
                        audio.pikachuSound.play();
                      },
                    });
                    gsap.to(pokemonPlayer.position, {
                      x: pokemonPlayer.positionAnimation,
                      duration: 2,
                    });
                  },
                });
              },
            });
          },
        });
      }
    });
  }

  if (!conversation) {
    //player walking
    movePlayer(boundariesRoute1);
  }

  //activate a door
  if (keys.s.pressed) {
    doorZoneRoute1.forEach((door) => {
      if (
        collision({ ...player, position: { x: player.position.x, y: player.position.y + 1 } }, door)
      ) {
        window.cancelAnimationFrame(route1Id);
        audio.Route1.stop();
        audio.PalletTown.play();
        gsap.to('.overlappingDiv', {
          opacity: 1,
          onComplete() {
            player.position = {
              x: currentDoors.outsideDoor.position.x + 32,
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
