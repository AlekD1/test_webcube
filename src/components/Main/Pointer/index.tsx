import { FC, useRef } from 'react';
import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';

// ДОБАВЛЕН ЛИМИТАТОР УГЛОВ
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parallax = 1.5;

export const Pointer: FC = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  
  // Определяем устройство для множителя
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mouseMultiplier = isMobile ? 0.55 : 1;

  // 🌟 НОВАЯ НАСТРОЙКА: Максимальная дальность отлета шарика (тот самый "поводок")
  // Поиграйся с этой цифрой. Например, 1.5 - это примерно границы самого куба в твоей сцене.
  const maxLength = 0.5;

  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(new Vector3(x * parallax, -y * parallax, 0));
  });

  // 🌟 1. ПК И МОБИЛКИ (МЫШЬ): Применяем множитель и жестко обрезаем длину
  useMouseMoveDelta(({ x, y }) => {
    const vec = new Vector3(x * mouseMultiplier, y * mouseMultiplier, 0);
    
    // МАГИЯ: вектор никогда не будет длиннее, чем maxLength. 
    // Шарик физически упрется в невидимую круглую стену.
    vec.clampLength(0, maxLength);
    
    iterateTarget(vec);
  });
  
  // 🌟 2. МОБИЛКИ (ГИРОСКОП): Чувствительность и обрезка радиуса
  useDeviceOrientationDelta(({ gamma, beta }) => {
    const safeGamma = clamp(gamma, -45, 45);
    const safeBeta = clamp(beta, -45, 45);
    
    const strength = 0.015;
    const vec = new Vector3(safeGamma * strength, safeBeta * strength, 0);
    
    // На всякий случай сажаем на поводок и гироскоп
    vec.clampLength(0, maxLength);

    iterateTarget(vec);
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      collisionGroups={interactionGroups(2, [1])} // Поинтер видит только группу 1 (те, кто не дома)
      ccd={true}
    >
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