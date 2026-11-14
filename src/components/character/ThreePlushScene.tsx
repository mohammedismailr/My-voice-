import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { VoiceState } from '../../types';
import type { CharacterId } from '../../types/character';
import { CHARACTERS } from '../../data/characters';

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

  // References for animation
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const characterRef = useRef(CHARACTERS[characterId] || CHARACTERS['beige-mascot']);

  stateRef.current = state;
  audioLevelRef.current = audioLevel;
  characterRef.current = CHARACTERS[characterId] || CHARACTERS['beige-mascot'];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // LIGHTING (Studio Portrait Lighting Setup)
    // =========================================================================
    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 1.3);
    scene.add(ambientLight);

    // Main Key Light (Soft White)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Rim Light (Electric Violet/Blue matching MyVoice brand)
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 2.4);
    rimLight.position.set(-3.5, 3, -3);
    scene.add(rimLight);

    // Soft Cyan Under-Fill Light
    const fillLight = new THREE.PointLight(0x38bdf8, 1.1, 10);
    fillLight.position.set(2, -2, 2.5);
    scene.add(fillLight);

    // Soft Ground Shadow Contact Plane
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.8;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // =========================================================================
    // CHARACTER RIG GROUP
    // =========================================================================
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Head Rig (tracks pointer, tilts, blinks)
    const headRig = new THREE.Group();
    characterGroup.add(headRig);

    // Shared plush fabric material generator
    const createPlushMat = (colorHex: string, roughness = 0.88) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness,
        metalness: 0.04,
      });

    // Glossy eyes material (shiny glass/specular highlight)
    const eyeGlossMat = new THREE.MeshPhysicalMaterial({
      color: 0x111116,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.65,
    });

    // Reference elements for per-frame animation
    let mouthMesh: THREE.Mesh | null = null;
    let leftEyeGroup: THREE.Group | null = null;
    let rightEyeGroup: THREE.Group | null = null;
    let leftEyelid: THREE.Mesh | null = null;
    let rightEyelid: THREE.Mesh | null = null;
    const accessoryMeshes: THREE.Mesh[] = [];

    // Build companion geometry based on characterId
    const buildCharacter = (id: CharacterId) => {
      // Clear existing
      while (headRig.children.length > 0) {
        headRig.remove(headRig.children[0]);
      }
      accessoryMeshes.length = 0;

      const charConfig = CHARACTERS[id] || CHARACTERS['beige-mascot'];
      const primaryColor = charConfig.colors.primary;

      if (id === 'blue-cloud') {
        // =====================================================================
        // BUBBLES: Fluffy Cloud Companion
        // =====================================================================
        const cloudGroup = new THREE.Group();
        headRig.add(cloudGroup);

        const cloudMat = createPlushMat(primaryColor, 0.85);

        // Center puff
        const centerPuff = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), cloudMat);
        centerPuff.castShadow = true;
        cloudGroup.add(centerPuff);

        // Surrounding puffs
        const puffPositions = [
          [-0.85, 0.15, 0.2, 0.85],
          [0.85, 0.15, 0.2, 0.85],
          [-0.6, -0.5, 0.1, 0.75],
          [0.6, -0.5, 0.1, 0.75],
          [0, 0.6, -0.2, 0.9],
        ];

        puffPositions.forEach(([x, y, z, r]) => {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), cloudMat);
          puff.position.set(x, y, z);
          puff.castShadow = true;
          cloudGroup.add(puff);
        });

        // Tilted French Beret
        const beretGroup = new THREE.Group();
        const beretMat = createPlushMat('#18181B', 0.6);
        const beretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.65, 0.3, 24), beretMat);
        const beretStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), beretMat);
        beretStem.position.y = 0.22;
        beretGroup.add(beretBase);
        beretGroup.add(beretStem);
        beretGroup.position.set(0.45, 1.25, 0.2);
        beretGroup.rotation.z = -0.35;
        beretGroup.rotation.x = 0.15;
        headRig.add(beretGroup);
      } else if (id === 'pink-bunny') {
        // =====================================================================
        // BERRY: Cotton Candy Bunny Companion
        // =====================================================================
        const bunnyMat = createPlushMat(primaryColor, 0.84);
        const innerEarMat = createPlushMat('#A7F3D0', 0.8); // Mint interior

        // Head sphere
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1.22, 32, 32), bunnyMat);
        headMesh.castShadow = true;
        headRig.add(headMesh);

        // Chubby cheeks
        const cheekPuffL = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), bunnyMat);
        cheekPuffL.position.set(-0.7, -0.3, 0.5);
        headRig.add(cheekPuffL);

        const cheekPuffR = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), bunnyMat);
        cheekPuffR.position.set(0.7, -0.3, 0.5);
        headRig.add(cheekPuffR);

        // Bunny Ears
        const earGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.7, 16);
        earGeo.scale(1, 1, 0.5);

        const leftEar = new THREE.Mesh(earGeo, bunnyMat);
        leftEar.position.set(-0.55, 1.8, -0.1);
        leftEar.rotation.z = 0.18;
        leftEar.rotation.x = -0.1;
        leftEar.castShadow = true;
        headRig.add(leftEar);
        accessoryMeshes.push(leftEar);

        const rightEar = new THREE.Mesh(earGeo, bunnyMat);
        rightEar.position.set(0.55, 1.8, -0.1);
        rightEar.rotation.z = -0.18;
        rightEar.rotation.x = -0.1;
        rightEar.castShadow = true;
        headRig.add(rightEar);
        accessoryMeshes.push(rightEar);

        // Inner ear inserts
        const innerEarGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.3, 16);
        innerEarGeo.scale(1, 1, 0.4);
        const leftInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        leftInner.position.set(-0.54, 1.75, 0.05);
        leftInner.rotation.z = 0.18;
        headRig.add(leftInner);

        const rightInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        rightInner.position.set(0.54, 1.75, 0.05);
        rightInner.rotation.z = -0.18;
        headRig.add(rightInner);

        // Mint Headphones
        const hpMat = new THREE.MeshStandardMaterial({
          color: 0x6ee7b7,
          roughness: 0.3,
          metalness: 0.2,
          emissive: 0x34d399,
          emissiveIntensity: 0.2,
        });
        const bandGeo = new THREE.TorusGeometry(1.35, 0.07, 16, 48, Math.PI);
        const band = new THREE.Mesh(bandGeo, hpMat);
        band.position.set(0, 0.25, 0);
        band.rotation.z = Math.PI;
        headRig.add(band);
      } else if (id === 'yellow-triangle') {
        // =====================================================================
        // PIXEL: Golden Prism Companion
        // =====================================================================
        const prismMat = createPlushMat(primaryColor, 0.85);

        // Soft triangular pyramid/cone
        const coneGeo = new THREE.ConeGeometry(1.4, 2.1, 3);
        coneGeo.rotateY(Math.PI / 6);
        const bodyMesh = new THREE.Mesh(coneGeo, prismMat);
        bodyMesh.castShadow = true;
        bodyMesh.position.y = 0.2;
        headRig.add(bodyMesh);

        // Golden Round Glasses Frames
        const glassesGroup = new THREE.Group();
        const glassesMat = new THREE.MeshStandardMaterial({
          color: 0x1f2937,
          roughness: 0.2,
          metalness: 0.8,
        });

        const lensRingL = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 16, 32), glassesMat);
        lensRingL.position.set(-0.4, 0.15, 0.95);
        glassesGroup.add(lensRingL);

        const lensRingR = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 16, 32), glassesMat);
        lensRingR.position.set(0.4, 0.15, 0.95);
        glassesGroup.add(lensRingR);

        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), glassesMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.15, 0.96);
        glassesGroup.add(bridge);

        headRig.add(glassesGroup);

        // Crimson Bow Tie
        const bowMat = createPlushMat('#DC2626', 0.5);
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), bowMat);
        knot.position.set(0, -0.65, 0.88);
        headRig.add(knot);

        const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 12), bowMat);
        wingL.rotation.z = Math.PI / 2;
        wingL.position.set(-0.25, -0.65, 0.86);
        headRig.add(wingL);

        const wingR = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 12), bowMat);
        wingR.rotation.z = -Math.PI / 2;
        wingR.position.set(0.25, -0.65, 0.86);
        headRig.add(wingR);
      } else if (id === 'purple-heart') {
        // =====================================================================
        // NOVA: Cosmic Violet Heart Companion
        // =====================================================================
        const heartMat = createPlushMat(primaryColor, 0.82);

        // Heart shape using 2 top spheres and a tapering bottom cone
        const heartGroup = new THREE.Group();

        const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), heartMat);
        lobeL.position.set(-0.45, 0.4, 0);
        lobeL.castShadow = true;
        heartGroup.add(lobeL);

        const lobeR = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), heartMat);
        lobeR.position.set(0.45, 0.4, 0);
        lobeR.castShadow = true;
        heartGroup.add(lobeR);

        const bottomCone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 24), heartMat);
        bottomCone.rotation.x = Math.PI;
        bottomCone.position.set(0, -0.4, 0);
        bottomCone.castShadow = true;
        heartGroup.add(bottomCone);

        headRig.add(heartGroup);

        // Retro Heart Sunglasses
        const sunGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0xf43f5e,
          roughness: 0.1,
          metalness: 0.3,
          clearcoat: 1.0,
        });

        const sunFrameL = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 24), sunGlassMat);
        sunFrameL.position.set(-0.42, 0.2, 0.85);
        headRig.add(sunFrameL);

        const sunFrameR = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 24), sunGlassMat);
        sunFrameR.position.set(0.42, 0.2, 0.85);
        headRig.add(sunFrameR);
      } else {
        // =====================================================================
        // MOCHI: Cream Plush Bear Mascot (Primary Default Companion)
        // =====================================================================
        const mochiMat = createPlushMat(primaryColor, 0.86);
        const innerHoodMat = createPlushMat('#FFF6E8', 0.9);

        // Outer Hood Head
        const outerHead = new THREE.Mesh(new THREE.SphereGeometry(1.3, 36, 36), mochiMat);
        outerHead.castShadow = true;
        headRig.add(outerHead);

        // Inner Face Disc
        const faceCavity = new THREE.Mesh(
          new THREE.SphereGeometry(1.18, 32, 32),
          innerHoodMat
        );
        faceCavity.position.set(0, -0.05, 0.15);
        headRig.add(faceCavity);

        // Cute Little Bear Ears on Hood
        const earMat = createPlushMat(primaryColor, 0.86);
        const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), earMat);
        leftEar.position.set(-0.95, 1.05, -0.15);
        leftEar.castShadow = true;
        headRig.add(leftEar);
        accessoryMeshes.push(leftEar);

        const rightEar = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), earMat);
        rightEar.position.set(0.95, 1.05, -0.15);
        rightEar.castShadow = true;
        headRig.add(rightEar);
        accessoryMeshes.push(rightEar);

        // Black Studio Headphones
        const hpMat = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          roughness: 0.35,
          metalness: 0.45,
        });

        // Headphone Over-Head Band
        const bandGeo = new THREE.TorusGeometry(1.4, 0.08, 16, 48, Math.PI * 0.95);
        const band = new THREE.Mesh(bandGeo, hpMat);
        band.position.set(0, 0.25, 0);
        band.rotation.z = Math.PI * 0.975;
        headRig.add(band);

        // Cushioned Ear Cups
        const cupGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24);
        cupGeo.rotateZ(Math.PI / 2);

        const leftCup = new THREE.Mesh(cupGeo, hpMat);
        leftCup.position.set(-1.42, 0.05, 0.05);
        leftCup.castShadow = true;
        headRig.add(leftCup);

        const rightCup = new THREE.Mesh(cupGeo, hpMat);
        rightCup.position.set(1.42, 0.05, 0.05);
        rightCup.castShadow = true;
        headRig.add(rightCup);

        // Cute Hoodie String Knots
        const stringMat = createPlushMat('#FFFFFF', 0.7);
        const stringGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12);

        const leftStr = new THREE.Mesh(stringGeo, stringMat);
        leftStr.position.set(-0.35, -1.25, 0.9);
        headRig.add(leftStr);

        const rightStr = new THREE.Mesh(stringGeo, stringMat);
        rightStr.position.set(0.35, -1.25, 0.9);
        headRig.add(rightStr);

        const knotGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const leftKnot = new THREE.Mesh(knotGeo, stringMat);
        leftKnot.position.set(-0.35, -1.55, 0.9);
        headRig.add(leftKnot);

        const rightKnot = new THREE.Mesh(knotGeo, stringMat);
        rightKnot.position.set(0.35, -1.55, 0.9);
        headRig.add(rightKnot);
      }

      // =======================================================================
      // SHARED FACE RIG: Expressive Eyes, Eyelids, Rosy Cheeks, Cute Mouth
      // =======================================================================
      // Left Eye Group
      leftEyeGroup = new THREE.Group();
      const leftEyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), eyeGlossMat);
      leftEyeGroup.add(leftEyeBall);

      // Specular highlight dots (anime/Pixar style dual sparkles)
      const leftHighlight1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), highlightMat);
      leftHighlight1.position.set(-0.04, 0.05, 0.15);
      leftEyeGroup.add(leftHighlight1);

      const leftHighlight2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), highlightMat);
      leftHighlight2.position.set(0.05, -0.04, 0.15);
      leftEyeGroup.add(leftHighlight2);

      // Left Eyelid (blinks by scaling/rotating)
      const eyelidGeo = new THREE.SphereGeometry(0.19, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      leftEyelid = new THREE.Mesh(eyelidGeo, createPlushMat(primaryColor));
      leftEyelid.rotation.x = Math.PI;
      leftEyelid.visible = false;
      leftEyeGroup.add(leftEyelid);

      leftEyeGroup.position.set(-0.44, 0.08, 1.15);
      headRig.add(leftEyeGroup);

      // Right Eye Group
      rightEyeGroup = new THREE.Group();
      const rightEyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), eyeGlossMat);
      rightEyeGroup.add(rightEyeBall);

      const rightHighlight1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), highlightMat);
      rightHighlight1.position.set(-0.04, 0.05, 0.15);
      rightEyeGroup.add(rightHighlight1);

      const rightHighlight2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), highlightMat);
      rightHighlight2.position.set(0.05, -0.04, 0.15);
      rightEyeGroup.add(rightHighlight2);

      rightEyelid = new THREE.Mesh(eyelidGeo, createPlushMat(primaryColor));
      rightEyelid.rotation.x = Math.PI;
      rightEyelid.visible = false;
      rightEyeGroup.add(rightEyelid);

      rightEyeGroup.position.set(0.44, 0.08, 1.15);
      headRig.add(rightEyeGroup);

      // Rosy Cheeks
      const cheekGeo = new THREE.CircleGeometry(0.18, 20);
      const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
      leftCheek.position.set(-0.62, -0.15, 1.12);
      leftCheek.rotation.y = -0.25;
      headRig.add(leftCheek);

      const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
      rightCheek.position.set(0.62, -0.15, 1.12);
      rightCheek.rotation.y = 0.25;
      headRig.add(rightCheek);

      // Tiny Cute Mouth
      const mouthGeo = new THREE.SphereGeometry(0.09, 16, 16);
      mouthGeo.scale(1.2, 0.5, 0.6);
      const mouthMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.6,
      });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.22, 1.2);
      headRig.add(mouthMesh);
    };

    buildCharacter(characterId);

    // =========================================================================
    // MOUSE & TOUCH POINTER TRACKING (Smooth 3D Eye/Head LookAt)
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
    // NATURAL BLINKING SCHEDULER
    // =========================================================================
    let isBlinking = false;
    let blinkTimer: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
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
      }, 140);

      const nextDelay = 2200 + Math.random() * 3800;
      blinkTimer = setTimeout(triggerBlink, nextDelay);
    };

    triggerBlink();

    // =========================================================================
    // MAIN 60FPS ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;

      // Smooth pointer interpolation
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      // 1. Eye Tracking (Pupils track pointer coordinates)
      if (leftEyeGroup && rightEyeGroup && !isBlinking) {
        const pupilX = pointer.x * 0.07;
        const pupilY = pointer.y * 0.06;
        leftEyeGroup.children[0].position.set(pupilX, pupilY, 0);
        rightEyeGroup.children[0].position.set(pupilX, pupilY, 0);
      }

      // 2. Head Tilt & Rotation
      let targetRotY = pointer.x * 0.35;
      let targetRotX = -pointer.y * 0.25;
      let targetRotZ = 0;

      // State-specific procedural behaviors
      if (currentState === 'listening' || currentState === 'speech_detected') {
        // Listening: perk ears, tilt slightly forward with focused interest
        targetRotX -= 0.12;
        characterGroup.position.y = -0.05 + Math.sin(t * 3.5) * 0.03;
        accessoryMeshes.forEach((mesh) => {
          mesh.rotation.x = -0.22 + Math.sin(t * 4) * 0.04;
        });
      } else if (currentState === 'processing' || currentState === 'generating') {
        // Thinking: cute 14-degree inquisitive head tilt
        targetRotZ = 0.22 + Math.sin(t * 2) * 0.06;
        targetRotY = 0.15;
        targetRotX = -0.08;
        characterGroup.position.y = Math.sin(t * 2.2) * 0.04;
      } else if (currentState === 'speaking') {
        // Speaking: energetic squash & stretch and body bounce synchronized to audio amplitude
        const voiceBounce = Math.max(0.08, currentAudio * 0.6);
        characterGroup.position.y = Math.sin(t * 12) * voiceBounce;
        characterGroup.scale.set(
          1 - voiceBounce * 0.3,
          1 + voiceBounce * 0.5,
          1 - voiceBounce * 0.2
        );

        // Mouth opens and closes to sound amplitude
        if (mouthMesh) {
          const mouthOpen = Math.min(2.8, Math.max(0.4, currentAudio * 4.5));
          mouthMesh.scale.y = mouthOpen;
          mouthMesh.scale.x = 1 + voiceBounce * 0.4;
        }
      } else if (currentState === 'error') {
        // Error: gentle concerned head tilt
        targetRotZ = -0.15;
        targetRotX = 0.12;
        characterGroup.position.y = -0.1;
      } else {
        // Idle: gentle sinusoidal floating and breathing
        characterGroup.position.y = Math.sin(t * 1.8) * 0.08;
        characterGroup.scale.set(
          1 + Math.sin(t * 2.4) * 0.02,
          1 - Math.sin(t * 2.4) * 0.025,
          1
        );

        if (mouthMesh) {
          mouthMesh.scale.set(1, 0.4, 0.6);
        }
      }

      // Smooth head rotation damping
      headRig.rotation.y += (targetRotY - headRig.rotation.y) * 0.08;
      headRig.rotation.x += (targetRotX - headRig.rotation.x) * 0.08;
      headRig.rotation.z += (targetRotZ - headRig.rotation.z) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // RESIZE LISTENER
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

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, [characterId, interactive]);

  if (!hasWebGL) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      onClick={interactive ? onCharacterClick : undefined}
      className="w-full h-full cursor-pointer select-none transition-transform active:scale-95 flex items-center justify-center"
      style={{ touchAction: 'none' }}
    />
  );
};
