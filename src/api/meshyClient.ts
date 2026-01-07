import type { GenerateParams, RefineParams, TaskData } from '../types';

// 始终使用代理以避免 CORS 问题
const API_BASE_URL = '/api/meshy/openapi/v2/text-to-3d';

// 测试模式 API Key（不消耗积分）
const TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';

class MeshyClient {
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
  
  // 处理资产 URL（使用 serverless 代理以避免 CORS 问题）
  private processAssetUrl(url: string): string {
    if (url.startsWith('https://assets.meshy.ai')) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }
  
  // 设置 API Key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // 是否使用测试模式
  isTestMode() {
    return this.apiKey === TEST_API_KEY;
  }
  
  // 创建预览任务
  async createPreviewTask(params: GenerateParams): Promise<string> {
    const payload: Record<string, unknown> = {
      mode: 'preview',
      prompt: params.prompt,
      negative_prompt: params.negative_prompt || 'low quality, low resolution, low poly, ugly',
      art_style: params.art_style || 'realistic',
      should_remesh: params.should_remesh ?? true,
    };
    
    // 添加可选参数
    if (params.ai_model) {
      payload.ai_model = params.ai_model;
    }
    if (params.topology) {
      payload.topology = params.topology;
    }
    if (params.target_polycount !== undefined) {
      payload.target_polycount = params.target_polycount;
    }
    if (params.symmetry_mode) {
      payload.symmetry_mode = params.symmetry_mode;
    }
    if (params.pose_mode !== undefined) {
      payload.pose_mode = params.pose_mode;
    }
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create preview task');
    }
    
    const data = await response.json();
    return data.result; // 返回 task_id
  }
  
  // 创建细化任务
  async createRefineTask(params: RefineParams): Promise<string> {
    const payload: Record<string, unknown> = {
      mode: 'refine',
      preview_task_id: params.preview_task_id,
    };
    
    // 添加可选参数
    if (params.enable_pbr !== undefined) {
      payload.enable_pbr = params.enable_pbr;
    }
    if (params.texture_prompt) {
      payload.texture_prompt = params.texture_prompt;
    }
    if (params.ai_model) {
      payload.ai_model = params.ai_model;
    }
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create refine task');
    }
    
    const data = await response.json();
    return data.result;
  }
  
  // 获取任务状态
  async getTaskStatus(taskId: string): Promise<TaskData> {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage = 'Failed to get task status';
      try {
        const text = await response.text();
        if (text) {
          const error = JSON.parse(text);
          errorMessage = error.message || errorMessage;
        }
      } catch {
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // 安全解析响应
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    const data = JSON.parse(text);
    
    // 处理资产 URL
    if (data.model_urls) {
      Object.keys(data.model_urls).forEach((key) => {
        data.model_urls[key] = this.processAssetUrl(data.model_urls[key]);
      });
    }
    if (data.thumbnail_url) {
      data.thumbnail_url = this.processAssetUrl(data.thumbnail_url);
    }
    
    return data;
  }
  
  // 轮询任务状态
  async pollTaskStatus(
    taskId: string,
    onProgress?: (progress: number, status: string) => void,
    interval = 3000
  ): Promise<TaskData> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const taskData = await this.getTaskStatus(taskId);
          
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

// 导出单例
export const meshyClient = new MeshyClient();
export default MeshyClient;
