import type { TaskData } from '../types';

const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? '/api/meshy/openapi/v1/rigging' 
  : 'https://api.meshy.ai/openapi/v1/rigging';

const TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';

export interface RiggingParams {
  input_task_id?: string;
  model_url?: string;
  height_meters?: number;
  texture_image_url?: string;
}

export interface RiggingResult {
  rigged_character_fbx_url: string;
  rigged_character_glb_url: string;
  basic_animations?: {
    walking_glb_url: string;
    walking_fbx_url: string;
    walking_armature_glb_url: string;
    running_glb_url: string;
    running_fbx_url: string;
    running_armature_glb_url: string;
  };
}

export interface RiggingTaskData extends TaskData {
  type: 'rig';
  result?: RiggingResult;
}

class RiggingClient {
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
    if (url.startsWith('https://assets.meshy.ai')) {
      return url.replace('https://assets.meshy.ai', '/assets/meshy');
    }
    return url;
  }
  
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async createRiggingTask(params: RiggingParams): Promise<string> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create rigging task');
    }
    
    const data = await response.json();
    return data.result;
  }
  
  async getRiggingTask(taskId: string): Promise<RiggingTaskData> {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get rigging task');
    }
    
    const data = await response.json();
    
    // Process asset URLs
    if (data.result) {
      if (data.result.rigged_character_fbx_url) {
        data.result.rigged_character_fbx_url = this.processAssetUrl(data.result.rigged_character_fbx_url);
      }
      if (data.result.rigged_character_glb_url) {
        data.result.rigged_character_glb_url = this.processAssetUrl(data.result.rigged_character_glb_url);
      }
      if (data.result.basic_animations) {
        Object.keys(data.result.basic_animations).forEach((key) => {
          data.result.basic_animations[key] = this.processAssetUrl(data.result.basic_animations[key]);
        });
      }
    }
    
    return data;
  }
  
  async pollRiggingTask(
    taskId: string,
    onProgress?: (progress: number, status: string) => void,
    interval = 3000
  ): Promise<RiggingTaskData> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const taskData = await this.getRiggingTask(taskId);
          
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

export const riggingClient = new RiggingClient();
export default RiggingClient;
