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

    if (!initialPos.current)
      initialPos.current = new Vector3().copy(body.translation());

    body.applyImpulse(
      vec
        .copy(initialPos.current)
        .sub(body.translation())
        .multiplyScalar(0.7),
      true,
    );
  });

  return (
    <RigidBody
      ref={ref}
      collisionGroups={interactionGroups(1, [2])} // Кубики сталкиваются только с курсором (2), чтобы не рассыпаться из-за физических отступов коллайдеров
      lockRotations
      linearDamping={2}
      angularDamping={2}
      friction={1}
      colliders="cuboid" // ИДЕАЛЬНЫЙ КОЛЛАЙДЕР: для кубиков 'cuboid' создает самую ровную сетку без щелей (в отличие от hull)
      restitution={0} // Нулевая упругость, чтобы они не отскакивали друг от друга
    >
      {children}
    </RigidBody>
  );
};
