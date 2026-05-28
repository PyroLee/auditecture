# Auditecture PRD v1

> 一个让音乐人在进 DAW 之前，先用视觉化方式画出歌曲结构的网页工具。
> 解决"白板瘫痪"——开着空 DAW 不知道从哪里下手。

**版本**:v1 (MVP)
**日期**:2026-05-28
**作者**:Kendrick Li (成美矢田寺)

---

## 1. 产品定位

### 1.1 一句话定义

Auditecture 是一个网页端歌曲结构草图工具,让音乐人在打开 DAW 之前,先用视觉化方式规划好歌曲的段落布局和轨道安排,然后导出为 MIDI 文件,直接作为 DAW 工程的骨架。

### 1.2 名字含义

Audio + Architecture——歌曲建筑学。强调"先有图纸,再施工"的工作流。

### 1.3 解决的核心问题

- **白板瘫痪 (Blank Canvas Paralysis)**:打开 DAW 看到空工程不知道从哪里开始
- **结构思考与音色制作的混杂**:在 DAW 里画结构,容易被音色细节带偏注意力
- **参考曲分析无载体**:听 reference track 时,脑子里有结构感但没有顺手的工具记下来

### 1.4 目标用户

- 主要:有 DAW 使用经验的电子音乐人,在制作前期需要规划歌曲结构
- 场景一:听参考曲学习——后台播放 reference,前台在 Auditecture 上画
- 场景二:原创构思——从零开始画一首歌的蓝图

### 1.5 不是什么 (Non-Goals)

- ❌ 不是 DAW,不做声音播放、合成、混音
- ❌ 不是 MIDI 编辑器,不编辑音符
- ❌ 不是音频分析工具,不自动识别 reference track 的结构
- ❌ MVP v1 不做导出,只做画板

---

## 2. MVP v1 范围

### 2.1 核心功能 (In Scope)

1. **段落轴 (Section Timeline)**:在画布顶部画歌曲段落
2. **轨道网格 (Track Grid)**:行=轨道,列=段落,格子=轨道在该段的存在状态
3. **本地持久化**:刷新页面不丢失项目
4. **全局 BPM 设置**:用于将来导出时计算 MIDI 时长

### 2.2 推迟到 v2 的功能 (Out of Scope for v1)

- 能量曲线 (Energy)
- 频率分布走向 (Low/Mid/High)
- 混响 / 空间感走向
- 和弦走向
- 顶部 TM/EM/CS 多维度折线图
- MIDI 导出
- 多项目管理
- 移动端适配
- 协作 / 云同步

---

## 3. 详细功能规格

### 3.1 横轴单位与全局设置

- **横轴单位**:小节 (Bars)
- **全局 BPM**:默认 128 BPM,用户可在顶部设置栏修改
- **每段最小长度**:1 bar
- **每段最大长度**:无硬限制,但 UI 上建议合理范围(通常 4-64 bars)

### 3.2 段落轴 (Section Timeline)

#### 数据结构
```typescript
interface Section {
  id: string;          // 唯一标识
  name: string;        // 段落名,如 "Intro" / "Verse" / "Drop"
  bars: number;        // 该段长度(小节数)
  color: string;       // 段落颜色(用于视觉区分)
  order: number;       // 顺序索引
}
```

#### 交互
- **添加段落**:段落轴末尾有 "+" 按钮,点击弹出"新段落"输入(默认 8 bars,默认名 "Section N")
- **删除段落**:每个段落 hover 时显示 "×" 按钮
- **重命名段落**:双击段落标题进入编辑模式
- **调整段落长度**:拖拽段落右边缘
- **调整段落顺序**:拖拽段落主体左右移动(drag-and-drop reorder)
- **段落预设**:右键段落弹出菜单,可快速改名为常见段落(Intro / Verse / Pre-Chorus / Chorus / Break / Build / Drop / Bridge / Outro)
- **颜色**:每个常见段落名对应一个默认颜色(如 Drop=红色系,Break=蓝色系),用户也可自定义

### 3.3 轨道网格 (Track Grid)

#### 数据结构
```typescript
interface Track {
  id: string;
  name: string;        // 如 "Kick" / "Bass" / "Lead Synth"
  order: number;
}

type CellState = "empty" | "active" | "fade-in" | "fade-out";

interface Cell {
  trackId: string;
  sectionId: string;
  state: CellState;
}
```

