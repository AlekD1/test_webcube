import { useGLTF } from '@react-three/drei';
import { useMemo, useEffect } from 'react';
// 🌟 ДОБАВИЛИ CanvasTexture и RepeatWrapping
import { MeshPhysicalMaterial, DoubleSide, Color, LinearFilter, ClampToEdgeWrapping, CanvasTexture, RepeatWrapping } from 'three'; 

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

  // 🌟 МАГИЯ ПРОГРАММНОЙ ТЕКСТУРЫ (Генератор шума) 🌟
  const noiseTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // 1. Заливаем фон нейтральным серым
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);
      
      // 2. Рисуем 150 000 случайных крошечных точек (эффект пескоструя/матового пластика)
      for (let i = 0; i < 150000; i++) {
        // Делаем точки либо белыми (бугорки), либо черными (впадинки)
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
      }
    }

    // 3. Превращаем Canvas в текстуру для Three.js
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2.5, 2.5); // Размножаем текстуру, чтобы зерно было еще мельче
    return texture;
  }, []);

  // Генерируем материал
  const denseGlassMaterials = useMemo(() => {
    return items.map((node) => {
      const hex = node.material.color.getHexString().toUpperCase();
      
      const isBlueOrPurple = hex === '6362CB' || node.material.color.b > 0.6;
      const isGreen = hex === 'C9FF40' || (node.material.color.g > 0.8 && node.material.color.b < 0.5);

      let whiteMix = 0.15; 
      if (isBlueOrPurple) whiteMix = 0.1;
      if (isGreen) whiteMix = -0.04; 

      const baseColor = node.material.color.clone().lerp(new Color(0xffffff), whiteMix);

      let attenDist = 0.8; 
      if (isBlueOrPurple) attenDist = 1.8;
      if (isGreen) attenDist = 1.2; 

      return new MeshPhysicalMaterial({
        color: baseColor, 
        
        // 🌟 1. СИЛА РАЗМЫТИЯ (оставляем твою)
        roughness: 0.6,             // Именно этот параметр замыливает всё внутри. 0.6 даст сильное мыло.
        metalness: 0.4,             
        
        clearcoat: 0.01,             
        clearcoatRoughness: 0.2,    
        ior: 1.5,                  

        emissive: baseColor, 
        emissiveIntensity: 0.20,    
        
        // 🌟 2. НАСТРОЙКИ ВНУТРЕННЕГО РАЗМЫТИЯ (Frosted Glass) 🌟
        opacity: 0.9,               // СТРОГО 1.0! Иначе красивое размытие отключится.
        transmission: 0.6,         // Пропускаем максимум света внутрь куба (было 0.5)
        thickness: 1.2,             // Увеличиваем толщину (было 0.3). В толстом слое свет размывается круче!
        
        attenuationColor: baseColor, 
        attenuationDistance: attenDist,   

        transparent: true,          
        depthWrite: true,           
        side: DoubleSide,           

        // Твоя текстура остается на месте
        bumpMap: noiseTexture, 
        bumpScale: 0.5, 
      });
    });
  }, [items, noiseTexture]);

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
            <mesh
              geometry={node.geometry}
              material={denseGlassMaterials[i]}
            />
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