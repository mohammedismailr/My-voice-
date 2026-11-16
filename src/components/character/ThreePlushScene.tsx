import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { VoiceState } from '../../types';
import type { CharacterId } from '../../types/character';
import { CHARACTERS } from '../../data/characters';
import {
  getPlushFurBumpTexture,
  getExpressiveEyeTexture,
  getWovenFabricBumpTexture,
} from '../../utils/proceduralTextures';

interface ThreePlushSceneProps {
  characterId: CharacterId;
  state: VoiceState;
  audioLevel?: number;
  onCharacterClick?: () => void;
  interactive?: boolean;
}

export const ThreePlushScene: React.FC<ThreePlushSceneProps> = ({
  characterId,
  state,
  audioLevel = 0,
  onCharacterClick,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Dynamic state refs for continuous 60fps animation
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const characterRef = useRef(CHARACTERS[characterId] || CHARACTERS['beige-mascot']);
  const clickAnimationTimeRef = useRef(0);

  stateRef.current = state;
  audioLevelRef.current = audioLevel;
  characterRef.current = CHARACTERS[characterId] || CHARACTERS['beige-mascot'];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    // =========================================================================
    // 1. SCENE, CAMERA & RENDERER SETUP
    // =========================================================================
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 5.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. CINEMATIC 4-POINT LIGHTING & STUDIO STAGE
    // =========================================================================
    const charConfig = characterRef.current;
    const themeColor = new THREE.Color(charConfig.colors.primary);

    // Ambient light: Soft warm studio illumination
    const ambientLight = new THREE.AmbientLight(0xfff6ed, 1.4);
    scene.add(ambientLight);

    // Key Light: Warm golden soft spotlight with deep shadows
    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.4);
    keyLight.position.set(3.2, 4.5, 4.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 3.5;
    scene.add(keyLight);

    // Rim Light: Powerful electric violet / theme rim light that catches fur fuzz
    const rimLight = new THREE.DirectionalLight(
      charConfig.colors.accent ? new THREE.Color(charConfig.colors.accent) : themeColor,
      3.4
    );
    rimLight.position.set(-3.8, 3.5, -3.2);
    scene.add(rimLight);

    // Fill Light: Soft cool cyan fill
    const fillLight = new THREE.PointLight(0x38bdf8, 1.2, 12);
    fillLight.position.set(2.5, -1.8, 2.5);
    scene.add(fillLight);

    // Under-Bounce Light: Warm floor reflection
    const bounceLight = new THREE.PointLight(0xfef08a, 0.8, 8);
    bounceLight.position.set(0, -2.4, 1.8);
    scene.add(bounceLight);

    // Soft Contact Shadow Plane on ground
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.32 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.95;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Ground Contact Pedestal Disc (simulating a velvet studio stage)
    const discGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.08, 36);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x121424,
      roughness: 0.9,
      metalness: 0.1,
    });
    const pedestalDisc = new THREE.Mesh(discGeo, discMat);
    pedestalDisc.position.y = -1.98;
    pedestalDisc.receiveShadow = true;
    scene.add(pedestalDisc);

    // Floating Cosmic Atmosphere Particles (Ambient Dust Motes)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const floatingParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(floatingParticles);

    // =========================================================================
    // 3. ADVANCED PLUSH MATERIAL FACTORY (Fur Bump, Sheen & Peach Fuzz)
    // =========================================================================
    const furBumpTexture = getPlushFurBumpTexture();
    const wovenBumpTexture = getWovenFabricBumpTexture();

    /**
     * Creates a physically convincing plush material with velvet sheen,
     * high-frequency fiber bump mapping, and soft subsurface edge scattering.
     */
    const createPlushMat = (
      colorHex: string,
      sheenColorHex?: string,
      roughness = 0.93,
      bumpScale = 0.045
    ) => {
      const col = new THREE.Color(colorHex);
      const sheenCol = sheenColorHex ? new THREE.Color(sheenColorHex) : col.clone().offsetHSL(0, 0.1, 0.15);

      return new THREE.MeshPhysicalMaterial({
        color: col,
        roughness,
        metalness: 0.01,
        sheen: 1.0,
        sheenRoughness: 0.42,
        sheenColor: sheenCol,
        clearcoat: 0.0,
        bumpMap: furBumpTexture,
        bumpScale,
      });
    };

    // Deep expressive glossy eye cornea material
    const eyeCorneaMat = new THREE.MeshPhysicalMaterial({
      color: 0x090a10,
      roughness: 0.04,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blueSparkleMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });

    // Rosy Plush Cheek Material (Soft velvet blush)
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.92,
      transparent: true,
      opacity: 0.52,
    });

    // =========================================================================
    // 4. VOLUMETRIC CHARACTER RIGGING ARCHITECTURE
    // =========================================================================
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Body Rig (torso, arms, legs, breathing)
    const bodyRig = new THREE.Group();
    characterGroup.add(bodyRig);

    // Head Rig (tracks pointer, tilts, blinks, gestures)
    const headRig = new THREE.Group();
    headRig.position.y = 0.25;
    characterGroup.add(headRig);

    // Per-frame animation references
    let mouthMesh: THREE.Mesh | null = null;
    let leftEyeGroup: THREE.Group | null = null;
    let rightEyeGroup: THREE.Group | null = null;
    let leftEyelid: THREE.Mesh | null = null;
    let rightEyelid: THREE.Mesh | null = null;
    let leftArm: THREE.Group | null = null;
    let rightArm: THREE.Group | null = null;
    const earMeshes: THREE.Mesh[] = [];
    const accessoryMeshes: THREE.Mesh[] = [];

    // =========================================================================
    // 5. 3D COMPANION SCULPTOR (Mochi, Bubbles, Berry, Pixel, Nova)
    // =========================================================================
    const buildCharacter = (id: CharacterId) => {
      // Clear previous parts
      while (headRig.children.length > 0) headRig.remove(headRig.children[0]);
      while (bodyRig.children.length > 0) bodyRig.remove(bodyRig.children[0]);
      earMeshes.length = 0;
      accessoryMeshes.length = 0;

      const currentConfig = CHARACTERS[id] || CHARACTERS['beige-mascot'];
      const primaryColor = currentConfig.colors.primary;

      if (id === 'blue-cloud') {
        // =====================================================================
        // BUBBLES: Fluffy Cloud Companion with French Beret
        // =====================================================================
        const cloudMat = createPlushMat(primaryColor, '#bfdbfe', 0.92, 0.05);

        // Volumetric multi-lobe cloud body
        const cloudBody = new THREE.Group();
        bodyRig.add(cloudBody);

        // Center primary cloud lobe
        const centerPuff = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 32), cloudMat);
        centerPuff.castShadow = true;
        cloudBody.add(centerPuff);

        // Surrounding organic puffs creating genuine 3D cloud silhouette
        const puffPositions: [number, number, number, number][] = [
          [-0.85, 0.2, 0.2, 0.88],
          [0.85, 0.2, 0.2, 0.88],
          [-0.65, -0.45, 0.15, 0.82],
          [0.65, -0.45, 0.15, 0.82],
          [0, 0.65, -0.2, 0.95],
          [-0.35, 0.45, 0.4, 0.75],
          [0.35, 0.45, 0.4, 0.75],
          [0, -0.65, -0.15, 0.78],
        ];

        puffPositions.forEach(([x, y, z, r]) => {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), cloudMat);
          puff.position.set(x, y, z);
          puff.castShadow = true;
          cloudBody.add(puff);
        });

        // Floating plush cloud hands
        leftArm = new THREE.Group();
        const leftHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), cloudMat);
        leftArm.add(leftHandMesh);
        leftArm.position.set(-1.45, -0.3, 0.35);
        bodyRig.add(leftArm);

        rightArm = new THREE.Group();
        const rightHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 18), cloudMat);
        rightArm.add(rightHandMesh);
        rightArm.position.set(1.45, -0.3, 0.35);
        bodyRig.add(rightArm);

        // Tilted French Wool Beret
        const beretGroup = new THREE.Group();
        const beretMat = createPlushMat('#18181b', '#3f3f46', 0.88, 0.035);
        beretMat.bumpMap = wovenBumpTexture;
        beretMat.bumpScale = 0.03;

        const beretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.72, 0.35, 28), beretMat);
        beretBase.castShadow = true;
        beretGroup.add(beretBase);

        const beretFold = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.14, 16, 32), beretMat);
        beretFold.rotation.x = Math.PI / 2;
        beretFold.position.y = -0.12;
        beretGroup.add(beretFold);

        const beretStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 10), beretMat);
        beretStem.position.y = 0.26;
        beretGroup.add(beretStem);

        beretGroup.position.set(0.48, 1.35, 0.2);
        beretGroup.rotation.z = -0.38;
        beretGroup.rotation.x = 0.18;
        headRig.add(beretGroup);
      } else if (id === 'pink-bunny') {
        // =====================================================================
        // BERRY: Cotton Candy Bunny Companion with Mint Headphones
        // =====================================================================
        const bunnyMat = createPlushMat(primaryColor, '#fbcfe8', 0.94, 0.05);
        const bellyMat = createPlushMat('#fdf2f8', '#ffffff', 0.92, 0.035);
        const innerEarMat = createPlushMat('#a7f3d0', '#d1fae5', 0.88, 0.03);

        // Plump Teardrop Bunny Torso
        const torsoGeo = new THREE.SphereGeometry(1.05, 32, 32);
        torsoGeo.scale(1.05, 1.25, 0.95);
        const torso = new THREE.Mesh(torsoGeo, bunnyMat);
        torso.position.set(0, -0.65, 0);
        torso.castShadow = true;
        bodyRig.add(torso);

        // Fluffy belly patch
        const bellyGeo = new THREE.SphereGeometry(0.72, 24, 24);
        bellyGeo.scale(1, 1.15, 0.4);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, -0.6, 0.75);
        bodyRig.add(belly);

        // Bunny Head
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1.24, 32, 32), bunnyMat);
        headMesh.castShadow = true;
        headRig.add(headMesh);

        // Chubby Cheeks
        const cheekPuffL = new THREE.Mesh(new THREE.SphereGeometry(0.58, 20, 20), bunnyMat);
        cheekPuffL.position.set(-0.72, -0.3, 0.52);
        headRig.add(cheekPuffL);

        const cheekPuffR = new THREE.Mesh(new THREE.SphereGeometry(0.58, 20, 20), bunnyMat);
        cheekPuffR.position.set(0.72, -0.3, 0.52);
        headRig.add(cheekPuffR);

        // Tall Floppy Bunny Ears
        const earGeo = new THREE.CylinderGeometry(0.24, 0.38, 1.9, 20);
        earGeo.scale(1, 1, 0.45);

        const leftEar = new THREE.Mesh(earGeo, bunnyMat);
        leftEar.position.set(-0.55, 1.95, -0.1);
        leftEar.rotation.z = 0.2;
        leftEar.rotation.x = -0.12;
        leftEar.castShadow = true;
        headRig.add(leftEar);
        earMeshes.push(leftEar);

        const rightEar = new THREE.Mesh(earGeo, bunnyMat);
        rightEar.position.set(0.55, 1.95, -0.1);
        rightEar.rotation.z = -0.2;
        rightEar.rotation.x = -0.12;
        rightEar.castShadow = true;
        headRig.add(rightEar);
        earMeshes.push(rightEar);

        // Inner mint ear inserts
        const innerEarGeo = new THREE.CylinderGeometry(0.12, 0.2, 1.45, 16);
        innerEarGeo.scale(1, 1, 0.35);
        const leftInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        leftInner.position.set(-0.53, 1.9, 0.08);
        leftInner.rotation.z = 0.2;
        headRig.add(leftInner);

        const rightInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        rightInner.position.set(0.53, 1.9, 0.08);
        rightInner.rotation.z = -0.2;
        headRig.add(rightInner);

        // Fluffy Bunny Tail (Cotton Ball)
        const tailMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), bellyMat);
        tailMesh.position.set(0, -1.05, -0.92);
        tailMesh.castShadow = true;
        bodyRig.add(tailMesh);

        // Front plush paws
        leftArm = new THREE.Group();
        const leftArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bunnyMat);
        leftArmMesh.scale.set(0.9, 1.3, 0.9);
        leftArm.add(leftArmMesh);
        leftArm.position.set(-0.65, -0.65, 0.7);
        leftArm.rotation.z = 0.35;
        bodyRig.add(leftArm);

        rightArm = new THREE.Group();
        const rightArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bunnyMat);
        rightArmMesh.scale.set(0.9, 1.3, 0.9);
        rightArm.add(rightArmMesh);
        rightArm.position.set(0.65, -0.65, 0.7);
        rightArm.rotation.z = -0.35;
        bodyRig.add(rightArm);

        // Glowing Pastel Mint Headphones
        const hpMat = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          roughness: 0.28,
          metalness: 0.35,
          emissive: 0x10b981,
          emissiveIntensity: 0.35,
        });
        const bandGeo = new THREE.TorusGeometry(1.4, 0.08, 16, 48, Math.PI);
        const band = new THREE.Mesh(bandGeo, hpMat);
        band.position.set(0, 0.28, 0);
        band.rotation.z = Math.PI;
        headRig.add(band);

        const cupGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.38, 24);
        cupGeo.rotateZ(Math.PI / 2);
        const cupL = new THREE.Mesh(cupGeo, hpMat);
        cupL.position.set(-1.42, 0.1, 0.05);
        headRig.add(cupL);

        const cupR = new THREE.Mesh(cupGeo, hpMat);
        cupR.position.set(1.42, 0.1, 0.05);
        headRig.add(cupR);
      } else if (id === 'yellow-triangle') {
        // =====================================================================
        // PIXEL: Golden Prism Companion with Spectacles & Bow Tie
        // =====================================================================
        const prismMat = createPlushMat(primaryColor, '#fef08a', 0.92, 0.045);

        // Volumetric Beveled Rounded Triangular Prism Body
        const shape = new THREE.Shape();
        const r = 1.35;
        shape.moveTo(0, r);
        shape.lineTo(r * 0.95, -r * 0.75);
        shape.lineTo(-r * 0.95, -r * 0.75);
        shape.closePath();

        const extrudeSettings = {
          steps: 2,
          depth: 1.1,
          bevelEnabled: true,
          bevelThickness: 0.35,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 8,
        };

        const prismGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        prismGeo.center();
        const bodyMesh = new THREE.Mesh(prismGeo, prismMat);
        bodyMesh.castShadow = true;
        bodyRig.add(bodyMesh);

        // Golden Wireframe Glasses with Clear Glass Lenses
        const glassesGroup = new THREE.Group();
        const wireMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.2,
          metalness: 0.85,
        });
        const lensGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.92,
          opacity: 1,
          transparent: true,
          roughness: 0.05,
          ior: 1.5,
        });

        // Left Rim & Lens
        const lensRingL = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 16, 36), wireMat);
        lensRingL.position.set(-0.45, 0.18, 0.98);
        glassesGroup.add(lensRingL);

        const lensDiscL = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lensGlassMat);
        lensDiscL.position.set(-0.45, 0.18, 0.98);
        glassesGroup.add(lensDiscL);

        // Right Rim & Lens
        const lensRingR = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 16, 36), wireMat);
        lensRingR.position.set(0.45, 0.18, 0.98);
        glassesGroup.add(lensRingR);

        const lensDiscR = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lensGlassMat);
        lensDiscR.position.set(0.45, 0.18, 0.98);
        glassesGroup.add(lensDiscR);

        // Bridge
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 10), wireMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.18, 0.99);
        glassesGroup.add(bridge);

        headRig.add(glassesGroup);

        // Crimson Satin Bow Tie
        const bowMat = createPlushMat('#dc2626', '#f87171', 0.75, 0.03);
        bowMat.bumpMap = wovenBumpTexture;

        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), bowMat);
        knot.position.set(0, -0.68, 0.92);
        headRig.add(knot);

        const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.46, 16), bowMat);
        wingL.rotation.z = Math.PI / 2;
        wingL.position.set(-0.28, -0.68, 0.9);
        headRig.add(wingL);

        const wingR = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.46, 16), bowMat);
        wingR.rotation.z = -Math.PI / 2;
        wingR.position.set(0.28, -0.68, 0.9);
        headRig.add(wingR);

        // Stubby golden arms and rounded feet
        leftArm = new THREE.Group();
        const leftArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), prismMat);
        leftArm.add(leftArmMesh);
        leftArm.position.set(-1.15, -0.4, 0.2);
        bodyRig.add(leftArm);

        rightArm = new THREE.Group();
        const rightArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), prismMat);
        rightArm.add(rightArmMesh);
        rightArm.position.set(1.15, -0.4, 0.2);
        bodyRig.add(rightArm);
      } else if (id === 'purple-heart') {
        // =====================================================================
        // NOVA: Cosmic Violet Heart Companion with Retro Sunglasses
        // =====================================================================
        const heartMat = createPlushMat(primaryColor, '#e879f9', 0.91, 0.045);

        // Sculpted 3D Pillowy Volumetric Heart Body
        const heartGroup = new THREE.Group();

        const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.82, 28, 28), heartMat);
        lobeL.position.set(-0.52, 0.48, 0);
        lobeL.castShadow = true;
        heartGroup.add(lobeL);

        const lobeR = new THREE.Mesh(new THREE.SphereGeometry(0.82, 28, 28), heartMat);
        lobeR.position.set(0.52, 0.48, 0);
        lobeR.castShadow = true;
        heartGroup.add(lobeR);

        const bottomCone = new THREE.Mesh(new THREE.ConeGeometry(1.18, 1.6, 28), heartMat);
        bottomCone.rotation.x = Math.PI;
        bottomCone.position.set(0, -0.48, 0);
        bottomCone.castShadow = true;
        heartGroup.add(bottomCone);

        bodyRig.add(heartGroup);

        // Retro Heart-Shaped Sunglasses with Refractive Ruby Lenses
        const sunFrameMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.15,
          metalness: 0.1,
        });

        const sunGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0xf43f5e,
          transmission: 0.88,
          opacity: 0.95,
          transparent: true,
          roughness: 0.08,
          clearcoat: 1.0,
          ior: 1.45,
        });

        const sunFrameL = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 16, 32), sunFrameMat);
        sunFrameL.position.set(-0.46, 0.22, 0.92);
        headRig.add(sunFrameL);

        const sunLensL = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), sunGlassMat);
        sunLensL.position.set(-0.46, 0.22, 0.92);
        headRig.add(sunLensL);

        const sunFrameR = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 16, 32), sunFrameMat);
        sunFrameR.position.set(0.46, 0.22, 0.92);
        headRig.add(sunFrameR);

        const sunLensR = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), sunGlassMat);
        sunLensR.position.set(0.46, 0.22, 0.92);
        headRig.add(sunLensR);

        // Bridge & Temple Bars
        const sunBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 10), sunFrameMat);
        sunBridge.rotation.z = Math.PI / 2;
        sunBridge.position.set(0, 0.22, 0.93);
        headRig.add(sunBridge);

        // White plush cartoon gloves / arms
        const gloveMat = createPlushMat('#ffffff', '#f1f5f9', 0.88, 0.03);
        leftArm = new THREE.Group();
        const leftGloveMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), gloveMat);
        leftArm.add(leftGloveMesh);
        leftArm.position.set(-1.25, -0.3, 0.25);
        bodyRig.add(leftArm);

        rightArm = new THREE.Group();
        const rightGloveMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), gloveMat);
        rightArm.add(rightGloveMesh);
        rightArm.position.set(1.25, -0.3, 0.25);
        bodyRig.add(rightArm);
      } else {
        // =====================================================================
        // MOCHI: Cream Plush Bear Mascot (Primary Default Companion)
        // =====================================================================
        const mochiMat = createPlushMat(primaryColor, '#fff8ee', 0.93, 0.045);
        const bellyMat = createPlushMat('#fff6e8', '#ffffff', 0.9, 0.035);
        const innerHoodMat = createPlushMat('#faeedb', '#ffffff', 0.9, 0.03);

        // Chubby Pear-Shaped Bear Body
        const torsoGeo = new THREE.SphereGeometry(1.12, 32, 32);
        torsoGeo.scale(1.08, 1.25, 0.95);
        const torso = new THREE.Mesh(torsoGeo, mochiMat);
        torso.position.set(0, -0.7, 0);
        torso.castShadow = true;
        bodyRig.add(torso);

        // Light Cream Belly Patch
        const bellyGeo = new THREE.SphereGeometry(0.76, 24, 24);
        bellyGeo.scale(1, 1.15, 0.4);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, -0.65, 0.78);
        bodyRig.add(belly);

        // Outer Hooded Bear Head
        const outerHead = new THREE.Mesh(new THREE.SphereGeometry(1.32, 36, 36), mochiMat);
        outerHead.castShadow = true;
        headRig.add(outerHead);

        // Soft Inner Face Cavity
        const faceCavity = new THREE.Mesh(
          new THREE.SphereGeometry(1.22, 32, 32),
          innerHoodMat
        );
        faceCavity.position.set(0, -0.05, 0.16);
        headRig.add(faceCavity);

        // Soft Protruding Cream Snout / Muzzle
        const muzzleGeo = new THREE.SphereGeometry(0.42, 24, 24);
        muzzleGeo.scale(1.25, 0.85, 0.8);
        const muzzleMesh = new THREE.Mesh(muzzleGeo, bellyMat);
        muzzleMesh.position.set(0, -0.22, 1.15);
        headRig.add(muzzleMesh);

        // Soft Dark Felt Bear Nose
        const noseGeo = new THREE.SphereGeometry(0.12, 16, 16);
        noseGeo.scale(1.3, 0.85, 0.7);
        const noseMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.65,
        });
        const noseMesh = new THREE.Mesh(noseGeo, noseMat);
        noseMesh.position.set(0, -0.15, 1.48);
        headRig.add(noseMesh);

        // Cute Round Teddy Bear Ears on Hood
        const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 24), mochiMat);
        leftEar.position.set(-1.02, 1.1, -0.15);
        leftEar.castShadow = true;
        headRig.add(leftEar);
        earMeshes.push(leftEar);

        const rightEar = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 24), mochiMat);
        rightEar.position.set(1.02, 1.1, -0.15);
        rightEar.castShadow = true;
        headRig.add(rightEar);
        earMeshes.push(rightEar);

        // Inner Ear Felt Discs
        const innerEarL = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), innerHoodMat);
        innerEarL.position.set(-1.02, 1.1, 0.22);
        innerEarL.rotation.y = 0.25;
        headRig.add(innerEarL);

        const innerEarR = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), innerHoodMat);
        innerEarR.position.set(1.02, 1.1, 0.22);
        innerEarR.rotation.y = -0.25;
        headRig.add(innerEarR);

        // High-Fidelity Over-Ear Studio Headphones
        const hpMat = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          roughness: 0.32,
          metalness: 0.55,
        });
        const cushionMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.7,
        });

        // Headphone Over-Head Band
        const bandGeo = new THREE.TorusGeometry(1.45, 0.085, 16, 48, Math.PI * 0.95);
        const band = new THREE.Mesh(bandGeo, hpMat);
        band.position.set(0, 0.3, 0);
        band.rotation.z = Math.PI * 0.975;
        headRig.add(band);

        // Left & Right Cushioned Ear Cups with Metal Hinges
        const cupGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.36, 28);
        cupGeo.rotateZ(Math.PI / 2);

        const leftCup = new THREE.Mesh(cupGeo, hpMat);
        leftCup.position.set(-1.46, 0.08, 0.05);
        leftCup.castShadow = true;
        headRig.add(leftCup);

        const leftCushion = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.1, 16, 32), cushionMat);
        leftCushion.rotation.y = Math.PI / 2;
        leftCushion.position.set(-1.3, 0.08, 0.05);
        headRig.add(leftCushion);

        const rightCup = new THREE.Mesh(cupGeo, hpMat);
        rightCup.position.set(1.46, 0.08, 0.05);
        rightCup.castShadow = true;
        headRig.add(rightCup);

        const rightCushion = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.1, 16, 32), cushionMat);
        rightCushion.rotation.y = Math.PI / 2;
        rightCushion.position.set(1.3, 0.08, 0.05);
        headRig.add(rightCushion);

        // Hoodie Strings with Knotted Tips & Woven Fabric Texture
        const stringMat = createPlushMat('#ffffff', '#f8fafc', 0.8, 0.035);
        stringMat.bumpMap = wovenBumpTexture;

        const stringGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 12);

        const leftStr = new THREE.Mesh(stringGeo, stringMat);
        leftStr.position.set(-0.38, -1.25, 0.92);
        headRig.add(leftStr);

        const rightStr = new THREE.Mesh(stringGeo, stringMat);
        rightStr.position.set(0.38, -1.25, 0.92);
        headRig.add(rightStr);

        const knotGeo = new THREE.SphereGeometry(0.09, 14, 14);
        const leftKnot = new THREE.Mesh(knotGeo, stringMat);
        leftKnot.position.set(-0.38, -1.58, 0.92);
        headRig.add(leftKnot);

        const rightKnot = new THREE.Mesh(knotGeo, stringMat);
        rightKnot.position.set(0.38, -1.58, 0.92);
        headRig.add(rightKnot);

        // Soft plush paws
        leftArm = new THREE.Group();
        const leftArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), mochiMat);
        leftArmMesh.scale.set(0.9, 1.25, 0.9);
        leftArm.add(leftArmMesh);
        leftArm.position.set(-1.25, -0.65, 0.45);
        leftArm.rotation.z = 0.35;
        bodyRig.add(leftArm);

        rightArm = new THREE.Group();
        const rightArmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), mochiMat);
        rightArmMesh.scale.set(0.9, 1.25, 0.9);
        rightArm.add(rightArmMesh);
        rightArm.position.set(1.25, -0.65, 0.45);
        rightArm.rotation.z = -0.35;
        bodyRig.add(rightArm);
      }

      // =======================================================================
      // 6. SHARED EXPRESSIVE PIXAR-GRADE FACE RIG
      // =======================================================================
      const eyeTexture = getExpressiveEyeTexture('#0b0d18', currentConfig.colors.primary);

      // Eye Ball material with mapped iris
      const irisSphereMat = new THREE.MeshStandardMaterial({
        map: eyeTexture,
        roughness: 0.15,
        metalness: 0.05,
      });

      // Left Eye Structure
      leftEyeGroup = new THREE.Group();
      const leftCornea = new THREE.Mesh(new THREE.SphereGeometry(0.19, 28, 28), eyeCorneaMat);
      leftEyeGroup.add(leftCornea);

      const leftIris = new THREE.Mesh(new THREE.SphereGeometry(0.185, 24, 24), irisSphereMat);
      leftEyeGroup.add(leftIris);

      // Pixar dual specular sparkles (primary catchlight + secondary sparkle)
      const leftGleam1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), highlightMat);
      leftGleam1.position.set(-0.045, 0.06, 0.16);
      leftEyeGroup.add(leftGleam1);

      const leftGleam2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), blueSparkleMat);
      leftGleam2.position.set(0.055, -0.045, 0.16);
      leftEyeGroup.add(leftGleam2);

      // Left Eyelid (Upper eyelid for blinking)
      const eyelidGeo = new THREE.SphereGeometry(0.205, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      leftEyelid = new THREE.Mesh(eyelidGeo, createPlushMat(primaryColor));
      leftEyelid.rotation.x = Math.PI;
      leftEyelid.visible = false;
      leftEyeGroup.add(leftEyelid);

      leftEyeGroup.position.set(-0.46, 0.08, 1.18);
      headRig.add(leftEyeGroup);

      // Right Eye Structure
      rightEyeGroup = new THREE.Group();
      const rightCornea = new THREE.Mesh(new THREE.SphereGeometry(0.19, 28, 28), eyeCorneaMat);
      rightEyeGroup.add(rightCornea);

      const rightIris = new THREE.Mesh(new THREE.SphereGeometry(0.185, 24, 24), irisSphereMat);
      rightEyeGroup.add(rightIris);

      const rightGleam1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), highlightMat);
      rightGleam1.position.set(-0.045, 0.06, 0.16);
      rightEyeGroup.add(rightGleam1);

      const rightGleam2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), blueSparkleMat);
      rightGleam2.position.set(0.055, -0.045, 0.16);
      rightEyeGroup.add(rightGleam2);

      rightEyelid = new THREE.Mesh(eyelidGeo, createPlushMat(primaryColor));
      rightEyelid.rotation.x = Math.PI;
      rightEyelid.visible = false;
      rightEyeGroup.add(rightEyelid);

      rightEyeGroup.position.set(0.46, 0.08, 1.18);
      headRig.add(rightEyeGroup);

      // Rosy Cheeks (Volumetric rounded plush blush)
      const cheekGeo = new THREE.SphereGeometry(0.2, 18, 18);
      cheekGeo.scale(1.2, 0.8, 0.35);

      const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
      leftCheek.position.set(-0.66, -0.18, 1.12);
      leftCheek.rotation.y = -0.3;
      headRig.add(leftCheek);

      const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
      rightCheek.position.set(0.66, -0.18, 1.12);
      rightCheek.rotation.y = 0.3;
      headRig.add(rightCheek);

      // Cute Openable Plush Mouth
      const mouthGeo = new THREE.SphereGeometry(0.1, 18, 18);
      mouthGeo.scale(1.25, 0.6, 0.7);
      const mouthMat = new THREE.MeshStandardMaterial({
        color: 0x1f1f23,
        roughness: 0.55,
      });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.3, 1.25);
      headRig.add(mouthMesh);
    };

    buildCharacter(characterId);

    // =========================================================================
    // 7. POINTER & INTERACTIVE CURSOR TRACKING
    // =========================================================================
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.targetX = Math.max(-1, Math.min(1, x));
      pointer.targetY = Math.max(-1, Math.min(1, y));
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove);
    }

    // =========================================================================
    // 8. NATURAL VARIABLE BLINKING SCHEDULER
    // =========================================================================
    let isBlinking = false;
    let blinkTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      isBlinking = true;
      if (leftEyelid && rightEyelid) {
        leftEyelid.visible = true;
        rightEyelid.visible = true;
      }
      setTimeout(() => {
        isBlinking = false;
        if (leftEyelid && rightEyelid) {
          leftEyelid.visible = false;
          rightEyelid.visible = false;
        }
      }, 150);

      const nextDelay = 2000 + Math.random() * 3500;
      blinkTimer = setTimeout(scheduleBlink, nextDelay);
    };

    scheduleBlink();

    // =========================================================================
    // 9. CLICK CELEBRATION REACTION
    // =========================================================================
    const handleContainerClick = () => {
      clickAnimationTimeRef.current = 1.0;
      onCharacterClick?.();
    };

    container.addEventListener('click', handleContainerClick);

    // =========================================================================
    // 10. CONTINUOUS 60FPS CINEMATIC ANIMATION ENGINE
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;

      // Smooth pointer damping
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      // Decay click celebration hop
      if (clickAnimationTimeRef.current > 0) {
        clickAnimationTimeRef.current = Math.max(0, clickAnimationTimeRef.current - delta * 2.2);
      }
      const clickHop = Math.sin(clickAnimationTimeRef.current * Math.PI) * 0.28;

      // 1. Eye Tracking & Pupil Shift
      if (leftEyeGroup && rightEyeGroup && !isBlinking) {
        const pupilX = pointer.x * 0.065;
        const pupilY = pointer.y * 0.055;
        leftEyeGroup.children[0].position.set(pupilX, pupilY, 0);
        leftEyeGroup.children[1].position.set(pupilX, pupilY, 0);
        rightEyeGroup.children[0].position.set(pupilX, pupilY, 0);
        rightEyeGroup.children[1].position.set(pupilX, pupilY, 0);
      }

      // 2. Head Tilt & Rotation Targets
      let targetRotY = pointer.x * 0.38;
      let targetRotX = -pointer.y * 0.28;
      let targetRotZ = 0;

      // 3. State-Driven Animations
      if (currentState === 'listening' || currentState === 'speech_detected') {
        // Attentive lean forward + gentle pulse
        targetRotX -= 0.14;
        const pulse = Math.sin(t * 3.8) * 0.035;
        characterGroup.position.y = -0.05 + pulse + clickHop;
        earMeshes.forEach((mesh) => {
          mesh.rotation.x = -0.24 + Math.sin(t * 4.2) * 0.05;
        });
        if (leftArm && rightArm) {
          leftArm.rotation.z = 0.45 + Math.sin(t * 3.5) * 0.08;
          rightArm.rotation.z = -0.45 - Math.sin(t * 3.5) * 0.08;
        }
      } else if (currentState === 'processing' || currentState === 'generating') {
        // Inquisitive 14-degree tilt + slow thinking body drift
        targetRotZ = 0.24 + Math.sin(t * 2.2) * 0.06;
        targetRotY = 0.18;
        targetRotX = -0.1;
        characterGroup.position.y = Math.sin(t * 2.5) * 0.05 + clickHop;
      } else if (currentState === 'speaking') {
        // Audio-driven mouth opening and dynamic body squash-and-stretch
        const voiceIntensity = Math.min(1.0, Math.max(0.12, currentAudio * 1.5));
        const bodyBounce = Math.sin(t * 14) * (0.05 + voiceIntensity * 0.12);

        characterGroup.position.y = bodyBounce + clickHop;
        characterGroup.scale.set(
          1 - voiceIntensity * 0.18,
          1 + voiceIntensity * 0.28,
          1 - voiceIntensity * 0.15
        );

        // Realistic speech lip-sync (jaw and lips expand to audio amplitude)
        if (mouthMesh) {
          const mouthOpen = Math.min(3.2, Math.max(0.4, currentAudio * 5.2 + 0.3));
          mouthMesh.scale.y = mouthOpen;
          mouthMesh.scale.x = 1.0 + currentAudio * 0.8;
        }

        // Head nods to speech cadence
        targetRotX += Math.sin(t * 8) * 0.06;

        // Expressive arm gestures during speech
        if (leftArm && rightArm) {
          leftArm.rotation.z = 0.35 + Math.sin(t * 6) * 0.15;
          rightArm.rotation.z = -0.35 - Math.sin(t * 6 + 1) * 0.15;
        }
      } else if (currentState === 'error') {
        // Gentle concerned head tilt
        targetRotZ = -0.18;
        targetRotX = 0.14;
        characterGroup.position.y = -0.1 + clickHop;
      } else {
        // Idle: Smooth breathing, gentle sinusoidal floating
        const breath = Math.sin(t * 2.0);
        characterGroup.position.y = breath * 0.07 + clickHop;
        characterGroup.scale.set(
          1 + breath * 0.022,
          1 - breath * 0.026,
          1 + breath * 0.015
        );

        if (mouthMesh) {
          mouthMesh.scale.set(1.2, 0.45, 0.6);
        }

        // Idle ear and arm subtle drifting
        earMeshes.forEach((mesh, idx) => {
          mesh.rotation.z += Math.sin(t * 1.5 + idx) * 0.002;
        });
      }

      // Smooth head rotation damping
      headRig.rotation.y += (targetRotY - headRig.rotation.y) * 0.08;
      headRig.rotation.x += (targetRotX - headRig.rotation.x) * 0.08;
      headRig.rotation.z += (targetRotZ - headRig.rotation.z) * 0.08;

      // Slowly rotate floating particles for atmospheric magic
      floatingParticles.rotation.y = t * 0.035;

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // 11. RESPONSIVE RESIZE
    // =========================================================================
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(blinkTimer);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
      }
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleContainerClick);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      discGeo.dispose();
      discMat.dispose();
    };
  }, [characterId, interactive, onCharacterClick]);

  if (!hasWebGL) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-pointer select-none transition-transform active:scale-95 flex items-center justify-center relative"
      style={{ touchAction: 'none' }}
    />
  );
};
