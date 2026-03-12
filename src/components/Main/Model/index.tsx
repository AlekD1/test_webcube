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
// Генерируем материал "Литое акриловое стекло с яркими гранями"
  const denseGlassMaterials = useMemo(() => {
    return items.map((node) => {
      // 1. Узнаем, какой цвет у текущей детали
      const hex = node.material.color.getHexString().toUpperCase();
      
      // 2. Идентифицируем кубы по цветам
      const isBlueOrPurple = hex === '6362CB' || node.material.color.b > 0.6;
      // 🌟 Находим салатовый куб (по HEX или преобладанию зеленого)
      const isGreen = hex === 'C9FF40' || (node.material.color.g > 0.8 && node.material.color.b < 0.5);

      // 3. МАГИЯ ЦВЕТА: Настраиваем примесь белого для каждого
      let whiteMix = 0.15; // По умолчанию (для серых/белых)
      if (isBlueOrPurple) whiteMix = 0.1;
      if (isGreen) whiteMix = -0.04; // 🌟 ДЛЯ САЛАТОВОГО (было 0.15, сделали 0.25 для осветления)

      const baseColor = node.material.color.clone().lerp(new Color(0xffffff), whiteMix);

      // 4. ГУСТОТА: Настраиваем проницаемость света внутри объема
      let attenDist = 0.8; // По умолчанию
      if (isBlueOrPurple) attenDist = 1.8;
      if (isGreen) attenDist = 1.2; // 🌟 ДЛЯ САЛАТОВОГО (было 0.8, сделали 1.2, чтобы свет глубже проходил)

      return new MeshPhysicalMaterial({
        color: baseColor, 
        roughness: 0.6,             
        metalness: 0.4,             
        
        clearcoat: 0.01,             
        clearcoatRoughness: 0.2,    
        ior: 1.5,                  

        // Свечение теперь берем от ОСВЕТЛЕННОГО цвета
        emissive: baseColor, 
        emissiveIntensity: 0.15,    
        opacity: 0.8,
        transmission: 0.5,          
        thickness: 0.3,             
        
        // Внутренний объем тоже заливаем ОСВЕТЛЕННЫМ цветом
        attenuationColor: baseColor, 
        attenuationDistance: attenDist,   // Синий будет пропускать свет на дистанцию 1.8 (светлее), остальные на 0.8

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