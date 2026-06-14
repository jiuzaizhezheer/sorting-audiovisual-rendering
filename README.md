# Sorting Audiovisual Rendering

一个使用 Vite、React、TypeScript、Canvas 2D、TailwindCSS 和 `useReducer` 构建的排序算法可视化 Web 应用。

当前支持：

- 冒泡排序
- 快速排序
- 归并排序

## 功能

- 使用 Canvas 2D 绘制排序过程
- 支持播放、暂停、上一步、下一步、重置
- 支持生成随机数组
- 支持调整数组长度和播放速度
- 支持声音开关；每轮比较结束后播放当前数组顺序对应的完整音序
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

算法模块需要返回 `SortStep[]`，每一步包含当前数组快照和可视化状态。这样 Canvas、控制面板和状态机都不需要为新增算法做额外改动。

## 核心设计

排序逻辑和 UI 解耦：

- 算法文件只负责生成排序步骤
- `sortReducer.ts` 负责播放状态、速度、数组大小和当前步骤
- 音频模块负责把当前数组映射为一段短音序，并在每轮比较结束后播放
- 上传音频后，会按算法实际最终数组顺序切分音频；排序中途按当前数组顺序重排播放，排序完成时还原为正常顺序
- `drawSortState.ts` 负责把步骤快照绘制到 Canvas
- 组件层只负责用户交互、播放控制和算法信息展示

这种结构的目标是避免把算法、状态和视图写成一大块，后续扩展新算法或替换渲染方式都更直接。
