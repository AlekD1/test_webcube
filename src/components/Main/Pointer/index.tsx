import { FC, useRef } from 'react';
import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

// ДОБАВЛЕН ЛИМИТАТОР
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parallax = 1.5;

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(new Vector3(x * parallax, -y * parallax, 0));
  });

  // 🌟 1. ПК (МЫШЬ): Увеличили смещение всего на 20% (множитель 1.2)
  useMouseMoveDelta(({ x, y }) => iterateTarget(new Vector3(x * 1.2, y * 1.2, 0)));
  
  // 🌟 2. МОБИЛКИ (ГИРОСКОП): Чуть-чуть приподняли чувствительность (с 0.03 до 0.035)
  useDeviceOrientationDelta(({ gamma, beta }) => {
    // ПРИМЕНЯЕМ ЛИМИТ: режем углы до 45 градусов
    const safeGamma = clamp(gamma, -45, 45);
    const safeBeta = clamp(beta, -45, 45);
    
    const strength = 0.020;
    iterateTarget(new Vector3(safeGamma * strength, safeBeta * strength, 0));
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      collisionGroups={interactionGroups(2, [1])} // Поинтер видит только группу 1 (те, кто не дома)
      ccd={true}
    >
      {/* 🌟 3. РАДИУС КОЛЛАЙДЕРА: Сделали шарик буквально на миллиметр толще (с 0.25 до 0.28) */}
      <BallCollider args={[0.28]} friction={0} restitution={0.4} />

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