import './style.css';
import { createScene } from './scene.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scene;
let elapsed = 0;
let previous = performance.now();
let animationId;
let firstFrame = true;

function showError(error) {
  console.error(error);
  cancelAnimationFrame(animationId);
  $('loading').hidden = true;
  $('error').hidden = false;
}

try {
  scene = createScene($('universe'), reducedMotion);
} catch (error) {
  showError(error);
}

if (scene) {
  $('auto-orbit').checked = !reducedMotion;
  const setRange = (id) => {
    const input = $(id);
    const value = Number(input.value);
    $(`${id}-value`).textContent = `${value.toFixed(2)}×`;
    const percent = (value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;
    input.style.background = `linear-gradient(to right,var(--gold) ${percent}%,#ffffff16 ${percent}%)`;
    if (id === 'intensity') scene.uniforms.uIntensity.value = value;
  };
  $('intensity').addEventListener('input', () => setRange('intensity'));
  setRange('intensity');
  $('stars').addEventListener('change', (event) => { scene.uniforms.uStars.value = Number(event.target.checked); });
  $('auto-orbit').addEventListener('change', (event) => { scene.controls.autoRotate = event.target.checked; });
  const activatePreset = (name) => {
    document.querySelectorAll('.preset').forEach((button) => {
      const active = button.dataset.view === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  document.querySelectorAll('.preset').forEach((button) => {
    button.addEventListener('click', () => { scene.setView(button.dataset.view); activatePreset(button.dataset.view); });
  });
  scene.controls.addEventListener('start', () => activatePreset(null));
  const setPanel = (expanded) => {
    $('settings-toggle').setAttribute('aria-expanded', String(expanded));
    $('settings-content').hidden = !expanded;
    $('settings-chevron').textContent = expanded ? '−' : '+';
    document.querySelector('.settings').classList.toggle('expanded', expanded);
  };
  const mobile = window.matchMedia('(max-width: 600px)');
  setPanel(!mobile.matches);
  mobile.addEventListener('change', () => setPanel(!mobile.matches));
  $('settings-toggle').addEventListener('click', () => setPanel($('settings-toggle').getAttribute('aria-expanded') !== 'true'));
  $('info-button').addEventListener('click', () => $('about').showModal());
  $('close-about').addEventListener('click', () => $('about').close());
  $('about').addEventListener('click', (event) => {
    if (event.target === $('about')) {
      const rect = $('about').getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('about').close();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || $('about').open || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) return;
    if (event.key.toLowerCase() === 'h') setPanel($('settings-toggle').getAttribute('aria-expanded') !== 'true');
    const moves = { ArrowLeft: [0.06, 0], ArrowRight: [-0.06, 0], ArrowUp: [0, -0.06], ArrowDown: [0, 0.06], '+': [0, 0, 0.94], '=': [0, 0, 0.94], '-': [0, 0, 1.06] };
    if (moves[event.key]) { event.preventDefault(); scene.nudge(...moves[event.key]); activatePreset(null); }
  });
  $('universe').addEventListener('webglcontextlost', (event) => { event.preventDefault(); showError(new Error('WebGL context lost. Reload to restore the scene.')); });
  document.addEventListener('visibilitychange', () => { previous = performance.now(); });
  const animate = (now) => {
    animationId = requestAnimationFrame(animate);
    if (document.hidden) return;
    const delta = Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (!reducedMotion) elapsed += delta;
    try {
      scene.render(delta, elapsed, false);
      if (firstFrame) {
        firstFrame = false;
        $('loading').style.opacity = '0';
        setTimeout(() => { $('loading').hidden = true; }, 800);
      }
    } catch (error) { showError(error); return; }

  };
  animationId = requestAnimationFrame(animate);
  if (import.meta.hot) import.meta.hot.dispose(() => { cancelAnimationFrame(animationId); scene.dispose(); });
}
