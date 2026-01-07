# 故障排查指南

## 🐛 常见问题

### 1. CORS 错误：`Access-Control-Allow-Origin`

**错误信息**:
```
Access to fetch at 'https://assets.meshy.ai/...' from origin 'http://localhost:5174' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**原因**: 浏览器安全策略阻止跨域请求

**解决方案**:

#### 方案 A: 使用 Vite 代理（推荐）
已在 `vite.config.ts` 中配置：
```typescript
server: {
  proxy: {
    '/api/meshy': {
      target: 'https://api.meshy.ai',
      changeOrigin: true,
    },
  },
}
```

确保重启开发服务器：
```bash
npm run dev
```

#### 方案 B: 使用浏览器扩展
安装 [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock) 扩展（仅开发环境）

#### 方案 C: 使用公共 CORS 代理
修改 `meshyClient.ts`：
```typescript
const corsProxy = 'https://corsproxy.io/?';
const proxiedUrl = corsProxy + encodeURIComponent(originalUrl);
```

---

### 2. 模型加载失败：`Failed to load model`

**错误信息**:
```
Failed to load model: Promise
```

**可能原因**:
1. 模型 URL 无效或过期
2. 网络连接问题
3. GLB 文件损坏

**解决方案**:

#### 检查 URL 有效性
打开浏览器控制台，查看实际请求的 URL：
```javascript
console.log('Model URL:', currentModelUrl);
```

#### 手动测试 URL
在浏览器新标签页中直接访问模型 URL，看是否能下载。

#### 清除缓存
```bash
# 清除 node_modules 缓存
rm -rf node_modules/.vite

# 重启开发服务器
npm run dev
```

---

### 3. 测试模式返回固定结果

**现象**: 无论输入什么 Prompt，都返回相同的模型

**原因**: 使用了测试 API Key

**解决方案**:
1. 取消勾选"使用测试模式"
2. 输入真实的 Meshy API Key
3. 重新生成

---

### 4. API 请求失败：`401 Unauthorized`

**错误信息**:
```
Failed to create preview task: Unauthorized
```

**原因**: API Key 无效或过期

**解决方案**:
1. 检查 API Key 格式（应为 `msy_...`）
2. 前往 [Meshy Dashboard](https://www.meshy.ai/settings/api) 获取新的 API Key
3. 确认账户有足够的积分

---

### 5. 生成进度卡在某个百分比

**现象**: 进度条停在 50% 或其他位置不动

**可能原因**:
1. 网络连接中断
2. API 服务器繁忙
3. 轮询间隔过长

**解决方案**:

#### 检查网络连接
打开浏览器开发者工具 → Network 标签，查看是否有失败的请求。

#### 调整轮询间隔
修改 `meshyClient.ts`：
```typescript
async pollTaskStatus(
  taskId: string,
  onProgress?: (progress: number, status: string) => void,
  interval = 2000  // 从 3000 改为 2000（2秒）
)
```

#### 手动刷新
点击浏览器刷新按钮，或按 `Ctrl+R`（Windows）/ `Cmd+R`（Mac）。

---

### 6. 3D 场景黑屏或白屏

**现象**: Canvas 区域没有显示任何内容

**可能原因**:
1. WebGL 不支持
2. 显卡驱动问题
3. 浏览器硬件加速未开启

**解决方案**:

#### 检查 WebGL 支持
访问 https://get.webgl.org/ 测试浏览器是否支持 WebGL。

#### 启用硬件加速
Chrome: `设置` → `系统` → 启用"使用硬件加速"

#### 更新显卡驱动
访问显卡厂商官网下载最新驱动。

---

### 7. 模型显示不完整或变形

**现象**: 模型只显示一部分，或者比例失调

**原因**: 包围盒计算错误

**解决方案**:

修改 `Model.tsx` 中的缩放逻辑：
```typescript
// 调整缩放因子
const scale = 3 / maxDim;  // 从 2 改为 3
```

或者禁用自动缩放：
```typescript
// 注释掉缩放代码
// modelClone.scale.setScalar(scale);
```

---

### 8. 内存泄漏或性能下降

**现象**: 长时间使用后浏览器变慢或崩溃

**原因**: 模型未正确释放

**解决方案**:

#### 清理旧模型
在 `Model.tsx` 的 `useEffect` 中添加清理逻辑：
```typescript
useEffect(() => {
  return () => {
    // 清理资源
    if (groupRef.current) {
      groupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    }
  };
}, []);
```

#### 限制资产列表数量
修改 `useStore.ts`：
```typescript
addAsset: (asset) => 
  set((state) => ({ 
    assets: [asset, ...state.assets].slice(0, 20)  // 只保留最新 20 个
  })),
```

---

## 🔍 调试工具

### 1. React DevTools
安装 [React Developer Tools](https://react.dev/learn/react-developer-tools) 查看组件状态。

### 2. Three.js Inspector
在控制台输入：
```javascript
console.log(window.__THREE__);
```

### 3. 网络监控
```javascript
// 监控所有 fetch 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return originalFetch.apply(this, args);
};
```

---

## 📞 获取帮助

如果以上方案都无法解决问题：

1. **查看控制台错误**: 按 F12 打开开发者工具，查看 Console 标签
2. **检查 Network 请求**: 查看 Network 标签，筛选失败的请求
3. **查看 GitHub Issues**: 搜索类似问题
4. **联系支持**: 发送邮件到 support@meshy.ai

---

## 🛠️ 开发环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
- 支持 WebGL 2.0 的显卡

---

## 📝 报告 Bug

提交 Issue 时请包含：
1. 错误信息（完整的控制台输出）
2. 复现步骤
3. 浏览器版本和操作系统
4. 截图或录屏
