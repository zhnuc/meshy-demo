// 生成任务状态
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';

// 生成状态
export type GenerationStatus = 'idle' | 'preview-loading' | 'preview-success' | 'refine-loading' | 'refine-success' | 'error';

// 艺术风格
export type ArtStyle = 'realistic' | 'sculpture';

// AI 模型版本
export type AIModel = 'meshy-4' | 'meshy-5' | 'latest';

// 拓扑结构
export type Topology = 'quad' | 'triangle';

// 对称模式
export type SymmetryMode = 'off' | 'auto' | 'on';

// 姿势模式
export type PoseMode = '' | 'a-pose' | 't-pose';

// 模型 URL
export interface ModelUrls {
  glb: string;
  fbx?: string;
  usdz?: string;
  obj?: string;
}

// 任务数据
export interface TaskData {
  id: string;
  status: TaskStatus;
  progress: number;
  model_urls?: ModelUrls;
  thumbnail_url?: string;
  created_at?: number;
  finished_at?: number;
}

// 预览生成参数
export interface GenerateParams {
  prompt: string;
  negative_prompt?: string;
  art_style?: ArtStyle;
  ai_model?: AIModel;
  topology?: Topology;
  target_polycount?: number;
  should_remesh?: boolean;
  symmetry_mode?: SymmetryMode;
  pose_mode?: PoseMode;
}

// 细化生成参数
export interface RefineParams {
  preview_task_id: string;
  enable_pbr?: boolean;
  texture_prompt?: string;
  ai_model?: AIModel;
}

// 资产项
export interface AssetItem {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  artStyle: ArtStyle;
  aiModel?: AIModel;
  isPreview: boolean;
}

// 生成状态
export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  taskId: string | null;
  modelUrl: string | null;
  error: string | null;
}

// 材质信息
export interface MaterialInfo {
  uuid: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  transparent: boolean;
}

// 材质覆盖（用于编辑）
export interface MaterialOverride {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
}
