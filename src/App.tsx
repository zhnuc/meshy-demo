import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { AnimationWorkspace } from './pages/AnimationWorkspace';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* 顶部导航栏 */}
        <nav className="app-nav">
          <div className="nav-brand">
            <span className="brand-icon"></span>
            <span className="brand-text">Meshy Demo</span>
          </div>
          <div className="nav-tabs">
            <NavLink to="/workspace" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
              <span className="tab-icon"></span>
              <span className="tab-text">Text to 3D</span>
            </NavLink>
            <NavLink to="/animation" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
              <span className="tab-icon"></span>
              <span className="tab-text">角色动画</span>
            </NavLink>
          </div>
          <div className="nav-info">
            <span className="test-badge">zhnuc</span>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/workspace" replace />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/animation" element={<AnimationWorkspace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
