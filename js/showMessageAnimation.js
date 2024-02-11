function showMessage(text, animateBtn = false, battle = true) {
  document.querySelector('.attackBar').style.display = 'none';
  document.querySelector('.options').style.display = 'none';
  document.querySelector('.text').innerHTML = '';

  text.split('').forEach((c) => {
    let span = document.createElement('span');
    span.style.opacity = '0';
    span.innerHTML = c;
    document.querySelector('.text').append(span);
  });
  const triangule = document.createElement('span');
  triangule.classList.add('triangule');
  triangule.style.opacity = '0';
  document.querySelector('.text').append(triangule);

  const chars = document.querySelectorAll('.text span');

  for (let i = 0; i < chars.length; i++) {
    setTimeout(() => {
      gsap.to(chars[i], {
        duration: 0.2,
        opacity: 1,
      });
    }, 100 * (i + 1));
  }

  setTimeout(() => {
    gsap.to(triangule, {
      duration: 0.2,
      opacity: 1,
      onComplete() {
        gsap.to(triangule, {
          y: -4,
          duration: 0.4,
          yoyo: true,
          repeat: -1,
        });

        if (animateBtn) {
          document.querySelector('.buttons').style.display = 'block';
          const btns = document.querySelector('.buttons');
          gsap.to(btns, {
            duration: 0.5,
            opacity: 1,
          });
        }
      },
    });
    if (battle) {
      document.querySelector('.dialogueBox').classList.remove('default');
      document.querySelector('.dialogueBox').classList.add('active');
      document.querySelector('.attackBar').style.display = 'grid';
      document.querySelector('.options').style.display = 'grid';
    }
  }, 100 * chars.length);
}
