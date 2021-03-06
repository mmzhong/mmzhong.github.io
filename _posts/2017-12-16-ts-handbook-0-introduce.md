---
layout: post
title: TypeScript 介绍
tags: typescript
desc: "TypeScript 快速手册：介绍"
---

本文是《TypeScript 快速手册》的第一篇文章。

该系列文章主要记录了本人对 [TypeScript 官方文档](http://www.typescriptlang.org/docs/home.html)的阅读和理解。

错误在所难免，如您遇到，请不吝赐教。

## TypeScript 是什么

TypeScript 是 JavaScript 的**超集**，在 JS 语言的基础上新增了**类型检查**功能。超集意味着一段合法的 JS 代码可以直接在 TS 中使用。类型检查的主要目的是为了**减少运行时错误**。

TS 主要基于 ES6 的语法，编译时可以选择输出为 ES3、ES5 以及更新的 JS 代码。

> 后续将使用简称 TS 代替 TypeScript

## 为什么要使用 TS

开发一般的中小应用时，JS 是完全可以胜任的。但如果是开发**大型复杂应用且需要多人协作**时，那么 JS 就会在大规模代码的组织和管理上显得乏力。比如一个开发者使用项目中某个已经写好的函数时，在 TS 中他会得到很直接的函数说明和参数类型，而不用像 JS 一样去查看文档甚至源码。

## TS 设计目标

TS 的设计目标决定了很多其实现的功能特性。设计目标包括：

1. 静态地检测可能出现的错误
2. 易于组织和管理大规模代码
3. 不引入额外的运行时依赖
4. 生成简洁、通用和易理解的 JS 代码
5. 语言本身支持组合使用且容易理解
6. 紧跟当前和未来的 ES 标准
7. 保留 JS 的所有运行时特征
8. 避免引入新的表达式语法
9. 使用易兼容、可选的结构类型系统
10. 支持跨平台
11. 尽量向后兼容 TypeScript 1.0

非设计目标包括：

1. 完全模仿现有语言的设计。相反，以 JS 特征和程序目的为指引做最有意义的设计。
2. 极力优化程序运行时性能。相反，仅生成适合运行平台的通用 JS 代码。
3. 应用一个健全的类型系统。相反，会在健全性和生产效率之间相互平衡。
4. 提供一条龙的构建流程。相反，会增强其拓展性以让其它构建工具使用它。
5. 为运行时提供类型信息，或根据不同的类型生成不同的代码。相反，鼓励使用不依赖运行时类型信息的编程模式。
6. 提供额外的运行时功能或库。相反，使用 TS 来描述现有库而不是去重新实现。
7. 引入让开发者眼前一亮的功能。相反，充分考虑已经被其他常用语言所采用的功能。

因此，TS 的目标不是取代 JS ，它的竞争对手是 Babel 等编译工具。
TS 致力于提高生产力，增强 JS 应用的**开发和调试**环节，使 JS 能够应付大型应用和多人协作。

## 能做的和不能做的

从 TS 的设计目标中可以分析出 TS 能做的和不能做的功能。

Can：

* 正确解析 ES6、ES7 最新语法，如类、 async/await 等
* 静态的类型检查
* 内置 JSX 语法支持
* 可与现有 JS 库共存

Can't：

* 不会进行代码打包、压缩等
* 不会提供运行时 polyfills/shims ，如 `Array.prototype.includes` 、`Promise`

所以，如果是客户端应用，仍然需要使用 webpack、rollup 和 parcel 等打包工具。

## 相关链接

* [TypeScript 语言规范](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md)
* [TypeScript Wiki](https://github.com/Microsoft/TypeScript/wiki)