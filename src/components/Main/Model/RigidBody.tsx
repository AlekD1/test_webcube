import { FC, PropsWithChildren, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { interactionGroups, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const initialPos = useRef<Vector3 | null>(null);

  const vec = useMemo(() => new Vector3(), []);

  // 🌟 СТРОГИЙ ПОВОДОК: Максимальная дистанция отлета (1 метр)
  // Если кубики все еще вылезают за экран, уменьши до 0.8 или 0.6
  const MAX_DISTANCE = 1.0; 

  useFrame(() => {
    const body = ref.current;

    if (!body) return;

    // 1. Запоминаем идеальную точку (свой дом) при старте
    if (!initialPos.current) {
      initialPos.current = new Vector3().copy(body.translation());
    }

    const currentPos = body.translation();
    const distance = initialPos.current.distanceTo(currentPos);

    // Достаем саму физическую оболочку (коллайдер) кубика напрямую
    const collider = body.collider(0);

    if (distance > 0.05) {
      // 🚀 МЫ В НЕВЕСОМОСТИ (отошли от точки)
      
      // Делаем кубик призраком: он не видит никого (маска [0])
      if (collider) collider.setCollisionGroups(interactionGroups(3, [0]));

      // 🌟 ПРОВЕРКА НА ПОВОДОК
      if (distance > MAX_DISTANCE) {
        // Улетел дальше положенного? Прибиваем к невидимой стене поводка
        vec.copy(currentPos)
           .sub(initialPos.current)
           .normalize()
           .multiplyScalar(MAX_DISTANCE)
           .add(initialPos.current);
        
        body.setTranslation(vec, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true); // Гасим скорость, чтобы не застрял
      } else {
        // 🌟 БЫСТРЫЙ ВОЗВРАТ
        // Тянем домой (увеличили множитель с 0.7 до 0.9 для резкости)
        body.applyImpulse(
          vec
            .copy(initialPos.current)
            .sub(currentPos)
            .multiplyScalar(0.9),
          true,
        );
      }
    } else {
      // 🏠 МЫ ДОМА (пришли в точку)
      
      // Включаем столкновения: теперь мы видим поинтер (группа [2])
      if (collider) collider.setCollisionGroups(interactionGroups(1, [2]));

      // Жестко прибиваем гвоздями к идеальной точке, чтобы не было микро-тряски
      body.setTranslation(initialPos.current, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={ref}
      // 👇 ВЕРНУЛИ ЭТУ СТРОЧКУ, чтобы при спавне они не расталкивали друг друга
      collisionGroups={interactionGroups(1, [2])} 
      lockRotations
      
      // 🌟 ДЕМПФИРОВАНИЕ: оставили небольшим (3), чтобы кубики были быстрыми
      linearDamping={3}
      angularDamping={3}
      
      friction={1}
      colliders="cuboid"
      restitution={0}
    >
      {children}
    </RigidBody>
  );
};