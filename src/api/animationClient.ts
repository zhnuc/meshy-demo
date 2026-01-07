import type { TaskData } from '../types';

const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? '/api/meshy/openapi/v1/animations' 
  : 'https://api.meshy.ai/openapi/v1/animations';

const TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';

export interface AnimationParams {
  rig_task_id: string;
  action_id: number;
  post_process?: {
    operation_type: 'change_fps' | 'fbx2usdz' | 'extract_armature';
    fps?: 24 | 25 | 30 | 60;
  };
}

export interface AnimationResult {
  animation_glb_url: string;
  animation_fbx_url: string;
  processed_usdz_url?: string;
  processed_armature_fbx_url?: string;
  processed_animation_fps_fbx_url?: string;
}

export interface AnimationTaskData extends TaskData {
  type: 'animate';
  result?: AnimationResult;
}

class AnimationClient {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || TEST_API_KEY;
  }
  
  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }
  
  private processAssetUrl(url: string): string {
    if (isDev && url.startsWith('https://assets.meshy.ai')) {
      return url.replace('https://assets.meshy.ai', '/assets/meshy');
    }
    return url;
  }
  
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async createAnimationTask(params: AnimationParams): Promise<string> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create animation task');
    }
    
    const data = await response.json();
    return data.result;
  }
  
  async getAnimationTask(taskId: string): Promise<AnimationTaskData> {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get animation task');
    }
    
    const data = await response.json();
    
    // Process asset URLs
    if (data.result) {
      Object.keys(data.result).forEach((key) => {
        if (typeof data.result[key] === 'string' && data.result[key].startsWith('https://')) {
          data.result[key] = this.processAssetUrl(data.result[key]);
        }
      });
    }
    
    return data;
  }
  
  async pollAnimationTask(
    taskId: string,
    onProgress?: (progress: number, status: string) => void,
    interval = 3000
  ): Promise<AnimationTaskData> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const taskData = await this.getAnimationTask(taskId);
          
          onProgress?.(taskData.progress, taskData.status);
          
          if (taskData.status === 'SUCCEEDED') {
            resolve(taskData);
          } else if (taskData.status === 'FAILED' || taskData.status === 'EXPIRED') {
            reject(new Error(`Task ${taskData.status}`));
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

export const animationClient = new AnimationClient();
export default AnimationClient;
