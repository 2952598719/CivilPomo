# CivilPomo 设计文档

## 概述

CivilPomo 是一个番茄钟游戏化应用。核心玩法：完成番茄钟来推进科技树节点，从原始时代逐步发展到高级文明。每次番茄完成时，AI 生成沉浸式叙事反馈，描述当前节点上正在发生的事情。

## 技术栈

- **前端框架**: Next.js + React + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **数据存储**: JSON 文件 + localStorage
- **AI**: Claude API（叙事生成）
- **未来拓展**: Tauri/Electron 桌面应用

## 核心玩法

### 番茄钟参数

- 工作时长：25 分钟（可配置，方便调试）
- 短休息：5 分钟
- 长休息：15 分钟（每 4 个番茄后）
- 时长通过设置页面调整

### 游戏循环

```
选择节点 → 启动番茄钟 → 专注 → 番茄完成
    ↓
AI 生成叙事弹窗 → 进度更新 → 休息
    ↓
继续当前节点 / 切换节点
    ↓
节点完成 → 解锁新节点 → 检查时代完成
    ↓
时代完成 → 进入新时代
```

### 节点选择

- 一次只研究一个节点
- 可选节点 = 当前时代内，所有 prerequisites 已完成的节点
- 可随时切换到其他可选节点，进度保留
- 时代自动推进：当前时代所有节点完成后进入下一个时代

## 数据模型

### 科技树结构（静态 JSON）

```typescript
interface TechTree {
  id: string;           // e.g. "civ-classic"
  name: string;         // e.g. "文明科技树"
  eras: Era[];
}

interface Era {
  id: string;           // e.g. "ancient"
  name: string;         // e.g. "原始时代"
  nodes: TechNode[];
}

interface TechNode {
  id: string;           // e.g. "wheel"
  name: string;         // e.g. "轮子"
  description: string;  // 节点描述，作为叙事上下文
  pomodorosRequired: number;  // 所需番茄数
  prerequisites: string[];    // 依赖节点 id，空 = 无前置
  category: "technology" | "humanities";
}
```

### 用户进度（localStorage）

```typescript
interface UserProgress {
  currentNodeId: string | null;
  completedPomodoros: number;   // 当前节点已完成番茄数
  completedNodes: string[];
  currentEraIndex: number;
  totalPomodoros: number;       // 历史总番茄数
  timerSettings: TimerSettings;
}

interface TimerSettings {
  workMinutes: number;    // 默认 25
  shortBreakMinutes: number;  // 默认 5
  longBreakMinutes: number;   // 默认 15
}
```

### 叙事记录（localStorage）

```typescript
// key: nodeId, value: 该节点每个番茄的叙事数组
type NarrativeRecords = Record<string, string[]>;
```

### 数据来源

| 场景 | 科技树来源 |
|------|-----------|
| 默认文明模式 | 内置预设 JSON（手动打磨） |
| 未来架空世界 | AI 动态生成（用户指定主题） |

## AI 集成

### 调用时机

唯一调用时机：每次番茄完成时，调用 Claude API 生成叙事文本。

### 叙事 Prompt

```
你是一个沉浸式叙事生成器。

当前节点：{node.name}
节点描述：{node.description}
进度：第 {current} / 共 {total} 个番茄
前置节点：{prerequisites descriptions}

请用第二人称（"你"）描述当前正在发生的事情。
要求：
- 描述具体发生的事件或场景，不要历史总结
- 不要出现"萌芽""发展""进步"这类抽象词汇
- 画面感强，像在描述一个场景
- 50-100 字
```

### 设计要点

- 叙事是沉浸式的：描述正在发生的事，不是回顾历史
- 同一节点每个番茄的叙事不同（推进故事）
- 已完成节点的叙事存入 localStorage，供 chronicle 页面回顾
- 进行中节点的中间叙事不持久化，每次实时生成

### API 密钥

开发阶段通过 `.env.local` 环境变量配置。

## 页面结构

### 路由

```
/              → 番茄钟主页面
/tree          → 科技树可视化
/chronicle     → 历史叙事回顾
/settings      → 时间配置
```

### 页面说明

1. **主页面（/）** — 番茄钟计时器 + 当前节点信息 + 进度显示
2. **科技树视图（/tree）** — 可视化整棵树，查看各节点状态（可选/进行中/已完成）
3. **历史记录（/chronicle）** — 已完成节点的叙事回顾
4. **设置（/settings）** — 番茄时长配置（调试用）

## 状态管理

使用 Zustand，拆为两个 store：

- **`timerStore`** — 计时器状态（running/paused/break/剩余时间/当前阶段）
- **`gameStore`** — 游戏状态（当前节点、进度、已完成节点、当前时代、时代检查逻辑）

## 可视化方案

科技树可视化（/tree 页面）的具体技术方案（Canvas vs SVG vs CSS 布局）在实现阶段确定。

## 未来拓展

- **其他树状结构**: 生物演化树、架空魔法世界科技树（AI 动态生成）
- **桌面应用**: 通过 Tauri 或 Electron 封装
- **多文明人文分支**: 人文节点根据文明选择呈现不同形态
