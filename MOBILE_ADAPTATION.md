# 移动端适配说明文档

## 📱 概述

本项目已完成移动端响应式适配，采用**单一代码库响应式设计**方案，通过CSS媒体查询实现PC端和移动端的自适应布局。

**适配范围：** 心理测评问卷答题页面  
**支持设备：** 宽度 ≥ 320px 的移动设备（iPhone SE 及以上）  
**断点设置：** 768px（小于等于768px为移动端，大于768px为桌面端）  
**屏幕方向：** 仅支持竖屏答题

---

## ✨ 主要改动

### 1. 文件新增

#### 样式文件
- `src/assets/styles/mobile.scss` - 移动端全局响应式样式
- `src/assets/styles/components/question-mobile.scss` - 题型组件移动端样式

#### 修改文件
- `src/assets/styles/index.scss` - 引入移动端样式
- `src/views/questionnaire/answer/index.vue` - 添加移动端布局结构

---

## 🎯 功能特性

### PC端（>768px）
- 保持原有3-18-3栅格布局
- 右侧操作栏（返回、上一题、下一题/提交、大字模式、指导语）
- 进度条显示（百分比 + 题号）
- 所有原有功能完整保留

### 移动端（≤768px）
- ✅ 100%单列布局
- ✅ 简化进度显示（仅题号，如：1 / 10）
- ✅ 底部固定操作栏（两行布局）
  - 第一行：上一题 | 下一题/提交
  - 第二行：大字模式 | 指导语 | 返回
- ✅ 优化字体大小（标题18px，选项16px）
- ✅ 增大点击区域（最小44×44px）
- ✅ 优化选项间距（防止误触）
- ✅ 支持安全区域（刘海屏适配）
- ✅ 优化对话框尺寸（90%宽度，最大400px）
- ✅ 移除hover效果，使用active状态
- ✅ 禁用文本选择
- ✅ 优化滚动性能

### 题型适配情况
| 题型 | PC端 | 移动端 | 说明 |
|------|------|--------|------|
| 单选题 | ✅ | ✅ | 横向选项移动端改为纵向 |
| 多选题 | ✅ | ✅ | 横向选项移动端改为纵向 |
| 简答题 | ✅ | ✅ | 输入框高度增加至120px |
| 日期题 | ✅ | ✅ | 输入框100%宽度，高度44px |
| 时间题 | ✅ | ✅ | 输入框100%宽度，高度44px |
| 地区题 | ✅ | ✅ | 级联选择器100%宽度 |
| 时长题 | ✅ | ✅ | 输入框100%宽度，高度44px |
| 画板题 | ✅ | ❌ | 移动端不显示（按需求） |

---

## 🔧 技术实现

### 响应式布局方案

```vue
<!-- 桌面端布局 -->
<ElRow class="desktop-layout">
  <!-- 原有PC端代码 -->
</ElRow>

<!-- 移动端布局 -->
<div class="mobile-layout">
  <!-- 移动端专用代码 -->
</div>
```

### 样式控制

```scss
// 桌面端 - 隐藏移动端
@media (min-width: 769px) {
  .mobile-layout {
    display: none !important;
  }
}

// 移动端 - 隐藏桌面端
@media (max-width: 768px) {
  .desktop-layout {
    display: none !important;
  }
  
  .mobile-layout {
    display: block !important;
  }
}
```

---

## 📐 样式规范

### 字体大小
```scss
// 移动端字体
标题：18px (正常) / 22px (大字体)
选项：16px (正常) / 18px (大字体)
按钮：16px

// 桌面端字体
标题：24-28px
选项：18-24px
```

### 间距规范
```scss
// 移动端间距
选项间距：12px (上下)
内边距：12px-16px
卡片边距：12px

// 点击区域
最小高度：44px (符合移动端规范)
```

### 颜色主题
```scss
主色调：#5d87ff
成功色：#67c23a
悬停色：#b9d3f6
背景色：#f7f7f7
边框色：#e5e7eb
```

---

## 💡 维护指南

### 后续修改只需改一遍代码！

#### 场景1：修改功能逻辑
```typescript
// 修改一处，PC和移动端都生效
const submitAnswer = async () => {
  // 你的修改...
}
```

#### 场景2：修改文本内容
```vue
<!-- 修改一处，PC和移动端都生效 -->
<ElButton>下一题</ElButton>
```

#### 场景3：修改通用样式
```scss
// 修改一处，PC和移动端都生效
.title {
  color: #5d87ff;
}
```

