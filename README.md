# Meshy Demo - 3D 模型生成与动画工作台

这是一个基于 React + Three.js 的 3D 模型生成工作台，包括 Text-to-3D 生成和角色动画系统。

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5174

## 技术栈

- **前端框架**: React 19 + TypeScript
- **3D 渲染**: React Three Fiber + Drei
- **状态管理**: Zustand
- **路由**: React Router v6
- **构建工具**: Vite (Rolldown)
- **样式**: CSS Modules

## 核心功能

### Tab 1: Text-to-3D 

#### 三栏布局
- **左侧**: 参数面板（Prompt、AI 模型、艺术风格等）
- **中间**: 3D 预览区（Canvas + 轨道控制）
- **右侧**: 资产列表（历史生成记录）

#### AI 生成流程
- 文本生成 3D 模型（Preview）
- 细化纹理（Refine）
- 实时进度反馈
- 轮询任务状态

#### 支持的参数
- **AI 模型版本**: Meshy 6 (latest) / Meshy 5 / Meshy 4
- **艺术风格**: 写实 / 雕塑
- **拓扑结构**: 三角形 / 四边形
- **目标面数**: 100 - 300,000（滑块调节）
- **对称模式**: 自动 / 开启 / 关闭
- **姿势模式**: 无 / A-Pose / T-Pose（便于后续动画绑定）
- **PBR 贴图**: 金属度、粗糙度、法线贴图
- **纹理提示词**: 额外的纹理描述

### Tab 2: 角色动画

#### 三栏布局
- **左侧**: 动画库（40+ 预设动画，分类筛选）
- **中间**: 3D 预览区（实时动画播放）
- **右侧**: 动画控制面板

#### 动画工作流
1. **角色绑定 (Rigging)**
   - 选择已生成的人形模型
   - 设置角色身高（0.5m - 3m）
   - 自动骨骼绑定
   - 生成基础动画

2. **应用动画 (Animation)**
   - 从动画库选择动画
   - 设置帧率（24/25/30/60 FPS）
   - 应用到已绑定的角色
   - 实时预览效果

#### 动画播放器
- **播放控制**: 播放 / 暂停 / 重播
- **速度控制**: 0.1x - 3x（滑块 + 预设按钮）
- **动画切换**: 支持多个动画片段切换
- **状态显示**: 实时显示播放状态和动画信息

#### 动画库分类
- **Walking**: 步行动作（休闲步行、战斗步行等）
- **Running**: 跑步动作（快跑、跳跃跑、方向跑等）
- **Dancing**: 舞蹈动作（搞笑舞蹈系列）
- **Acting**: 表演动作（技能动作、手势、情绪表达等）
- **Idle**: 待机动作（警觉、坐姿、打盹等）
- **Interacting**: 互动动作（挥手、鞠躬、讨论等）
- **Fighting**: 战斗动作（攻击、被击、死亡等）

### 3D 场景功能
- 模型加载与显示
- 轨道控制（旋转、缩放、平移）
- 自动居中和缩放
- 环境光照
- **动画播放**: 使用 Three.js AnimationMixer
- **动画混合**: 支持多个动画片段

## 🔧 配置说明

### API 配置

项目默认使用**测试模式**，不消耗积分：

```typescript
// 测试 API Key
const TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';
```

如需使用真实 API：
1. 在 Text-to-3D 页面取消勾选"使用测试模式"
2. 输入你的 Meshy API Key（格式：`msy_...`）
3. API Key 会自动应用到所有功能（Text-to-3D、Rigging、Animation）

⚠️ : 角色动画功能需要真实 API Key，测试模式下的任务 ID 无法用于 Rigging/Animation API。

### CORS 代理配置

开发环境使用 Vite 代理解决 CORS 问题：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/meshy': {
        target: 'https://api.meshy.ai',
        changeOrigin: true,
      },
      '/assets/meshy': {
        target: 'https://assets.meshy.ai',
        changeOrigin: true,
      },
    },
  },
});
```

## ⚠️ 已知问题与解决方案

### 1. CORS 错误
**问题**: 浏览器阻止跨域请求

**解决方案**:
- ✅ 开发环境：使用 Vite 代理（已配置）
- ✅ 生产环境：需要配置服务器端代理或使用 CORS 代理服务

### 2. 模型加载失败
**可能原因**:
- 网络连接问题
- API 返回的 URL 无效
- 模型文件格式不支持

**解决方案**:
- 检查浏览器控制台错误信息
- 确认 API 返回的 `model_urls.glb` 有效
- 点击"重试"按钮重新加载


### 3. 动画不播放
**可能原因**:
- GLB 文件中没有动画数据
- 模型未正确绑定骨骼

**解决方案**:
- 确保使用 Rigging API 绑定的模型
- 检查动画播放器是否显示"当前模型没有动画"
- 查看控制台日志确认动画片段加载情况

##  项目结构

```
src/
├── api/
│   ├── meshyClient.ts          # Text-to-3D API
│   ├── riggingClient.ts        # Rigging API
│   ├── animationClient.ts      # Animation API
│   └── apiManager.ts           # 统一 API Key 管理
├── components/
│   ├── AssetList/              # 资产列表
│   ├── Canvas3D/               # 3D 场景
│   │   ├── Scene.tsx
│   │   ├── Model.tsx           # 支持动画播放
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── ParameterPanel/         # Text-to-3D 参数面板
│   ├── AnimationLibrary/       # 动画库浏览器
│   ├── AnimationPanel/         # 动画控制面板
│   └── AnimationPlayer/        # 动画播放器
├── pages/
│   ├── Workspace.tsx           # Text-to-3D 工作台
│   └── AnimationWorkspace.tsx  # 动画工作台
├── stores/
│   └── useStore.ts             # 全局状态管理
├── data/
│   └── animationLibrary.ts     # 动画库数据
├── types/
│   └── index.ts                # TypeScript 类型
└── App.tsx                     # 路由配置
```

## API 端点

### Text-to-3D API
- `POST /openapi/v2/text-to-3d` - 创建预览/细化任务
- `GET /openapi/v2/text-to-3d/:id` - 获取任务状态

### Rigging API
- `POST /openapi/v1/rigging` - 创建绑定任务
- `GET /openapi/v1/rigging/:id` - 获取绑定任务状态

### Animation API
- `POST /openapi/v1/animations` - 创建动画任务
- `GET /openapi/v1/animations/:id` - 获取动画任务状态

详见 `model_api.md`


## 📝 开发计划

- [x] Text-to-3D 生成（Preview + Refine）
- [x] 增强参数面板（AI 模型、拓扑、面数等）
- [x] 角色绑定 API 集成
- [x] 动画应用 API 集成
- [x] 动画播放器（播放/暂停/速度控制）
- [ ] Retexture（重新纹理）功能
- [ ] Remesh（重建网格）功能
- [ ] 模型导出功能
- [ ] 优化加载性能（LOD、缓存）
- [ ] 添加单元测试
- [x] 部署到 Vercel


## 🙏 致谢

- [Meshy.ai](https://www.meshy.ai/) - 灵感来源
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D 渲染
- [Drei](https://github.com/pmndrs/drei) - Three.js 辅助库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [React Router](https://reactrouter.com/) - 路由管理
