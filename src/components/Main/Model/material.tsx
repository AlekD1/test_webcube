import { DoubleSide, MeshPhysicalMaterial } from 'three';

// Это материал стеклянного слоя (второй слой поверх оригинального)
export const material = new MeshPhysicalMaterial({
  color: 0xffffff,
  emissive: 0x000000,
  roughness: 0.1, 
  metalness: 0.0,
  reflectivity: 0.5, 
  clearcoat: 1.0, 
  clearcoatRoughness: 0.1, 
  /* 
     КАК СДЕЛАТЬ БЛОКИ ПЛОТНЫМИ, НО ЯРКИМИ:
     1. transmission: 0.0 — блоки становятся "глухими" (не прозрачными), вы не видите сквозь них другие блоки.
     2. opacity: 0.2 — кастомный материал ложится тонким слоем поверх оригинала, не перекрывая его цвет.
     3. depthWrite: true — обязательно включено, чтобы блоки корректно перекрывали друг друга.
  */
  transmission: 0.0, // Полностью убираем прозрачность 'насквозь'
  thickness: 0.0, 
  ior: 1.5, 
  transparent: true,
  opacity: 0.01, // Прозрачность именно этого 'стеклянного' слоя поверх оригинала
  side: DoubleSide,
  depthWrite: true, // Включаем, чтобы блоки не просвечивали друг друга
  depthTest: true,
});
