import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import fragmentShader from './blackhole.glsl?raw';

function createStarField() {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 1701;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 18000; i++) {
    const x = random() * canvas.width;
    const y = Math.acos(2 * random() - 1) / Math.PI * canvas.height;
    const bright = random();
    const radius = bright > 0.994 ? 1.6 : bright > 0.94 ? 0.85 : 0.4;
    const alpha = 0.18 + random() * 0.7;
    const tint = random();
    const rgb = tint < 0.22 ? '175,198,255' : tint > 0.8 ? '255,215,168' : '230,231,241';
    if (bright > 0.994) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 6);
      halo.addColorStop(0, `rgba(${rgb},0.25)`);
      halo.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(x - 6, y - 6, 12, 12);
    }
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function createScene(canvas, reducedMotion) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.8, 24);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 13;
  controls.maxDistance = 38;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI - 0.12;
  controls.rotateSpeed = 0.45;
  controls.zoomSpeed = 0.7;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.13;
  controls.update();
  const uniforms = {
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uCamera: { value: camera.position },
    uCameraMatrix: { value: new THREE.Matrix3() },
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uStars: { value: 1 },
    uSky: { value: createStarField() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, screenCamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.24, 0.35, 1.15);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const presets = {
    cinematic: new THREE.Vector3(0, 3.8, 24),
    edge: new THREE.Vector3(0, 0.45, 24),
    above: new THREE.Vector3(0, 22, 14),
  };
  let destination = null;
  let disposed = false;
  let shaderError = null;
  renderer.debug.onShaderError = (gl, program) => {
    shaderError = new Error(`Shader compilation failed: ${gl.getProgramInfoLog(program)}`);
  };
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  controls.addEventListener('start', () => { destination = null; });

  return {
    controls,
    uniforms,
    camera,
    setView(view, instant = false) {
      destination = presets[view].clone();
      if (instant || reducedMotion) { camera.position.copy(destination); destination = null; controls.update(); }
    },
    nudge(azimuth, polar, zoom = 1) {
      destination = null;
      const spherical = new THREE.Spherical().setFromVector3(camera.position);
      spherical.theta += azimuth;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + polar, controls.minPolarAngle, controls.maxPolarAngle);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * zoom, controls.minDistance, controls.maxDistance);
      camera.position.setFromSpherical(spherical);
      controls.update();
    },
    render(delta, time, paused) {
      if (disposed) return;
      if (destination) {
        camera.position.lerp(destination, 1 - Math.exp(-delta * 4));
        if (camera.position.distanceTo(destination) < 0.01) destination = null;
      }
      const autoRotate = controls.autoRotate;
      controls.autoRotate = autoRotate && !paused && !destination;
      controls.update(delta);
      controls.autoRotate = autoRotate;
      camera.updateMatrixWorld();
      uniforms.uCameraMatrix.value.setFromMatrix4(camera.matrixWorld);
      uniforms.uTime.value = time;
      composer.render();
      if (shaderError) throw shaderError;
    },
    dispose() {
      disposed = true;
      window.removeEventListener('resize', resize);
      controls.dispose();
      quad.geometry.dispose();
      material.dispose();
      uniforms.uSky.value.dispose();
      for (const pass of composer.passes) pass.dispose?.();
      composer.dispose();
      renderer.dispose();
    },
  };
}
