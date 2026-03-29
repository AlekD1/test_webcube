'use client';

import { FC, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';

import { DeviceOrientationButton } from '../DeviceOrientationButton';

import { Scene } from './Scene';
import styles from './styles.module.css';
import { WebGPUPostProcessing } from './WebGPUPostProcessing';

export const Main: FC = () => {
  const [frameloop, setFrameloop] = useState<'never' | 'always'>('never');

  return (
    <div className={styles.scene}>
      <DeviceOrientationButton />

      <Canvas
        dpr={[1, 1.5]}
        gl={async ({ canvas }) => {
          const renderer = new WebGPURenderer({
            canvas: canvas as any,
            alpha: true,
            stencil: false,
            antialias: false,
          });

          renderer
            .init()
            .then(() => setFrameloop('always'))
            .catch(null);

          return renderer;
        }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={frameloop}
      >
        <WebGPUPostProcessing />

        <Scene />
      </Canvas>
    </div>
  );
};

