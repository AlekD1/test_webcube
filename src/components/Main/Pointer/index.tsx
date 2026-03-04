import { FC, useRef, useEffect } from 'react';

import { interactionGroups, RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Vector3 } from 'three';

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';
import { useScreenPositionDelta } from '@/hooks/useScreenPositionDelta';

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

  useScreenPositionDelta(({ x, y }) => {
    const strength = 3;
    const vec = new Vector3(-x * strength, -y * strength, 0);
    iterateTarget(vec);
  });

  // 🌟 МАГИЯ 1: Решаем проблему "Забытого пальца" на мобилках
  useEffect(() => {
    const onTouchEnd = () => {
      // Как только палец оторвался от экрана, мгновенно отправляем невидимый
      // поинтер далеко за экран (x: 100, y: 100). Теперь он не будет
      // стоять как бетонный столб внутри куба и мешать деталям собраться!
      iterateTarget(new Vector3(100, 100, 0));
    };

    window.addEventListener('touchend', onTouchEnd);
    return () => window.removeEventListener('touchend', onTouchEnd);
  }, [iterateTarget]);

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false} 
      collisionGroups={interactionGroups(2, [1])}
    >
      {/* 🌟 МАГИЯ: Делаем шарик абсолютно скользким (friction=0) 
          и заставляем его выталкивать детали (restitution=0.5) */}
      <BallCollider 
        args={[0.2]} 
        friction={0} 
        restitution={0.5} 
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