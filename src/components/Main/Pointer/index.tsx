import { FC, useRef } from 'react';
import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parallax = 1.5;

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mouseMultiplier = isMobile ? 0.45 : 0.5;

  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(new Vector3(x * parallax, -y * parallax, 0));
  });

  useMouseMoveDelta(({ x, y }) => iterateTarget(new Vector3(x * mouseMultiplier, y * mouseMultiplier, 0)));
  

  useDeviceOrientationDelta(({ gamma, beta }) => {
    const safeGamma = clamp(gamma, -45, 45);
    const safeBeta = clamp(beta, -45, 45);
    
    const strength = 0.015;
    iterateTarget(new Vector3(safeGamma * strength, safeBeta * strength, 0));
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      collisionGroups={interactionGroups(2, [1])} 
      ccd={true}
    >
      {}
      <BallCollider args={[0.28]} friction={0} restitution={0} />

      <group rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={0x999999} emissive={0x555555} metalness={0} roughness={0.5} />
        </mesh>
      </group>
    </RigidBody>
  );
};