(() => {
  'use strict';
  const scenes = [...document.querySelectorAll('.scene')];
  const stage = document.querySelector('#presentation');
  const links = [...document.querySelectorAll('[data-scene-link]')];
  const previous = document.querySelector('.previous');
  const next = document.querySelector('.next');
  const status = document.querySelector('#scene-status');
  const motionButton = document.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, scenes.findIndex(scene => `#${scene.id}` === location.hash));
  let busy = false;
  let paused = reduced.matches;
  let animations = [];
  let wheelTotal = 0;
  let wheelConsumed = false;
  let wheelTimer;
  let touchOrigin = null;
  let pointerFrame;

  function motion() { return !paused && !reduced.matches; }

  function updateMotion() {
    document.body.dataset.motion = motion() ? 'on' : 'off';
    const label = motion() ? 'Выключить анимацию' : 'Включить анимацию';
    motionButton.setAttribute('aria-label', label);
    motionButton.setAttribute('title', label);
    motionButton.setAttribute('aria-pressed', String(!motion()));
    motionButton.querySelector('use').setAttribute('href', motion() ? '#pause' : '#play');
    if (!motion()) {
      stage.style.setProperty('--px', '0px');
      stage.style.setProperty('--py', '0px');
      animations.forEach(animation => animation.finish());
    }
  }

  function updateNavigation() {
    document.body.dataset.scene = scenes[index].id;
    links.forEach(link => {
      const selected = Number(link.dataset.sceneLink) === index;
      link.classList.toggle('current', selected);
      if (selected) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    previous.disabled = index === 0;
    next.disabled = index === scenes.length - 1;
    document.querySelector('.scene-nav a.current').scrollIntoView({
      block: 'nearest', inline: 'nearest', behavior: motion() ? 'smooth' : 'auto'
    });
    status.textContent = `Раздел ${index + 1} из ${scenes.length}: ${scenes[index].dataset.name}`;
  }

  async function go(target, { keyboard = false, writeHash = true } = {}) {
    if (busy || target === index || target < 0 || target >= scenes.length) return false;
    busy = true;
    const old = scenes[index];
    const incoming = scenes[target];
    const direction = target > index ? 1 : -1;
    old.classList.remove('is-current');
    old.classList.add('is-leaving');
    old.inert = true;
    old.setAttribute('aria-hidden', 'true');
    incoming.hidden = false;
    incoming.inert = false;
    incoming.removeAttribute('aria-hidden');
    incoming.classList.add('is-current');
    incoming.scrollTop = 0;
    index = target;
    updateNavigation();
    if (writeHash) history.replaceState(null, '', `#${incoming.id}`);
    if (keyboard) incoming.querySelector('h1, h2').focus({ preventScroll: true });
    animations = [];
    if (motion() && typeof incoming.animate === 'function') {
      const textOffset = matchMedia('(max-width: 760px)').matches ? 12 : 28;
      animations.push(old.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: `translateY(${-direction * 65}px)` }
      ], { duration: 420, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'both' }));
      animations.push(incoming.animate([
        { clipPath: direction > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0 0)' }
      ], { duration: 820, easing: 'cubic-bezier(.2,.75,.15,1)', fill: 'both' }));
      incoming.querySelectorAll('.reveal').forEach((element, position) => {
        animations.push(element.animate([
          { opacity: 0, transform: `translateY(${direction * textOffset}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 590, delay: 110 + position * 60, easing: 'cubic-bezier(.2,.75,.15,1)', fill: 'both' }));
      });
      const art = incoming.querySelector('.visual');
      if (art) animations.push(art.animate([
        { opacity: 0, transform: `translate3d(${direction * 55}px,0,0)` },
        { opacity: 1, transform: 'translate3d(0,0,0)' }
      ], { duration: 850, delay: 80, easing: 'cubic-bezier(.2,.75,.15,1)', fill: 'both' }));
      await Promise.allSettled(animations.map(animation => animation.finished));
    }
    old.hidden = true;
    old.classList.remove('is-leaving');
    animations.forEach(animation => animation.cancel());
    animations = [];
    busy = false;
    return true;
  }

  function canScrollScene(delta) {
    const scene = scenes[index];
    return scene.scrollHeight > scene.clientHeight + 2 &&
      (delta > 0 ? scene.scrollTop + scene.clientHeight < scene.scrollHeight - 2 : scene.scrollTop > 1);
  }

  document.body.classList.add('enhanced');
  scenes.forEach((scene, position) => {
    const active = position === index;
    scene.classList.toggle('is-current', active);
    scene.hidden = !active;
    scene.inert = !active;
    if (!active) scene.setAttribute('aria-hidden', 'true');
  });
  updateMotion();
  updateNavigation();

  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    go(Number(link.dataset.sceneLink), { keyboard: event.detail === 0 });
  }));
  previous.addEventListener('click', event => go(index - 1, { keyboard: event.detail === 0 }));
  next.addEventListener('click', event => go(index + 1, { keyboard: event.detail === 0 }));
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });

  document.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (canScrollScene(event.deltaY)) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelTotal = 0; wheelConsumed = false; }, 190);
    if (busy || wheelConsumed) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
    wheelTotal += delta;
    if (Math.abs(wheelTotal) >= 55) {
      wheelConsumed = true;
      go(index + Math.sign(wheelTotal));
      wheelTotal = 0;
    }
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable=true],[role=tablist]')) return;
    if (event.key === ' ' && event.target.closest('button,a')) return;
    const targets = { ArrowDown: index + 1, PageDown: index + 1, ' ': index + 1,
      ArrowUp: index - 1, PageUp: index - 1, Home: 0, End: scenes.length - 1 };
    if (!(event.key in targets)) return;
    if (canScrollScene(targets[event.key] - index)) return;
    event.preventDefault();
    go(targets[event.key], { keyboard: true });
  });

  stage.addEventListener('touchstart', event => {
    touchOrigin = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (!touchOrigin || event.touches.length !== 1) { touchOrigin = null; return; }
    const delta = touchOrigin.y - event.touches[0].clientY;
    if (!canScrollScene(delta) && Math.abs(delta) > 8) event.preventDefault();
  }, { passive: false });
  stage.addEventListener('touchend', event => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const deltaY = touchOrigin.y - event.changedTouches[0].clientY;
    const deltaX = touchOrigin.x - event.changedTouches[0].clientX;
    touchOrigin = null;
    if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3 && !canScrollScene(deltaY)) go(index + Math.sign(deltaY));
  }, { passive: true });

  stage.addEventListener('pointermove', event => {
    if (!motion() || event.pointerType !== 'mouse' || busy) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      stage.style.setProperty('--px', `${(event.clientX / innerWidth - .5) * 8}px`);
      stage.style.setProperty('--py', `${(event.clientY / innerHeight - .5) * 8}px`);
    });
  });
  stage.addEventListener('pointerleave', () => { stage.style.setProperty('--px', '0px'); stage.style.setProperty('--py', '0px'); });
  window.addEventListener('hashchange', () => {
    const target = scenes.findIndex(scene => `#${scene.id}` === location.hash);
    if (target >= 0) go(target, { writeHash: false });
  });

  const modelPaths = {
    OpenAI: 'M130 80H225V235H300', Gemini: 'M470 80H375V235H300',
    Claude: 'M130 390H225V235H300', Ollama: 'M470 390H375V235H300'
  };
  document.querySelectorAll('[data-model]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-model]').forEach(item => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelector('#model-name').textContent = button.dataset.model;
    document.querySelector('#model-note').textContent = button.dataset.modelNote;
    document.querySelector('.model-paths .signal-path').setAttribute('d', modelPaths[button.dataset.model]);
  }));

  document.querySelectorAll('[role=tablist]').forEach(group => {
    const tabs = [...group.querySelectorAll('[role=tab]')];
    function selectTab(button) {
      tabs.forEach(tab => {
        const selected = tab === button;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      });
    }
    tabs.forEach((button, position) => {
      button.addEventListener('click', () => selectTab(button));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (position + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
        selectTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
  });

  if (motion()) {
    scenes[index].querySelectorAll('.reveal').forEach((element, position) => {
      element.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 650, delay: 100 + position * 85, easing: 'cubic-bezier(.2,.75,.15,1)', fill: 'backwards' });
    });
  }
})();
