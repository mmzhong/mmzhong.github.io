---
layout: post
title: 理解 Virtual DOM
data: 2017-08-17
tags: react,dom,js
desc: 理解 Virtual DOM
---

## 什么是 DOM

**DOM 是对 HTML 的抽象**（Abstraction），HTML 中的元素与 DOM 中的节点是一对一的关系。

而 **VDOM 则是对 DOM 的抽象**。

## 如何操作 DOM

### 基础做法

先获取要操作的 DOM 对象，然后更改其属性，即**先选中后操作**。这个过程可以使用 jQuery 等库来简化操作。

### MVC 做法

实现了**数据和视图的隔离**，当数据变更后，使用**模板**重新生成新视图（大部分情况是局部视图），然后使用**新视图替换旧视图**。这是一种简单粗暴的做法，因为这样可能会由于一个小小的改动就导致整个视图重新渲染，从而影响性能。

### MVVM 做法

在 JS 中**维护应用状态**，由框架/库**自动更新视图**，而不需要开发者主动操作 DOM。

## VDOM

DOM 对象之**复杂巨大**勿需多言，创建一个 DOM 元素需要耗费多少资源直接看它拥有的属性就知道了。

VDOM 就是对 DOM 的抽象，它使用简单的 JS 对象来描述 DOM 对象，并利用这些 JS 对象来重构出所有 DOM 元素的**层级关系**。这些 JS 对象可称之为 VNode，它是 **mini 版的 DOM 对象**，只包含最基本的属性。使用 VNode 构建出来的层级关系可称之为 VTree，它的层级关系与 DOM 层级关系一致。

由此可以看出，**VDOM 主要用来抽象 DOM 的层级关系**。

VDOM 更新原理：

1. 构建 VDOM1，然后构建一个真正的 DOM1，此时 VDOM1 == DOM1;
2. 当状态变更后，重新构建，生成 VDOM2；
3. diff(VDOM2, VDOM1) = Patch;
4. patch(Patch, DOM1) = DOM2;
5. 此时有 VDOM2 == DOM2;

> VDOM 本质上是在 JS 和 DOM 之间做一个缓存，它类似于 CPU 和硬盘之间的内存。因为写内存的速度快于写硬盘。  
> CPU 只操作内存，有必要的时候写入硬盘；对应于 JS 通常只操作 VDOM ，有必要时更新 DOM。

其中，关键步骤就是 render、diff、patch。

### 为什么 VDOM 比 DOM 快

要想改变 UI 最终都还是要操作 DOM 的。

之所以说 VDOM 比 DOM 快，比较的并不是直接操作 DOM 的快慢，而是指**使用 VDOM 更新视图比直接替换整个视图的 DOM 更快更有效率**。

VDOM 消耗的时间 = 生成 VDOM + Diff + Patch。**VDOM 节省的是重复创建已有的 DOM 元素的时间**。

举个栗子 🌰 ，想把一个列表 1 变成列表 2：

```html
<!-- list 1 -->
<ul>
	<li>0</li>
	<li>1</li>
	<li>2</li>
</ul>

<!-- list 2 -->
<ul>
	<li>3</li>
	<li>4</li>
	<li>5</li>
	<li>6</li>
</ul>
```

最优实现： 3 次 innerHTML 操作 + 1 次 DOM 创建和添加（1 个 `<li>`）。这种做法很直观，然而它**不够通用**，且后期也**无法维护**。

MVC 实现：1 次 innerHTML 操作（`<ul>` 的 innerHTML）+ 4 次 DOM 创建（4 个 `<li>`）；

MVVM 实现：1 次 VDOM Render + 1 次 Diff + 3 次 innerHTML 操作 + 1 次 DOM 创建和添加；

相比多次的 DOM 创建，1 次 VDOM Render + 1 次 Diff 的操作还是占有很大优势的。如果哪天 DOM 本身的操作（创建、添加、删除等）已经非常快了，那么就不需要 VDOM 了。

## 总结

VDOM 解决的问题是，在尽量减小性能消耗的情况下，实现“维护状态，更新视图”。它允许我们可以直接修改轻量级的 JS 对象来更新视图，而不是直接操作 DOM 。


## 参考文章

* [知乎：怎样更好的理解虚拟 DOM](https://www.zhihu.com/question/29504639)
* [如何实现一个 Virtual DOM 算法](https://github.com/livoras/blog/issues/13)

