import { FC, useRef } from 'react';
import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

const parallax = 1.5;

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(new Vector3(x * parallax, -y * parallax, 0));
  });

  useMouseMoveDelta(({ x, y }) => iterateTarget(new Vector3(x, y, 0)));
  useDeviceOrientationDelta(({ gamma, beta }) => {
    const strength = 0.03;
    iterateTarget(new Vector3(gamma * strength, beta * strength, 0));
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      collisionGroups={interactionGroups(2, [1])} // Поинтер видит только группу 1 (те, кто не дома)
      ccd={true}
    >
      {/* Возвращаем спокойные настройки: радиус 0.25 и прыгучесть 0.2 */}
      <BallCollider args={[0.25]} friction={0} restitution={0.4} />

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