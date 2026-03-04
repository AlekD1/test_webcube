import { FC, PropsWithChildren, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { interactionGroups, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const initialPos = useRef<Vector3 | null>(null);
  
  // 🌟 МАГИЯ REACT: Создаем состояние "дома ли деталь?"
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

    // --- ПЕРЕКЛЮЧАТЕЛЬ "НЕВЕСОМОСТИ" ---
    // Обновляем состояние только в момент пересечения границы (чтобы не просаживать FPS)
    if (distance > 0.05 && isHome) {
      setIsHome(false); // Вылетела! Становится призраком
    } else if (distance <= 0.05 && !isHome) {
      setIsHome(true);  // Вернулась! Снова становится твердой
    }

    if (distance > 0.01) {
      // Твой оригинальный импульс
      body.applyImpulse(
        vec
          .copy(initialPos.current)
          .sub(currentPos)
          .multiplyScalar(0.7),
        true,
      );
    } else if (distance > 0) {
      // Жесткая фиксация дома
      body.setTranslation(initialPos.current, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={ref}
      // 🌟 МАГИЯ REACT: Передаем нужную группу напрямую в компонент
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