import { useGLTF } from '@react-three/drei';
import { useMemo, useEffect } from 'react';
import { MeshPhysicalMaterial, DoubleSide, Color, LinearFilter, ClampToEdgeWrapping } from 'three'; 

import { Modify } from './Modify';

export const Model = () => {
  const gltf = useGLTF('/models/Cube.glb');
  const nodes = gltf.nodes as any;

  // Создаем массив кубов
  const items = useMemo(() => [
    nodes.Cube_1, nodes.Cube_2, nodes.Cube_3,
    nodes.Cube_4, nodes.Cube_5, nodes.Cube_6,
    nodes.Cube_7, nodes.Cube_8, nodes.Cube_9,
  ], [nodes]);

  // Генерируем материал "Литое акриловое стекло с яркими гранями"
  const denseGlassMaterials = useMemo(() => {
    return items.map((node) => {
      // Базовый цвет чуть осветляем для молочности
      const baseColor = node.material.color.clone().lerp(new Color(0xffffff), 0.15);

      return new MeshPhysicalMaterial({
        color: baseColor, 
        roughness: 0.6,             // Снизили шероховатость, чтобы ребра ловили свет лучше
        metalness: 0.0,             // Убрали металл, он "грязнит" стекло
        
        // --- МАГИЯ ГРАНЕЙ (Яркие ребра) ---
        clearcoat: 0.01,             // Накидываем жесткий глянец поверх куба
        clearcoatRoughness: 0.1,    // Глянец должен быть острым, чтобы очертить ребра
        ior: 1.2,                  // Индекс преломления стекла (создает свечение по краям)

        emissive: node.material.color, 
        emissiveIntensity: 0.15,    

        // --- МАГИЯ ОБЪЕМА (Густота цвета) ---
        transmission: 0.8,          // Полное пропускание света
        thickness: 0.3,             // Виртуальная толщина куска (было 0.3, делаем массивнее!)
        attenuationColor: node.material.color, // Каким цветом наливается объем внутри
        attenuationDistance: 0.8,   // Как быстро сгущается цвет. Чем меньше цифра, тем плотнее края

        transparent: true,          
        depthWrite: true,           
        side: DoubleSide,           
      });
    });
  }, [items]);

  // Защищаем надписи (Plane)
  useEffect(() => {
    items.forEach(node => {
      node.children?.forEach((child: any) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.depthWrite = false; 
          
          child.material.polygonOffset = true;
          child.material.polygonOffsetFactor = -1;
          child.material.polygonOffsetUnits = -1;

          child.material.alphaTest = 0.5; 

          child.material.side = DoubleSide; 
          child.material.color = new Color(0xffffff); 

          if (child.material.map) {
            child.material.map.generateMipmaps = false;
            child.material.map.minFilter = LinearFilter;
            child.material.map.wrapS = ClampToEdgeWrapping;
            child.material.map.wrapT = ClampToEdgeWrapping;
            child.material.map.needsUpdate = true;
          }

          child.material.needsUpdate = true; 
        }
      });
    });
  }, [items]);

  return (
    <group rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
      <Modify>
        {items.map((node, i) => (
          <group
            key={i}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
          >
            {/* 1. ОСНОВНОЙ КУБ */}
            <mesh
              geometry={node.geometry}
              material={denseGlassMaterials[i]}
            />

            {/* 2. ЛОГОТИПЫ И ТЕКСТ */}
            {node.children?.map((child: any) => (
              <mesh
                key={child.uuid}
                geometry={child.geometry}
                material={child.material}
                position={child.position}
                rotation={child.rotation}
                scale={child.scale}
                renderOrder={1} 
              />
            ))}
          </group>
        ))}
      </Modify>
    </group>
  );
};