import { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { useStore } from '../../stores/useStore';
import type { MaterialInfo } from '../../types';

interface ModelProps {
  url: string;
  autoRotate?: boolean;
  onError?: (error: string) => void;
}

// 将 Three.js 颜色转换为 hex 字符串
function colorToHex(color: THREE.Color): string {
  return '#' + color.getHexString();
}

// 从模型中提取材质信息
function extractMaterials(object: THREE.Object3D): MaterialInfo[] {
  const materials: Map<string, MaterialInfo> = new Map();
  
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial && !materials.has(mat.uuid)) {
          materials.set(mat.uuid, {
            uuid: mat.uuid,
            name: mat.name || `Material ${materials.size + 1}`,
            color: colorToHex(mat.color),
            metalness: mat.metalness,
            roughness: mat.roughness,
            emissive: colorToHex(mat.emissive),
            emissiveIntensity: mat.emissiveIntensity,
            opacity: mat.opacity,
            transparent: mat.transparent,
          });
        }
      });
    }
  });
  
  return Array.from(materials.values());
}

export function Model({ url, autoRotate = false, onError }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  
  // 使用 SkeletonUtils.clone 正确克隆带骨骼的模型
  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);
  
  // 使用 useAnimations 绑定到克隆的场景
  const { actions, mixer } = useAnimations(animations, clonedScene);
  
  const { 
    animationPlaying, 
    animationSpeed,
    setAnimationClips,
    setAnimationPlaying,
    selectedAnimationClip,
    setMaterials,
    materialOverrides,
    setSelectedMaterial,
  } = useStore();
  
  // 提取并存储材质信息
  useEffect(() => {
    if (clonedScene) {
      const mats = extractMaterials(clonedScene);
      setMaterials(mats);
      // 默认选中第一个材质
      if (mats.length > 0) {
        setSelectedMaterial(mats[0].uuid);
      }
    }
    return () => {
      setMaterials([]);
      setSelectedMaterial(null);
    };
  }, [clonedScene, setMaterials, setSelectedMaterial]);
  
  // 应用材质覆盖
  useEffect(() => {
    if (!clonedScene) return;
    
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            const override = materialOverrides[mat.uuid];
            if (override) {
              if (override.color !== undefined) {
                mat.color.set(override.color);
              }
              if (override.metalness !== undefined) {
                mat.metalness = override.metalness;
              }
              if (override.roughness !== undefined) {
                mat.roughness = override.roughness;
              }
              if (override.emissive !== undefined) {
                mat.emissive.set(override.emissive);
              }
              if (override.emissiveIntensity !== undefined) {
                mat.emissiveIntensity = override.emissiveIntensity;
              }
              if (override.opacity !== undefined) {
                mat.opacity = override.opacity;
              }
              if (override.transparent !== undefined) {
                mat.transparent = override.transparent;
              }
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  }, [clonedScene, materialOverrides]);
  
  // 计算缩放和居中（应用到 group 而不是 clone）
  useEffect(() => {
    if (!clonedScene || !groupRef.current) return;
    
    // 先重置 group 的变换
    groupRef.current.scale.setScalar(1);
    groupRef.current.position.set(0, 0, 0);
    
    // 计算包围盒
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    console.log('Model size:', size.x, size.y, size.z);
    console.log('Model center:', center.x, center.y, center.z);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      // 缩放到合适大小（最大维度 = 2）
      const scale = 2 / maxDim;
      groupRef.current.scale.setScalar(scale);
      
      // 居中（将模型中心移到原点）
      // 注意：position 需要考虑缩放
      groupRef.current.position.x = -center.x * scale;
      groupRef.current.position.y = -center.y * scale;
      groupRef.current.position.z = -center.z * scale;
      
      console.log('Applied scale:', scale);
    }
  }, [clonedScene]);
  
  // 自动旋转 + 更新动画混合器
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    // 关键：手动更新动画混合器
    if (mixer) {
      mixer.update(delta);
    }
  });
  
  // 更新可用的动画列表
  useEffect(() => {
    if (animations && animations.length > 0) {
      const clipNames = animations.map(clip => clip.name || `Animation ${animations.indexOf(clip)}`);
      setAnimationClips(clipNames);
      console.log('Available animations:', clipNames);
      console.log('Actions:', Object.keys(actions));
    } else {
      setAnimationClips([]);
      console.log('No animations found in model');
    }
  }, [animations, actions, setAnimationClips]);
  
  // 自动播放第一个动画
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.log('No actions available');
      return;
    }
    
    const actionNames = Object.keys(actions);
    const firstActionName = actionNames[0];
    const firstAction = actions[firstActionName];
    
    if (firstAction) {
      console.log('Auto-playing animation:', firstActionName);
      firstAction.reset();
      firstAction.setLoop(THREE.LoopRepeat, Infinity);
      firstAction.clampWhenFinished = false;
      firstAction.play();
      setAnimationPlaying(true);
    }
  }, [actions, setAnimationPlaying]);
  
  // 播放/暂停控制
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    
    const actionNames = Object.keys(actions);
    const clipName = selectedAnimationClip || actionNames[0];
    const action = actions[clipName];
    
    if (!action) {
      console.log('Action not found:', clipName);
      return;
    }
    
    if (animationPlaying) {
      // 停止其他动画
      actionNames.forEach(name => {
        if (name !== clipName && actions[name]) {
          actions[name]?.stop();
        }
      });
      
      // 播放选中的动画
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();
      console.log('Playing animation:', clipName, 'isRunning:', action.isRunning());
    } else {
      // 暂停当前动画
      action.paused = true;
      console.log('Paused animation:', clipName);
    }
  }, [actions, animationPlaying, selectedAnimationClip]);
  
  // 更新动画速度
  useEffect(() => {
    if (mixer) {
      mixer.timeScale = animationSpeed;
    }
  }, [mixer, animationSpeed]);
  
  // 错误处理
  useEffect(() => {
    if (!scene) {
      onError?.('Failed to load model');
    }
  }, [scene, onError]);
  
  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// 预加载模型
export function preloadModel(url: string) {
  useGLTF.preload(url);
}
