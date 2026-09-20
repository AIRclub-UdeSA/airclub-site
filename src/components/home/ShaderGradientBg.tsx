"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader para ondas fluidas y deformación de malla 3D
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Ondulaciones orgánicas multidimensionales suaves
    float wave1 = sin(pos.x * 1.5 + uTime * 0.4) * 0.25;
    float wave2 = cos(pos.y * 1.2 + uTime * 0.35) * 0.22;
    float wave3 = sin((pos.x + pos.y) * 1.0 + uTime * 0.5) * 0.15;
    
    pos.z += wave1 + wave2 + wave3;
    vElevation = pos.z;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader con paleta auténtica de AIR Club: vino oscuro (#120208), bordeaux (#280614) y carmesí de marca (#8e0a42 / #a40c4c)
const fragmentShader = `
  uniform vec3 uColorDark;
  uniform vec3 uColorMid;
  uniform vec3 uColorCrimson;
  uniform vec3 uColorHighlight;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixElevation = smoothstep(-0.35, 0.45, vElevation);
    float peakHighlight = smoothstep(0.1, 0.45, vElevation);
    
    // Mezcla armónica en la paleta de la marca AIR Club
    vec3 color = mix(uColorDark, uColorMid, vUv.y);
    color = mix(color, uColorCrimson, mixElevation * 0.85);
    color = mix(color, uColorHighlight, peakHighlight * 0.5);
    
    // Suave viñeta perimetral para integrarse en el fondo oscuro
    float edgeFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x) *
                     smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
                     
    gl_FragColor = vec4(color, edgeFade * 0.75);
  }
`;

function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorDark: { value: new THREE.Color("#120208") },
      uColorMid: { value: new THREE.Color("#280614") },
      uColorCrimson: { value: new THREE.Color("#8e0a42") },
      uColorHighlight: { value: new THREE.Color("#a40c4c") },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, -0.2, -0.5]}>
      <planeGeometry args={[7, 4.5, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        wireframe={false}
      />
    </mesh>
  );
}

export function ShaderGradientBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-65">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <WavePlane />
      </Canvas>
    </div>
  );
}
