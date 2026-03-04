import { FC, PropsWithChildren, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { interactionGroups, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

export const ModelRigidBody: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<RapierRigidBody>(null);
  const initialPos = useRef<Vector3 | null>(null);

  const vec = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const body = ref.current;

    if (!body) return;

    if (!initialPos.current) {
      initialPos.current = new Vector3().copy(body.translation());
    }

    const currentPos = body.translation();
    const distance = initialPos.current.distanceTo(currentPos);

    if (distance > 0.01) {
      // Твой оригинальный импульс (работает супер)
      body.applyImpulse(
        vec
          .copy(initialPos.current)
          .sub(currentPos)
          .multiplyScalar(0.7),
        true,
      );
    } else if (distance > 0) {
      // МАГИЯ АНТИ-ЗИГЗАГА: 
      // Как только деталь почти на месте, жестко ставим её в идеальную стартовую точку
      // и убиваем остаточную скорость (мондраж), чтобы она замерла намертво.
      body.setTranslation(initialPos.current, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={ref}
      collisionGroups={interactionGroups(1, [2])}
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