# Sorting Audiovisual Rendering

一个使用 Vite、React、TypeScript、Canvas 2D、TailwindCSS 和 `useReducer` 构建的排序算法可视化 Web 应用。

当前支持：

- 冒泡排序
- 快速排序
- 归并排序

## 功能

- 使用 Canvas 2D 绘制排序过程
- 支持播放、暂停、重置
- 支持生成随机数组
- 未上传音频时，数组长度可选 400、600、800、1000，每步间隔 1ms
- 上传音频后，数组长度可选 25、50、75、100；比较、交换、写回等操作发生时，只播放被操作元素对应的音频
- 支持上传本地音频，并把音频平均切分给最终排序后的数组元素
- 播放每段音频时，对应的条形图会同步高亮
- 展示当前算法说明、时间复杂度和空间复杂度
- 桌面端使用全屏双栏布局，画布和右侧控制面板会随视口缩放并占满可用高度
- 算法实现按文件隔离，方便继续扩展

## 技术栈

- Vite
- React
- TypeScript
- Canvas 2D
- TailwindCSS
- Web Audio API
- React `useReducer`
- lucide-react

## 快速开始

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

预览生产构建：

```bash
pnpm preview
```

## 项目结构

```text
src/
  algorithms/        排序算法实现与注册表
  audio/             排序音序生成与播放逻辑
  canvas/            Canvas 绘制逻辑
  components/        React UI 组件
  state/             useReducer 状态管理
  types/             共享类型
  utils/             通用工具
```

## 添加新的排序算法

1. 在 `src/algorithms/` 下新增算法文件，例如 `insertionSort.ts`。
2. 实现并导出一个符合 `SortAlgorithm` 类型的对象。
3. 在 `src/types/sorting.ts` 的 `SortAlgorithmId` 中加入新的算法 id。
4. 在 `src/algorithms/registry.ts` 中导入并加入 `algorithms` 数组。

算法模块需要实现 `createRunner(values)` 生成器。生成器直接推进当前数组，并按步骤 `yield` 当前高亮、音频索引和说明文本；Canvas 只读取当前数组和当前步骤，不再保存全量步骤快照。

## 核心设计

排序逻辑和 UI 解耦：

- 算法文件只负责用生成器推进当前排序步骤
- `sortReducer.ts` 负责播放状态、数组大小、当前数组和当前步骤
- 未上传音频时只按固定间隔推进画面（批量跳帧以平衡性能与流畅度），不进入音频播放流程
- 上传音频后，会按算法实际最终数组顺序切分音频；排序中途只播放当前被操作元素对应的片段
- `drawSortState.ts` 负责把当前数组和当前步骤绘制到 Canvas
- 组件层只负责用户交互、播放控制和算法信息展示

这种结构的目标是避免把算法、状态和视图写成一大块，后续扩展新算法或替换渲染方式都更直接。
