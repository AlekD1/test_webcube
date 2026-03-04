import { FC, useRef } from 'react';

import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

// Оставили parallax 1.5, но если на компе мышка кажется медленной, можешь смело ставить 2.0 или 3.0
const parallax = 1.5; 

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);

  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(
      new Vector3(x * parallax, -y * parallax, 0),
    );
  });

  // Работает только от мышки на компьютере
  useMouseMoveDelta(({ x, y }) => iterateTarget(new Vector3(x, y, 0)));

  // Работает только от наклона (гироскопа) на телефоне
  useDeviceOrientationDelta(({ gamma, beta }) => {
    const strength = 0.05;
    iterateTarget(new Vector3(gamma * strength, beta * strength, 0));
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false} 
      collisionGroups={interactionGroups(2, [1])}
      ccd={true} 
    >
      {/* 🌟 МАГИЯ: friction={0} убирает трение, а restitution={1.2} заставляет поинтер 
          моментально и с силой "выплевывать" из себя детальки */}
      <BallCollider 
        args={[0.25]} 
        friction={0} 
        restitution={1.2} 
      />

      <group rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={0x999999}
            emissive={0x555555}
            metalness={0.0}
            roughness={0.5}
          />
        </mesh>
      </group>
    </RigidBody>
  );
};