import { useState } from 'react';
import { animationLibrary, animationCategories, type AnimationCategory } from '../../data/animationLibrary';
import './AnimationLibrary.css';

interface AnimationLibraryProps {
  selectedAnimationId: number | null;
  onSelectAnimation: (id: number) => void;
}

export function AnimationLibrary({ selectedAnimationId, onSelectAnimation }: AnimationLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnimations = animationLibrary.filter(anim => {
    const matchesCategory = selectedCategory === 'All' || anim.category === selectedCategory;
    const matchesSearch = anim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anim.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animation-library">
      <div className="animation-library-header">
        <h2>动画库</h2>
        <p className="subtitle">{animationLibrary.length} 个动画可用</p>
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索动画..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 分类筛选 */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          全部
        </button>
        {animationCategories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 动画列表 */}
      <div className="animation-list">
        {filteredAnimations.length === 0 ? (
          <div className="empty-state">
            <p>未找到匹配的动画</p>
          </div>
        ) : (
          filteredAnimations.map(anim => (
            <div
              key={anim.id}
              className={`animation-card ${selectedAnimationId === anim.id ? 'selected' : ''}`}
              onClick={() => onSelectAnimation(anim.id)}
            >
              <div className="animation-thumbnail">
                <div className="animation-icon">🎭</div>
              </div>
              <div className="animation-info">
                <h3 className="animation-name">{anim.name}</h3>
                <p className="animation-description">{anim.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
