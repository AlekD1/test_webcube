import { useGLTF } from '@react-three/drei';
import { useMemo, useEffect } from 'react';
import { MeshPhysicalMaterial, DoubleSide } from 'three';

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

  // Генерируем материал "Сочного матового пластика"
 // Генерируем материал "Сочного матового пластика"
  // Генерируем материал "Прозрачного мармелада"
  const denseGlassMaterials = useMemo(() => {
    return items.map((node) => {
      return new MeshPhysicalMaterial({
        color: node.material.color, 
        roughness: 0.3,             // Сделал чуть прозрачнее (было 0.4), чтобы лучше видеть нутро
        metalness: 0.0,             
        clearcoat: 0.2,             
        clearcoatRoughness: 0.7,    
        
        emissive: node.material.color, 
        emissiveIntensity: 0.1,     // Чуть убавил свечение, чтобы оно не перебивало прозрачность

        // --- МАГИЯ ВНУТРЕННОСТЕЙ ---
        transmission: 0.9,          // Пропускаем максимум света внутрь (было 0.6)
        thickness: 0.3,             // Делаем объем более легким, "мармеладным" (было 1.0)
        ior: 1.5,                   // Убираем сильное преломление, чтобы внутренности не превращались в кашу
        transparent: true,          
        depthWrite: true,           
        side: DoubleSide,           // 🌟 ГЛАВНАЯ МАГИЯ: Заставляем движок рисовать внутренние стенки кубиков!
      });
    });
  }, [items]);

  // Защищаем надписи (Plane), чтобы они не перекрывались пластиком
  useEffect(() => {
    items.forEach(node => {
      node.children?.forEach((child: any) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.depthWrite = false; // Надпись не "проваливается" в глубину
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
            {/* 1. ОСНОВНОЙ КУБ (сочный матовый пластик) */}
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
                renderOrder={1} // Рисуем надписи самым последним слоем (поверх всего)
              />
            ))}
          </group>
        ))}
      </Modify>
    </group>
  );
};