import * as THREE from 'three';

// Cache generated textures so they are only created once in memory
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generates a procedural plush fur bump / normal map.
 * Simulates high-density fuzzy felt / plush fibers with micro-indentations and fiber clumps.
 */
export function getPlushFurBumpTexture(): THREE.CanvasTexture {
  const cacheKey = 'plush-fur-bump';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return dummy;
  }

  // Base neutral grey
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Multi-octave procedural noise for fluffy felt fibers
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // High frequency grain (individual fibers)
      const n1 = Math.sin(x * 0.45) * Math.cos(y * 0.45) * 18;
      // Medium frequency clumps (plush tufts)
      const n2 = Math.sin(x * 0.12 + y * 0.08) * Math.cos(y * 0.14 - x * 0.06) * 32;
      // Low frequency surface variation (soft fabric compression)
      const n3 = Math.sin(x * 0.035) * Math.sin(y * 0.035) * 22;

      // Random micro-fuzz
      const rand = (Math.random() - 0.5) * 42;

      const val = Math.max(0, Math.min(255, 128 + n1 + n2 + n3 + rand));

      data[idx] = val;     // R
      data[idx + 1] = val; // G
      data[idx + 2] = val; // B
      data[idx + 3] = 255; // A
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Soft directional fiber streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const len = 4 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(angle) * len, ry + Math.sin(angle) * len);
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generates an ultra-expressive Pixar-style glossy iris texture for plush toy eyes.
 * Includes radiant striations, limbal ring, pupil aperture, and jewel-like depth.
 */
export function getExpressiveEyeTexture(baseColorHex = '#1E1B2E', irisColorHex = '#3B82F6'): THREE.CanvasTexture {
  const cacheKey = `eye-iris-${baseColorHex}-${irisColorHex}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // Background Sclera / Outer Ring
  ctx.fillStyle = '#0F111A';
  ctx.fillRect(0, 0, size, size);

  // Outer dark limbal ring
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, irisColorHex);
  grad.addColorStop(0.65, irisColorHex);
  grad.addColorStop(0.9, baseColorHex);
  grad.addColorStop(1, '#05060A');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Radial striations / fibers in the iris
  ctx.save();
  ctx.translate(cx, cy);
  const rays = 120;
  for (let i = 0; i < rays; i++) {
    const len = radius * (0.4 + Math.random() * 0.55);
    ctx.rotate(Math.PI * 2 / rays);
    ctx.beginPath();
    ctx.moveTo(radius * 0.25, 0);
    ctx.lineTo(len, 0);
    ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.stroke();
  }
  ctx.restore();

  // Dark central pupil
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = '#06070B';
  ctx.fill();

  // Soft inner pupil ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.42, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 3;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generates knitted fabric / woven cord texture for hoodie strings, accessories, and stitches.
 */
export function getWovenFabricBumpTexture(): THREE.CanvasTexture {
  const cacheKey = 'woven-fabric-bump';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Cross-hatch knit texture
  const step = 8;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#9c9c9c' : '#686868';
      ctx.fillRect(x, y, step, step);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
