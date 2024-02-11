class Sprite {
  constructor({
    position,
    positionAnimation,
    image,
    frames,
    animate = false,
    hold = 10,
    opacity = 1,
    rotation = 0,
  }) {
    this.position = position;
    this.positionAnimation = positionAnimation;
    this.image = new Image();
    this.image.src = image.src;
    this.frames = frames;
    this.hold = hold;
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.animate = animate;
    this.opacity = opacity;
    this.rotation = rotation;
  }

  draw() {
    c.save();
    c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    c.rotate(this.rotation);
    c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height,
    );
    c.restore();

    if (!this.animate) {
      this.frames.val = this.frames.initial;
      return;
    }

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % this.hold === 0) {
      if (this.frames.val < this.frames.max - 1) {
        this.frames.val++;
      } else {
        this.frames.val = 0;
      }
    }
  }
}

class Pokemon extends Sprite {
  constructor({
    position,
    positionAnimation,
    image,
    frames,
    animate = false,
    hold = 10,
    isEnemy = false,
    name,
    types,
    attacks,
    level,
    expPoints,
    baseExperience,
    baseStats,
  }) {
    super({ position, positionAnimation, image, frames, animate, hold, isEnemy, name });
    this.name = name;
    this.types = types;
    this.isEnemy = isEnemy;
    this.attacks = attacks;
    this.level = level;
    this.expPoints = expPoints;
    this.baseExperience = baseExperience;
    this.baseStats = baseStats;
    this.health = this.hp();
  }
  attack({ attack, recipient, renderedSprites }) {
    document.querySelector('.dialogueBox').style.display = 'block';
    showMessage(this.name + ' used ' + attack.name + '!');

    let movementDistance = 20;
    let healthBar = '.enemyHealthBar';
    if (this.isEnemy) {
      movementDistance = -20;
      healthBar = '.playerHealthBar';
    }

    recipient.health -= this.damage(attack, recipient);
    if (recipient.health < 0) recipient.health = 0;

    switch (attack.name) {
      case 'Tackle':
        audio.tackle.play();
        const tl = gsap.timeline();
        tl.to(this.position, {
          x: this.position.x - movementDistance,
          duration: 0.2,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete() {
              //Animation hit
              audio.hit.play();
              gsap.to(healthBar, {
                width: (recipient.health / recipient.hp()) * 100 + '%',
              });

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x,
          });
        break;
      case 'Ember':
        audio.ember.play();
        const imgEmber = new Image();
        imgEmber.src = 'fireball.png';
        const ember = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: imgEmber,
          frames: {
            val: 0,
            max: 4,
            elapsed: 0,
            initial: 0,
          },
          animate: true,
          hold: 10,
        });

        renderedSprites.splice(1, 0, ember);

        gsap.to(ember.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete() {
            //Animation hit
            audio.hit.play();
            gsap.to(healthBar, {
              width: (recipient.health / recipient.hp()) * 100 + '%',
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });
        break;
      case 'Razor Leaf':
        audio.razorLeaf.play();
        let j = 0;
        for (let i = 0; i < 4; i++) {
          if (i % 2 == 0 && i != 0) j++;
          const leaf = new Sprite({
            position: {
              x: this.position.x,
              y: this.position.y,
            },
            image: {
              src: 'leaf.png',
            },
            frames: {
              val: 0,
              max: 4,
              elapsed: 0,
              initial: 0,
            },
            animate: true,
            hold: 8,
          });

          renderedSprites.splice(1, 0, leaf);

          gsap.to(leaf.position, {
            x: this.position.x + i * 50 - j * 100,
            y: this.position.y - j * 50,
            duration: 1,
            onComplete() {
              leaf.animate = false;

              if (i % 2 == 0 && i != 0) j++;
              gsap.to(leaf.position, {
                x: recipient.position.x + recipient.width * 1.5 + i * 50 - j * 100,
                y: recipient.position.y + recipient.height * 1.5 - j * 50,
                duration: 1.5,
                onComplete() {
                  //Animation hit
                  if (i == 3) {
                    audio.hit.play();
                    gsap.to(healthBar, {
                      width: (recipient.health / recipient.hp()) * 100 + '%',
                    });

                    gsap.to(recipient.position, {
                      x: recipient.position.x + 10,
                      yoyo: true,
                      repeat: 5,
                      duration: 0.08,
                    });

                    gsap.to(recipient, {
                      opacity: 0,
                      repeat: 5,
                      yoyo: true,
                      duration: 0.08,
                    });
                  }
                  renderedSprites.splice(1, 1);
                },
              });
            },
          });
        }
        break;
      case 'Water Pulse':
        //bubble animation
        audio.waterPulse.play();
        let k = 0;
        for (let i = 0; i < 5; i++) {
          if (i % 3 == 0 && i != 0) k++;
          const bubble = new Sprite({
            position: {
              x: this.position.x + i * 200 - k * 500,
              y: this.position.y - k * 100,
            },
            image: {
              src: 'bubble.png',
            },
            frames: {
              val: 0,
              max: 6,
              elapsed: 0,
              initial: 0,
            },
            animate: true,
            hold: 15,
          });

          renderedSprites.splice(1, 0, bubble);

          gsap.to(bubble.position, {
            x: bubble.position.x,
            y: bubble.position.y - 100,
            duration: 1,
            onComplete() {
              bubble.animate = false;
              renderedSprites.splice(1, 1);
            },
          });
        }

        //pulse animation
        const pulse = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: {
            src: 'pulse.png',
          },
          frames: {
            val: 0,
            max: 1,
            elapsed: 0,
            initial: 0,
          },
        });

        renderedSprites.splice(1, 0, pulse);

        gsap.to(pulse.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 1,
          onComplete() {
            //Animation hit
            audio.hit.play();
            gsap.to(healthBar, {
              width: (recipient.health / recipient.hp()) * 100 + '%',
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });

        break;
    }

    if (!recipient.isEnemy) {
      document.querySelector('.healthPoints').innerHTML = recipient.health + '/' + recipient.hp();
    }
  }

  faint() {
    showMessage(this.name + ' fainted!');
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
      onComplete() {
        this._targets[0].position.y -= 20;
      },
    });
    audio.battle.stop();
    if (this.isEnemy) {
      audio.victory.play();
    }
  }

  damage(attack, target) {
    let atk;
    let def;
    let stab = 1;
    if (attack.category == 'Physical') {
      atk = this.atk();
      def = target.def();
    } else {
      atk = this.spAtk();
      def = target.spDef();
    }
    if (attack.type == this.types.type1 || attack.type == this.types.type2) {
      stab = 1.5;
    }
    return Math.floor(((((2 * this.level) / 5 + 2) * attack.power * atk) / def / 50 + 3) * stab);
  }

  expPerLevel(level) {
    return Math.floor((6 / 5) * level ** 3 - 15 * level ** 2 + 100 * level - 140);
  }

  percentageToNextLvl() {
    const expCurrentLevel = pokemonPlayer.expPerLevel(pokemonPlayer.level);
    const expNextLevel = pokemonPlayer.expPerLevel(pokemonPlayer.level + 1);
    const expToNextLevel = expNextLevel - expCurrentLevel;
    return Math.floor(((pokemonPlayer.expPoints - expCurrentLevel) / expToNextLevel) * 100);
  }

  //stats formulas
  hp() {
    return Math.floor(((2 * this.baseStats.hp + 31) * this.level) / 100 + this.level + 10);
  }

  atk() {
    return Math.floor(((2 * this.baseStats.atk + 31) * this.level) / 100 + 5);
  }

  spAtk() {
    return Math.floor(((2 * this.baseStats.spAtk + 31) * this.level) / 100 + 5);
  }

  def() {
    return Math.floor(((2 * this.baseStats.def + 31) * this.level) / 100 + 5);
  }

  spDef() {
    return Math.floor(((2 * this.baseStats.spDef + 31) * this.level) / 100 + 5);
  }

  spd() {
    return Math.floor(((2 * this.baseStats.spd + 31) * this.level) / 100 + 5);
  }
}

class Boundary {
  static width = 32;
  static height = 32;
  constructor({ position }) {
    this.position = position;
    this.width = 32;
    this.height = 32;
  }

  draw() {
    c.fillStyle = 'rgb(0, 0, 0, 0)';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
