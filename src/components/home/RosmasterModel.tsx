"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ROSMASTER_MODEL_URL } from "./RosmasterTrack";

/** Altura/largo de referencia del modelo normalizado (la dimensión mayor mide esto, con la base en y = 0). */
export const ROSMASTER_UNITS = 2.4;

/** El CAD del Rosmaster repintado con la paleta del club, centrado en X y Z y apoyado sobre y = 0. */
export function useRosmasterModel() {
  const { scene } = useGLTF(ROSMASTER_MODEL_URL);

  // Clona la escena para aislar modificaciones de materiales y nodos
  const cloned = useMemo(() => {
    const root = scene.clone(true);

    // La cámara Orbbec Astra ya viene corrida en el GLB (antes, z = -10 en su nodo; con la cuantización,
    // incluido en la traslación del nodo). No pisar su posición: con el modelo cuantizado la mueve de lugar.

    // Repintado con la paleta de identidad AIR Club
    const crimsonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#a40c4c"), // Carmesí oficial AIR Club
      roughness: 0.32,
      metalness: 0.72,
      envMapIntensity: 1.4,
    });

    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b8828e"), // Titanio satinado rosado
      roughness: 0.3,
      metalness: 0.85,
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8d0d5"), // Acero maquinado
      roughness: 0.25,
      metalness: 0.9,
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#161619"), // Fibra de carbono negra
      roughness: 0.75,
      metalness: 0.25,
    });

    const lidarMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a0612"), // Obsidiana vino para LiDAR
      roughness: 0.38,
      metalness: 0.6,
    });

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = mesh.material as THREE.Material;
        const matName = mat?.name || "";

        if (matName === "Chassis_Green") {
          mesh.material = crimsonMaterial;
        } else if (matName === "Standoff_Brass") {
          mesh.material = titaniumMaterial;
        } else if (matName === "Motor_Steel") {
          mesh.material = steelMaterial;
        } else if (matName === "Wheel_Carbon") {
          mesh.material = carbonMaterial;
        } else if (matName === "Lidar_Black") {
          mesh.material = lidarMaterial;
        }
      }
    });

    // Normalización y centrado de escala del CAD (1.32 unidades de referencia)
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = ROSMASTER_UNITS / maxDim;

    root.scale.setScalar(scale);
    // Alineamos el centro en X y Z a 0, y fijamos la base más baja de las ruedas exactamente en y = 0
    root.position.x = -center.x * scale;
    root.position.y = -box.min.y * scale;
    root.position.z = -center.z * scale;

    return root;
  }, [scene]);

  return cloned;
}
