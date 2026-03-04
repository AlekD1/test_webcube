import { FC, PropsWithChildren, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { interactionGroups, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const initialPos = useRef<Vector3 | null>(null);
  
  // Состояние: дома деталь или нет
  const [isHome, setIsHome] = useState(true);

  const vec = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const body = ref.current;

    if (!body) return;

    if (!initialPos.current) {
      initialPos.current = new Vector3().copy(body.translation());
    }

    const currentPos = body.translation();
    const distance = initialPos.current.distanceTo(currentPos);

    // --- ЛОГИКА ВОЗВРАТА И ДИНАМИЧЕСКИХ КОЛЛИЗИЙ ---
    // Увеличили порог до 0.05, чтобы избежать "зависания" в воздухе
    if (distance > 0.05) {
      if (isHome) setIsHome(false); // Деталь вылетела - делаем призраком

      // Тянем домой. Дал чуть больше силы (0.8), чтобы летела бодрее
      body.applyImpulse(
        vec
          .copy(initialPos.current)
          .sub(currentPos)
          .multiplyScalar(0.8),
        true,
      );
    } else {
      if (!isHome) setIsHome(true); // Деталь дома - делаем твердой

      // Как только деталь вошла в зону 0.05 — ЖЕСТКО защелкиваем на место.
      // Это убивает эффект "нехватки бензина", деталь моментально встает в паз.
      body.setTranslation(initialPos.current, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={ref}
      // Магия: если дома -> бьется об поинтер (1, [2]). Если в полете -> проходит сквозь всё (3, [0])
      collisionGroups={isHome ? interactionGroups(1, [2]) : interactionGroups(3, [0])}
      lockRotations
      linearDamping={2}
      angularDamping={2}
      friction={1}
      colliders="cuboid"
      restitution={0}
    >
      {children}
    </RigidBody>
  );
};