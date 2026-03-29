import { FC, useRef } from 'react';

import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Group, Vector3 } from 'three';

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';
import { useScreenPositionDelta } from '@/hooks/useScreenPositionDelta';

import { Model } from './Model';
import { Pointer } from './Pointer';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));


const rotation = Math.PI * 0.9;

export const Scene: FC = () => {
  const groupRef = useRef<Group>(null);

  const { iterateTarget: iteratePositionTarget } = useAnimatableVec3(
    ({ x, y }) => {
      const group = groupRef.current!;

      group.position.set(x, -y, 0);
    },
    
    0.012,
    0.1,
  );

  const { iterateTarget: iterateRotationTarget } = useAnimatableVec3(
    ({ x, y, z }) => {
      const group = groupRef.current!;

      group.rotation.set(y * rotation, x * rotation, z * rotation);
    },

    0.012,
    0.1,
  );

  useMouseMoveDelta(({ x, y }) => {
    const vec = new Vector3(x, y, 0);

    iteratePositionTarget(vec);
    iterateRotationTarget(vec);
  });

  useScreenPositionDelta(({ x, y }) => {
    const strength = 5;
    const vec = new Vector3(-x * strength, -y * strength, 0);

    iteratePositionTarget(vec);
    iterateRotationTarget(vec);
  });

  useDeviceOrientationDelta(({ gamma, beta }) => {
    
    const safeGamma = clamp(gamma, -45, 45);
    const safeBeta = clamp(beta, -45, 45);

    const rotationStrength = 0.05;
    const rotationVector = new Vector3(
      safeGamma * rotationStrength,
      safeBeta * rotationStrength,
      0,
    );

    const positionStrength = 0.075;
    const positionVector = new Vector3(
      safeGamma * positionStrength,
      safeBeta * positionStrength,
      0,
    );

    iterateRotationTarget(rotationVector);
    iteratePositionTarget(positionVector);
  });

  return (
    <>
      <Environment files="env/warehouse.hdr" environmentIntensity={1} />

      <Physics gravity={[0, 0, 0]} colliders="hull">
        <group ref={groupRef} scale={1}>
          
          {}
          <group position={[0, 0.3, 0]}>
            <Pointer />
            <Model />
          </group>

        </group>
      </Physics>
    </>
  );
};