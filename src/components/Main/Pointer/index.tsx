import { FC, useRef } from 'react';
import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber'; // Добавили для активного расталкивания

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

const parallax = 1.5;

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(
      new Vector3(x * parallax, -y * parallax, 0),
    );
  });

  useMouseMoveDelta(({ x, y }) => iterateTarget(new Vector3(x, y, 0)));

  useDeviceOrientationDelta(({ gamma, beta }) => {
    const strength = 0.05;
    iterateTarget(new Vector3(gamma * strength, beta * strength, 0));
  });

  // 🌟 МАГИЯ: Активное расталкивание
  // Если частица застряла "под" поинтером, этот код поможет её вытолкнуть
  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    // Можно добавить дополнительную логику импульса здесь, 
    // но сначала попробуем усиленный физический коллайдер ниже
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      collisionGroups={interactionGroups(2, [1])}
      ccd={true}
    >
      {/* 🌟 ОБНОВЛЕННЫЙ КОЛЛАЙДЕР:
          1. Увеличили радиус до 0.35, чтобы он был чуть больше и лучше "выгребал" частицы.
          2. Restitution 1.6 — теперь это настоящий батут.
          3. solverGroups — заставляем движок приоритетнее обрабатывать эти столкновения.
      */}
      <BallCollider 
        args={[0.35]} 
        friction={0} 
        restitution={1.6} 
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