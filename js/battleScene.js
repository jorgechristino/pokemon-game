const imgBattleBackground = new Image();
imgBattleBackground.src = 'battleBackground.png';

const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: imgBattleBackground,
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

const imgBattleFields = new Image();
imgBattleFields.src = 'battleFields.png';

const battleFields = new Sprite({
  position: {
    x: -200,
    y: 0,
  },
  image: imgBattleFields,
  frames: {
    val: 0,
    max: 1,
    elapsed: 0,
    initial: 0,
  },
});

let pokemonPlayer;
let pikachu;
let renderedSprites;
let battleAnimationId;
let queue = [];

function initBattle() {
  document.querySelector('.userInterface').style.display = 'block';
  document.querySelector('.dialogueBox').style.display = 'block';
  document.querySelector('.hpBarInterface.enemy').style.display = 'block';
  document.querySelector('.hpBarInterface.player').style.display = 'block';
  document.querySelector('.enemyHealthBar').style.width = '99%';
  document.querySelector('.playerHealthBar').style.width =
    (pokemonPlayer.health / pokemonPlayer.hp()) * 100 + '%';
  if ((pokemonPlayer.health / pokemonPlayer.hp()) * 100 == 100) {
    document.querySelector('.playerHealthBar').style.width = '99%';
  }
  document.querySelector('.attackBar').replaceChildren();
  pikachu = new Pokemon(pokemons.pikachu);
  pikachu.health = pikachu.hp();
  pokemonPlayer.opacity = 1;

  //experience calc
  document.querySelector('.experienceBar').style.width = pokemonPlayer.percentageToNextLvl() + '%';

  //pokemon info
  document.querySelector('.player .info .pokemonName').innerHTML = pokemonPlayer.name;
  document.querySelector('.enemy .info .pokemonName').innerHTML = pikachu.name;
  document.querySelector('.player .info .level').innerHTML = 'Lv' + pokemonPlayer.level;
  document.querySelector('.enemy .info .level').innerHTML = 'Lv' + pikachu.level;
  document.querySelector('.healthPoints').innerHTML =
    pokemonPlayer.health + '/' + pokemonPlayer.hp();

  renderedSprites = [pokemonPlayer, pikachu];
  showMessage('A wild ' + pikachu.name + ' appeared!');

  pokemonPlayer.attacks.forEach((attack) => {
    const button = document.createElement('a');
    button.classList.add('button');
    button.classList.add('attack' + attack.type);
    button.innerHTML = `<span></span><p>${
      attack.name
    }</p><div class="type ${attack.type.toLowerCase()}">${attack.type}</div>`;
    document.querySelector('.attackBar').append(button);
  });

  //event listeners for buttons (attacks)
  document.querySelectorAll('.button').forEach((button) => {
    button.addEventListener('click', (btn) => {
      audio.soundEffect.play();
      const selectedAttack =
        attacks[btn.currentTarget.innerHTML.split('<p>')[1].split('</p>')[0].replace(' ', '')];
      pokemonPlayer.attack({
        attack: selectedAttack,
        recipient: pikachu,
        renderedSprites,
      });

      if (pikachu.health <= 0) {
        queue.push(() => {
          pikachu.faint();
        });

        let currentHp = pokemonPlayer.hp();
        const gainExp = Math.floor((pokemonPlayer.baseExperience * pikachu.level) / 7);
        pokemonPlayer.expPoints += gainExp;

        queue.push(() => {
          showMessage(pokemonPlayer.name + ' gained ' + gainExp + ' Exp. Points!');
          if (pokemonPlayer.expPoints >= pokemonPlayer.expPerLevel(pokemonPlayer.level + 1)) {
            pokemonPlayer.level++;
            gsap.to('.experienceBar', {
              width: '100%',
              duration: 2,
              onComplete() {
                audio.levelUp.play();
                document.querySelector('.experienceBar').style.width = '0';
                gsap.to('.experienceBar', {
                  width: pokemonPlayer.percentageToNextLvl() + '%',
                  duration: 2,
                });
              },
            });
          } else {
            gsap.to('.experienceBar', {
              width: pokemonPlayer.percentageToNextLvl() + '%',
              duration: 2,
            });
          }
        });

        if (pokemonPlayer.expPoints >= pokemonPlayer.expPerLevel(pokemonPlayer.level + 1)) {
          queue.push(() => {
            showMessage(pokemonPlayer.name + ' grew to Lv. ' + pokemonPlayer.level + '!');
            document.querySelector('.player .info .level').innerHTML = 'Lv' + pokemonPlayer.level;
            const diffHp = pokemonPlayer.hp() - currentHp;
            pokemonPlayer.health += diffHp;
            document.querySelector('.healthPoints').innerHTML =
              pokemonPlayer.health + '/' + pokemonPlayer.hp();
          });
        }

        queue.push(transitionMap);
        return;
      }

      //enemy attack
      const randomAttack = pikachu.attacks[Math.floor(Math.random() * pikachu.attacks.length)];

      queue.push(() => {
        pikachu.attack({
          attack: randomAttack,
          recipient: pokemonPlayer,
          renderedSprites,
        });

        if (pokemonPlayer.health <= 0) {
          queue.push(() => {
            pokemonPlayer.faint();
          });

          queue.push(() => {
            transitionMap(true);
          });
          return;
        }
      });
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();
  battleFields.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

document.querySelector('.dialogueBox').addEventListener('click', (box) => {
  document.querySelector('.dialogueBox').classList.remove('active');
  document.querySelector('.dialogueBox').classList.add('default');
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    box.currentTarget.style.display = 'none';
  }
  audio.soundEffect.play();
});

window.addEventListener('keyup', (e) => {
  if (e.key == 'Enter' && document.querySelector('.dialogueBox').classList.contains('active')) {
    document.querySelector('.dialogueBox').classList.remove('active');
    document.querySelector('.dialogueBox').classList.add('default');
    if (queue.length > 0) {
      queue[0]();
      queue.shift();
    } else {
      document.querySelector('.dialogueBox').style.display = 'none';
    }
    audio.soundEffect.play();
  }
});

function transitionMap(allPokemonsFainted = false) {
  //transition back to map
  document.querySelector('.attackBar').style.display = 'none';
  document.querySelector('.options').style.display = 'none';
  gsap.to('.overlappingDiv', {
    opacity: 1,
    onComplete: () => {
      cancelAnimationFrame(battleAnimationId);
      document.querySelector('.userInterface').style.display = 'none';
      gsap.to('.overlappingDiv', {
        opacity: 0,
      });
      battle.initilized = false;
      if (!allPokemonsFainted) {
        route1();
        audio.victory.stop();
        audio.Route1.play();
      } else {
        player.position = {
          x: 480,
          y: 279,
        };
        player.image = playerSprites[1];
        pokemonCenter();
        currentDoors.outsideDoor = doorsZones[1];
        audio.PokemonCenter.play();

        //heal pokemons
        teamPokemon.forEach((pokemon) => {
          pokemon.health = pokemon.hp();
        });

        conversation = true;
        document.querySelector('.userInterface').style.display = 'block';
        document.querySelector('.dialogueBox').style.display = 'block';
        document.querySelector('.hpBarInterface.enemy').style.display = 'none';
        document.querySelector('.hpBarInterface.player').style.display = 'none';

        showMessage(
          "All your Pokémons were fainted! We've restored your Pokémons to full health.",
          false,
          true,
        );

        queue.push(() => {
          document.querySelector('.userInterface').style.display = 'none';
          conversation = false;
        });
      }

      battleFields.position.x = -200;
      pikachu.position.x -= 200;
      pokemonPlayer.position.x -= 200;
    },
  });
}