#### 交互
- **添加轨道**:左侧轨道列表底部有 "+ Add Track" 按钮
- **删除轨道**:轨道 hover 显示删除按钮,删除时弹确认框
- **重命名轨道**:双击轨道名
- **调整轨道顺序**:拖拽轨道左侧的拖拽柄(grip icon)
- **轨道预设**:新建项目时预设几个常见轨道(Kick / Bass / Lead / Pad / Vocal / FX),用户可删可改
- **格子点击**:循环切换状态
  - 第 1 次点击:empty → active
  - 第 2 次点击:active → fade-in
  - 第 3 次点击:fade-in → fade-out
  - 第 4 次点击:fade-out → empty
- **格子右键**:直接弹菜单选择状态
- **格子视觉**:
  - empty:浅色 / 空白
  - active:实心填充(用对应段落的颜色)
  - fade-in:从左到右渐变(空→实)
  - fade-out:从左到右渐变(实→空)

### 3.4 顶部工具栏

- 项目名称(默认 "Untitled Sketch",可编辑)
- 全局 BPM 输入框
- 总时长显示(只读,根据 BPM 和总 bars 算出秒数,如 "3:24")
- 撤销 / 重做按钮 (v1 可选,如时间紧可推迟)
- 保存状态指示(自动保存到 localStorage 后显示 "Saved")

### 3.5 数据持久化

- **存储位置**:浏览器 `localStorage`
- **存储 Key**:`auditecture:project:default`(v1 只支持单项目)
- **触发时机**:任何修改后 debounce 500ms 自动保存
- **数据格式**:JSON,完整序列化项目状态

```typescript
interface Project {
  version: 1;
  name: string;
  bpm: number;
  sections: Section[];
  tracks: Track[];
  cells: Cell[];        // 稀疏存储,只存非 empty 的格子
  createdAt: string;
  updatedAt: string;
}
```

### 3.6 导出与导入 (v1 最小版)

- **导出 JSON**:工具栏 "Export → JSON" 按钮,下载 `.auditecture.json` 文件
- **导入 JSON**:工具栏 "Import" 按钮,上传 `.auditecture.json` 文件覆盖当前项目
- ⚠️ MIDI 导出在 v2

---

## 4. 视觉风格

### 4.1 风格定位

**手绘白板感 + 现代克制感**——保留低压力的"草稿氛围",但避免廉价手感。整体克制不嘈杂,可以长时间盯着不累。

### 4.2 关键视觉决策

- **背景**:暖白或非常浅的米色/灰色,模拟纸张/白板感,有微弱的噪点纹理(grain overlay)
- **线条**:略带不规则感的边框,模仿马克笔笔触,但保持清晰度
- **字体**:
  - 显示字体:略带个性的无衬线或半衬线(避免 Inter / Roboto / Arial)
  - 标签字体:类手写感字体(用于段落名、轨道名),如 Caveat / Architects Daughter / Patrick Hand 之类
- **配色**:主色调克制(黑/深灰为主),段落用低饱和度彩色区分(像马克笔颜色:墨绿、酒红、海蓝、橙黄等)
- **格子填充**:不是纯色块,而是略带"涂抹"质感(可用 SVG noise filter 或简单贴图)
- **微交互**:hover 时格子有轻微的"墨迹晕开"效果,拖拽时元素有自然的物理感

### 4.3 反例(要避免)

- ❌ 纯白底 + 紫色渐变(典型 AI slop)
- ❌ Material Design 那种工整的卡片+阴影
- ❌ 过度的拟物化(不需要真的画成木质画板纹理)
- ❌ 太多动画,导致用户分心

---

## 5. 技术栈

- **框架**:React 18 + TypeScript
- **构建**:Vite
- **状态管理**:Zustand(轻量,适合本地项目)或 React Context(更简单)
- **样式**:Tailwind CSS + 少量自定义 CSS(用于手绘质感的特殊效果)
- **拖拽**:`@dnd-kit/core`(现代化、可访问性好)
- **持久化**:`localStorage` + 自己写一层薄封装
- **图标**:lucide-react
- **未来 MIDI 导出**:`@tonejs/midi` 或 `midi-writer-js`

---

## 6. 用户故事 (User Stories)

### US-1:从零画一首歌的骨架
> 作为一个电子音乐人,我想在打开 DAW 之前先画好歌曲段落,这样我打开 Logic 时不会面对空工程发呆。

**验收标准:**
- 用户能在 5 分钟内画出一个包含 Intro / Verse / Build / Drop / Break / Outro 的完整结构
- 每个段落能清晰看到长度(bars)
- 总时长能在顶部看到

