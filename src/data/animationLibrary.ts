// Animation library based on Meshy API - Real animation IDs

export interface AnimationAction {
  id: number;
  name: string;
  category: string;
  description: string;
  thumbnailUrl?: string;
}

export const animationCategories = [
  'Walking',
  'Running',
  'Dancing',
  'Acting',
  'Idle',
  'Interacting',
  'Fighting',
] as const;

export type AnimationCategory = typeof animationCategories[number];

// Real animation library from Meshy API
export const animationLibrary: AnimationAction[] = [
  // Walking
  { id: 1, name: 'Walking_Woman', category: 'Walking', description: '女性步行' },
  { id: 20, name: 'Walk_Fight_Back', category: 'Walking', description: '战斗后退步行' },
  { id: 21, name: 'Walk_Fight_Forward', category: 'Walking', description: '战斗前进步行' },
  { id: 30, name: 'Casual_Walk', category: 'Walking', description: '休闲步行' },
  
  // Running
  { id: 5, name: 'BackLeft_run', category: 'Running', description: '左后方跑步' },
  { id: 6, name: 'BackRight_Run', category: 'Running', description: '右后方跑步' },
  { id: 13, name: 'Jump_Run', category: 'Running', description: '跳跃跑步' },
  { id: 14, name: 'Run_02', category: 'Running', description: '跑步 02' },
  { id: 15, name: 'Run_03', category: 'Running', description: '跑步 03' },
  { id: 16, name: 'RunFast', category: 'Running', description: '快速跑步' },
  
  // Dancing
  { id: 22, name: 'FunnyDancing_01', category: 'Dancing', description: '搞笑舞蹈 1' },
  { id: 23, name: 'FunnyDancing_02', category: 'Dancing', description: '搞笑舞蹈 2' },
  { id: 24, name: 'FunnyDancing_03', category: 'Dancing', description: '搞笑舞蹈 3' },
  
  // Acting
  { id: 17, name: 'Skill_01', category: 'Acting', description: '技能动作 01' },
  { id: 18, name: 'Skill_02', category: 'Acting', description: '技能动作 02' },
  { id: 19, name: 'Skill_03', category: 'Acting', description: '技能动作 03' },
  { id: 27, name: 'Big_Heart_Gesture', category: 'Acting', description: '大爱心手势' },
  { id: 29, name: 'Call_Gesture', category: 'Acting', description: '打电话手势' },
  { id: 31, name: 'Catching_Breath', category: 'Acting', description: '喘气' },
  { id: 35, name: 'Clapping_Run', category: 'Acting', description: '边跑边鼓掌' },
  { id: 39, name: 'Excited_Walk_F', category: 'Acting', description: '兴奋步行 (女)' },
  { id: 40, name: 'Excited_Walk_M', category: 'Acting', description: '兴奋步行 (男)' },
  
  // Idle
  { id: 2, name: 'Alert', category: 'Idle', description: '警觉环顾' },
  { id: 3, name: 'Arise', category: 'Idle', description: '起身环顾' },
  { id: 11, name: 'Idle_02', category: 'Idle', description: '待机 02' },
  { id: 12, name: 'Idle_03', category: 'Idle', description: '待机 03' },
  { id: 32, name: 'Chair_Sit_Idle_F', category: 'Idle', description: '椅子坐姿待机 (女)' },
  { id: 33, name: 'Chair_Sit_Idle_M', category: 'Idle', description: '椅子坐姿待机 (男)' },
  { id: 36, name: 'Confused_Scratch', category: 'Idle', description: '困惑挠头' },
  { id: 38, name: 'Dozing_Elderly', category: 'Idle', description: '老人打盹' },
  
  // Interacting
  { id: 25, name: 'Agree_Gesture', category: 'Interacting', description: '同意手势' },
  { id: 26, name: 'Angry_Stomp', category: 'Interacting', description: '愤怒跺脚' },
  { id: 28, name: 'Big_Wave_Hello', category: 'Interacting', description: '大幅挥手打招呼' },
  { id: 34, name: 'Checkout_Gesture', category: 'Interacting', description: '结账手势' },
  { id: 37, name: 'Discuss_While_Moving', category: 'Interacting', description: '边走边讨论' },
  { id: 41, name: 'Formal_Bow', category: 'Interacting', description: '正式鞠躬' },
  
  // Fighting
  { id: 4, name: 'Attack', category: 'Fighting', description: '武器攻击' },
  { id: 7, name: 'BeHit_FlyUp', category: 'Fighting', description: '被击飞' },
  { id: 8, name: 'Dead', category: 'Fighting', description: '死亡' },
  { id: 9, name: 'ForwardLeft_Run_Fight', category: 'Fighting', description: '左前方战斗跑步' },
  { id: 10, name: 'ForwardRight_Run_Fight', category: 'Fighting', description: '右前方战斗跑步' },
];

export function getAnimationsByCategory(category: AnimationCategory): AnimationAction[] {
  return animationLibrary.filter(anim => anim.category === category);
}

export function getAnimationById(id: number): AnimationAction | undefined {
  return animationLibrary.find(anim => anim.id === id);
}
