import { FC, PropsWithChildren, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { interactionGroups, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const initialPos = useRef<Vector3 | null>(null);
  const initialRot = useRef<any>(null); // Добавили реф для стартового поворота

  const vec = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const body = ref.current;

    if (!body) return;

    // При первом кадре запоминаем не только позицию, но и идеальный поворот!
    if (!initialPos.current || !initialRot.current) {
      initialPos.current = new Vector3().copy(body.translation());
      initialRot.current = body.rotation(); 
    }

    const currentPos = body.translation();
    const distance = initialPos.current.distanceTo(currentPos);

    // --- АБСОЛЮТНЫЙ ЗАПРЕТ НА ВРАЩЕНИЕ ---
    // Каждый кадр жестко возвращаем деталь в исходный угол и убиваем скорость вращения
    body.setRotation(initialRot.current, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    if (distance > 0.01) {
      body.applyImpulse(
        vec
          .copy(initialPos.current)
          .sub(currentPos)
          .multiplyScalar(0.7),
        true,
      );
    } else if (distance > 0) {
      body.setTranslation(initialPos.current, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={ref}
      collisionGroups={interactionGroups(1, [2])}
      // ЗАМЕНЯЕМ lockRotations НА ЖЕСТКОЕ ОТКЛЮЧЕНИЕ ОСЕЙ:
      enabledRotations={[false, false, false]} 
      linearDamping={2}
      angularDamping={10} // На всякий случай делаем сопротивление вращению гигантским
      friction={1}
      colliders="cuboid"
      restitution={0}
    >
      {children}
    </RigidBody>
  );
};