### US-2:边听边画 reference
> 作为一个学习者,我想后台播放一首参考曲,前台同步把它的结构画下来。

**验收标准:**
- 整个界面在一屏内能看到完整结构,不需要滚动
- 添加段落和切换格子状态的操作能在 1 秒内完成,不打断听音乐的注意力

### US-3:不丢失工作
> 作为用户,我画了 20 分钟刷新页面之后不想从头再来。

**验收标准:**
- 任何修改 500ms 内自动保存到 localStorage
- 刷新页面后状态完全恢复
- 顶部有 "Saved" 指示,让用户安心

### US-4:导出备份
> 作为用户,我想把项目存成文件,以后可以重新打开。

**验收标准:**
- 能导出 `.auditecture.json` 文件
- 能导入回来,完整恢复状态

---

## 7. 成功指标

由于是个人工具/小众工具,不追求商业指标,而是**自用价值指标**:

1. **能用自己画出的图直接开始 DAW 工作**——这是最核心的验证
2. **画完一首歌结构的时间 < 10 分钟**
3. **比纸笔/Obsidian 表格更快**——如果不比手写快,那这工具没意义
4. **画完之后觉得"我大概知道怎么开始了",而不是"我又增加了一个工具的负担"**

---

## 8. 风险与开放问题

### 风险

- **R1**:手绘风格的视觉实现复杂度高,如果纯 CSS 做不出味道,需要 SVG 滤镜或贴图,可能拖慢开发
- **R2**:拖拽调整段落长度的交互体验需要打磨,做不好会让人崩溃
- **R3**:v1 不做导出,可能在自用时就觉得不够用,需要尽快推进 v2

### 开放问题

- **Q1**:格子的状态是否需要超过 4 种?(如"间歇出现 / 抽帧"等)——v1 先做 4 种,根据使用反馈再加
- **Q2**:段落颜色应该按"角色"(Verse/Drop)分配,还是按段落顺序分配?——v1 按"常见段落名"做预设映射,自定义名走默认色
- **Q3**:轨道是否要分组?(如 Drums / Bass / Synths / Vocals 大类)——v1 不做,v2 考虑

---

## 9. v2 路线图(预览)

按优先级:

1. **MIDI 导出**(最高优先级):导出 .mid 文件,包含 Marker Track + 空 MIDI Region + Tempo + 可选的 CC 自动化
2. **能量曲线**:在顶部加一行可手绘的能量曲线
3. **和弦走向**:每段可填和弦,导出时写入 MIDI Chord Track
4. **频率分布 + 混响走向**:作为元数据,导出为 PDF 施工图或并入 JSON
5. **多项目管理**:左侧加项目列表
6. **键盘快捷键**:加速操作
7. **移动端适配**:看情况

---

## 附录 A:典型项目示例数据

```json
{
  "version": 1,
  "name": "Tech House Sketch",
  "bpm": 128,
  "sections": [
    { "id": "s1", "name": "Intro", "bars": 16, "color": "#9CA3AF", "order": 0 },
    { "id": "s2", "name": "Verse", "bars": 16, "color": "#6B7280", "order": 1 },
    { "id": "s3", "name": "Build", "bars": 8, "color": "#F59E0B", "order": 2 },
    { "id": "s4", "name": "Drop", "bars": 32, "color": "#DC2626", "order": 3 },
    { "id": "s5", "name": "Break", "bars": 16, "color": "#3B82F6", "order": 4 },
    { "id": "s6", "name": "Build 2", "bars": 8, "color": "#F59E0B", "order": 5 },
    { "id": "s7", "name": "Drop 2", "bars": 32, "color": "#DC2626", "order": 6 },
    { "id": "s8", "name": "Outro", "bars": 16, "color": "#9CA3AF", "order": 7 }
  ],
  "tracks": [
    { "id": "t1", "name": "Kick", "order": 0 },
    { "id": "t2", "name": "Bass", "order": 1 },
    { "id": "t3", "name": "Lead Synth", "order": 2 },
    { "id": "t4", "name": "Pad", "order": 3 },
    { "id": "t5", "name": "Vocal", "order": 4 },
    { "id": "t6", "name": "FX", "order": 5 }
  ],
  "cells": [
    { "trackId": "t1", "sectionId": "s2", "state": "active" },
    { "trackId": "t1", "sectionId": "s4", "state": "active" },
    { "trackId": "t1", "sectionId": "s7", "state": "active" }
  ]
}
```
