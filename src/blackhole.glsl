precision highp float;

uniform vec2 uResolution;
uniform vec3 uCamera;
uniform mat3 uCameraMatrix;
uniform float uTime;
uniform float uIntensity;
uniform float uStars;
uniform sampler2D uSky;
varying vec2 vUv;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}

float turbulence(vec2 p) {
  float n = 0.5 * noise(p);
  n += 0.25 * noise(p * 2.03 + 12.1);
  n += 0.125 * noise(p * 4.07 - 8.3);
  return n;
}

vec3 disk(vec3 p, vec3 direction) {
  float r = length(p.xz);
  float angle = atan(p.z, p.x);
  float rotation = uTime * 0.24;
  // Cylindrical coordinates keep the texture attached to the orbiting plasma.
  vec2 spiral = vec2(r * 3.8, angle * 2.0 - rotation / pow(r * 0.16, 1.5));
  float clouds = turbulence(vec2(cos(spiral.y), sin(spiral.y)) * 4.0 + vec2(r * 2.3));
  float bands = sin(r * 34.0 + clouds * 7.0 + sin(angle * 5.0 - rotation) * 0.6);
  float fine = noise(vec2(r * 95.0, sin(angle - rotation * 0.1) * 16.0));
  float texture = (0.55 + clouds * 0.8) * (0.78 + bands * 0.17 + fine * 0.14);
  float inner = smoothstep(2.65, 3.2, r);
  float outer = 1.0 - smoothstep(6.0, 10.0, r);
  float heat = pow(3.0 / max(r, 3.0), 2.3);
  vec3 hot = vec3(1.0, 0.83, 0.58);
  vec3 cool = vec3(0.72, 0.27, 0.065);
  vec3 color = mix(cool, hot, pow(heat, 0.55));
  vec3 tangent = normalize(vec3(-p.z, 0., p.x));
  float doppler = pow(clamp(1.0 + dot(direction, tangent) * 0.32, 0.6, 1.4), 2.0);
  return color * texture * inner * outer * heat * doppler * 2.6 * uIntensity;
}

vec3 sky(vec3 direction) {
  vec2 uv = vec2(atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
                 asin(clamp(direction.y, -1., 1.)) / PI + 0.5);
  vec3 stars = texture2D(uSky, uv).rgb;
  float dust = turbulence(uv * vec2(90.0, 50.0));
  float band = exp(-pow((direction.y + 0.18 * direction.x - 0.08) * 7.0, 2.0));
  return uStars * (stars * 0.65 + vec3(0.008, 0.009, 0.014) * dust * band);
}

void main() {
  vec2 screen = (vUv - 0.5) * 2.0;
  screen.x *= uResolution.x / uResolution.y;
  screen.y -= 0.1;
  vec3 direction = normalize(uCameraMatrix * vec3(screen * 0.39, -1.0));
  vec3 p = uCamera;
  vec3 initial = direction;
  float angularMomentum = length(cross(p, direction));
  float h2 = angularMomentum * angularMomentum;
  vec3 color = vec3(0.0);
  float transmission = 1.0;
  bool captured = false;
  float closest = 1000.0;

  // A Schwarzschild-inspired central acceleration curves each light ray.
  // Adaptive steps resolve the photon sphere without oversampling deep space.
  for (int i = 0; i < 160; i++) {
    float r = length(p);
    closest = min(closest, r);
    if (r < 1.0) { captured = true; break; }
    if (r > 45.0) break;
    float dt = clamp(r * 0.085, 0.055, 1.8);
    vec3 previous = p;
    float r2 = r * r;
    vec3 acceleration = -1.5 * h2 * p / (r2 * r2 * r);
    vec3 halfVelocity = direction + acceleration * (dt * 0.5);
    p += halfVelocity * dt;
    float nextR = length(p);
    float nextR2 = nextR * nextR;
    direction = halfVelocity - 1.5 * h2 * p / (nextR2 * nextR2 * nextR) * (dt * 0.5);

    if (previous.y * p.y < 0.0) {
      vec3 crossing = mix(previous, p, previous.y / (previous.y - p.y));
      float diskR = length(crossing.xz);
      if (diskR > 2.65 && diskR < 10.0) {
        color += disk(crossing, normalize(direction)) * transmission;
        float opacity = smoothstep(2.65, 3.2, diskR) * (1.0 - smoothstep(6.0, 10.0, diskR));
        transmission *= 1.0 - 0.68 * opacity;
      }
    }
    // A faint volumetric envelope softens the infinitely thin disk surface.
    float envelope = exp(-abs(p.y) * 14.0) * smoothstep(2.7, 3.3, r) * (1.0 - smoothstep(4.0, 9.5, r));
    color += vec3(1.0, 0.43, 0.12) * envelope * 0.018 * dt * transmission * uIntensity;
  }
  if (!captured) color += sky(normalize(direction)) * transmission;
  // Light trapped near the unstable photon orbit creates a fine hot rim.
  float rim = exp(-pow((angularMomentum - 2.598) * 20.0, 2.0));
  color += vec3(1.0, 0.66, 0.3) * rim * 0.19 * uIntensity;
  float vignette = 1.0 - 0.22 * pow(length(vUv - 0.5), 1.4);
  gl_FragColor = vec4(color * vignette, 1.0);
}
