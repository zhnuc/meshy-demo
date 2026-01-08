import { create } from 'zustand';
import type { GenerationState, AssetItem, ArtStyle, AIModel, Topology, SymmetryMode, PoseMode, MaterialInfo, MaterialOverride } from '../types';

interface AppState {
  // API 设置
  apiKey: string;
  useTestMode: boolean;
  
  // 生成参数
  prompt: string;
  negativePrompt: string;
  artStyle: ArtStyle;
  aiModel: AIModel;
  topology: Topology;
  targetPolycount: number;
  shouldRemesh: boolean;
  symmetryMode: SymmetryMode;
  poseMode: PoseMode;
  enablePbr: boolean;
  texturePrompt: string;
  
  // 生成状态
  generation: GenerationState;
  
  // 资产列表
  assets: AssetItem[];
  
  // 当前选中的模型
  selectedAssetId: string | null;
  currentModelUrl: string | null;
  
  // 动画控制
  animationPlaying: boolean;
  animationSpeed: number;
  animationClips: string[];
  selectedAnimationClip: string | null;
  
  // 材质编辑
  materials: MaterialInfo[];
  selectedMaterialId: string | null;
  materialOverrides: Record<string, MaterialOverride>;
  
  // Actions
  setApiKey: (apiKey: string) => void;
  setUseTestMode: (useTestMode: boolean) => void;
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (negativePrompt: string) => void;
  setArtStyle: (artStyle: ArtStyle) => void;
  setAiModel: (aiModel: AIModel) => void;
  setTopology: (topology: Topology) => void;
  setTargetPolycount: (count: number) => void;
  setShouldRemesh: (shouldRemesh: boolean) => void;
  setSymmetryMode: (mode: SymmetryMode) => void;
  setPoseMode: (mode: PoseMode) => void;
  setEnablePbr: (enable: boolean) => void;
  setTexturePrompt: (prompt: string) => void;
  
  setGeneration: (generation: Partial<GenerationState>) => void;
  resetGeneration: () => void;
  
  addAsset: (asset: AssetItem) => void;
  updateAsset: (id: string, updates: Partial<AssetItem>) => void;
  removeAsset: (id: string) => void;
  
  setSelectedAsset: (id: string | null) => void;
  setCurrentModelUrl: (url: string | null) => void;
  
  // 动画控制 Actions
  setAnimationPlaying: (playing: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationClips: (clips: string[]) => void;
  setSelectedAnimationClip: (clip: string | null) => void;
  
  // 材质编辑 Actions
  setMaterials: (materials: MaterialInfo[]) => void;
  setSelectedMaterial: (id: string | null) => void;
  updateMaterialOverride: (id: string, override: MaterialOverride) => void;
  resetMaterialOverride: (id: string) => void;
  resetAllMaterialOverrides: () => void;
}

const initialGeneration: GenerationState = {
  status: 'idle',
  progress: 0,
  taskId: null,
  modelUrl: null,
  error: null,
};

export const useStore = create<AppState>((set) => ({
  // 初始状态
  apiKey: '',
  useTestMode: true,
  prompt: '',
  negativePrompt: 'low quality, low resolution, low poly, ugly',
  artStyle: 'realistic',
  aiModel: 'latest',
  topology: 'triangle',
  targetPolycount: 30000,
  shouldRemesh: true,
  symmetryMode: 'auto',
  poseMode: '',
  enablePbr: false,
  texturePrompt: '',
  
  generation: initialGeneration,
  
  assets: [],
  
  selectedAssetId: null,
  currentModelUrl: null,
  
  // 动画控制初始状态
  animationPlaying: false,
  animationSpeed: 1,
  animationClips: [],
  selectedAnimationClip: null,
  
  // 材质编辑初始状态
  materials: [],
  selectedMaterialId: null,
  materialOverrides: {},
  
  // Actions
  setApiKey: (apiKey) => set({ apiKey }),
  setUseTestMode: (useTestMode) => set({ useTestMode }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setArtStyle: (artStyle) => set({ artStyle }),
  setAiModel: (aiModel) => set({ aiModel }),
  setTopology: (topology) => set({ topology }),
  setTargetPolycount: (targetPolycount) => set({ targetPolycount }),
  setShouldRemesh: (shouldRemesh) => set({ shouldRemesh }),
  setSymmetryMode: (symmetryMode) => set({ symmetryMode }),
  setPoseMode: (poseMode) => set({ poseMode }),
  setEnablePbr: (enablePbr) => set({ enablePbr }),
  setTexturePrompt: (texturePrompt) => set({ texturePrompt }),
  
  setGeneration: (generation) => 
    set((state) => ({ 
      generation: { ...state.generation, ...generation } 
    })),
  
  resetGeneration: () => set({ generation: initialGeneration }),
  
  addAsset: (asset) => 
    set((state) => ({ 
      assets: [asset, ...state.assets] 
    })),
  
  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    })),
  
  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
    })),
  
  setSelectedAsset: (id) => set({ selectedAssetId: id }),
  setCurrentModelUrl: (url) => set({ currentModelUrl: url }),
  
  // 动画控制 Actions
  setAnimationPlaying: (animationPlaying) => set({ animationPlaying }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setAnimationClips: (animationClips) => set({ animationClips }),
  setSelectedAnimationClip: (selectedAnimationClip) => set({ selectedAnimationClip }),
  
  // 材质编辑 Actions
  setMaterials: (materials) => set({ materials }),
  setSelectedMaterial: (selectedMaterialId) => set({ selectedMaterialId }),
  updateMaterialOverride: (id, override) => 
    set((state) => ({
      materialOverrides: {
        ...state.materialOverrides,
        [id]: { ...state.materialOverrides[id], ...override }
      }
    })),
  resetMaterialOverride: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.materialOverrides;
      return { materialOverrides: rest };
    }),
  resetAllMaterialOverrides: () => set({ materialOverrides: {} }),
}));