#### 场景4：只修改移动端样式
```scss
// 只在移动端媒体查询中修改
@media (max-width: 768px) {
  .title {
    font-size: 20px; // 只影响移动端
  }
}
```

### 添加新题型

1. 在 `answer/index.vue` 的两个布局中都添加新题型：
```vue
<!-- 桌面端布局中添加 -->
<template v-if="item.type === '新题型'">
  <newQuestionType :question="item" v-model="item.answer" />
</template>

<!-- 移动端布局中也添加（如果移动端需要） -->
<template v-if="item.type === '新题型'">
  <newQuestionType :question="item" v-model="item.answer" />
</template>
```

2. 在 `question-mobile.scss` 中添加移动端样式：
```scss
@media (max-width: 768px) {
  .new-question-box {
    .header .title {
      font-size: 18px !important;
    }
    // 其他移动端样式...
  }
}
```

---

## 🧪 测试清单

### 屏幕尺寸测试
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 6/7/8)
- [ ] 414px (iPhone 6/7/8 Plus)
- [ ] 768px (iPad 竖屏)
- [ ] 1024px (iPad 横屏)

### 功能测试
- [ ] 单选题选择和自动跳转
- [ ] 多选题选择
- [ ] 简答题输入
- [ ] 日期/时间选择
- [ ] 地区选择
- [ ] 上一题/下一题导航
- [ ] 提交功能
- [ ] 返回功能
- [ ] 大字模式切换
- [ ] 指导语弹窗
- [ ] 继续答题弹窗

### 交互测试
- [ ] 点击区域是否足够大
- [ ] 是否有误触现象
- [ ] 滚动是否流畅
- [ ] 弹窗是否适配屏幕
- [ ] 输入框是否自动放大（iOS）
- [ ] 安全区域是否适配（刘海屏）

---

## 📱 移动端调试

### Chrome DevTools
1. 打开开发者工具 (F12)
2. 点击设备工具栏图标 (Ctrl+Shift+M)
3. 选择设备型号或自定义尺寸
4. 刷新页面查看效果

### 真机调试
1. 在同一网络下获取本地IP
2. 访问 `http://你的IP:端口号`
3. 在移动设备上测试

---

## ⚠️ 注意事项

### 1. 画板题在移动端不显示
移动端布局中已排除画板题（type='10'），如需支持，请：
- 添加触摸优化的画板组件
- 调整画板高度（建议250-300px）
- 在移动端布局中添加画板题模板

### 2. Element Plus 组件适配
部分Element Plus组件在移动端已自动适配：
- ElDatePicker - 原生日期选择器
- ElTimePicker - 原生时间选择器
- ElCascader - 级联选择器
- ElDialog - 对话框

### 3. iOS输入框自动放大问题
已通过设置 `font-size: 16px` 避免iOS自动放大输入框。
**不要将输入框字体设置小于16px！**

### 4. 安全区域适配
底部操作栏已支持安全区域：
```scss
padding-bottom: calc(12px + env(safe-area-inset-bottom));
```

---

## 🔄 版本兼容

### 浏览器支持
- ✅ Chrome (Android 5+)
- ✅ Safari (iOS 10+)
- ✅ Firefox (Android)
- ✅ Edge (移动版)
- ✅ 微信内置浏览器
- ✅ 支付宝内置浏览器

### 不支持功能
- ❌ 横屏模式（仅支持竖屏）
- ❌ 画板题（移动端）
- ❌ IE浏览器

---

## 📞 常见问题

### Q: 为什么有些样式用了 `!important`？
A: 为了确保移动端样式能够覆盖桌面端样式和Element Plus的默认样式。

### Q: 可以修改断点吗？
A: 可以，在 `mobile.scss` 和 `question-mobile.scss` 中修改 `$mobile-breakpoint` 变量。

### Q: 如何添加横屏支持？
A: 添加横屏媒体查询：
```scss
@media (max-width: 768px) and (orientation: landscape) {
  // 横屏样式
}
```

### Q: 移动端性能如何优化？
A: 已进行以下优化：
- 使用 `-webkit-overflow-scrolling: touch`
- 禁用hover效果
- 使用CSS transform做动画
- 避免大图片加载

---

## 📝 更新日志

### v1.0.0 (2026-01-27)
- ✅ 完成移动端响应式布局
- ✅ 优化所有题型组件移动端样式
- ✅ 添加底部固定操作栏
- ✅ 优化触摸交互体验
- ✅ 支持安全区域适配
- ✅ 优化对话框移动端显示

---

## 👥 技术支持

如有问题或建议，请联系开发团队。

**祝答题愉快！📱✨**
