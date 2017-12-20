---
layout: post
title: TypeScript 介绍
tags: typescript
desc: "TypeScript 快速手册：介绍"
---

本文是《TypeScript 快速手册》的第一篇文章。

该系列文章主要记录了本人对 [TypeScript 官方文档](http://www.typescriptlang.org/docs/home.html)的阅读和理解。

## TypeScript 是什么

TypeScript 是 JavaScript 的**超集**，在 JS 语言的基础上新增了**类型检查**功能。超集意味着一段合法的 JS 代码可以直接在 TS 中使用。类型检查的目的是为了**减少运行时错误**。

TS 主要基于 ES6 的语法，编译时可以选择输出为 ES3、ES5 以及更新的 JS 代码。

## 为什么要使用 TypeScript

开发一般的中小应用时，JS 是完全可以胜任的。但如果是开发**大型复杂应用且需要多人协作**时，那么 JS 就会在大规模代码的组织和管理上显得乏力。比如一个开发者使用项目中某个已经写好的函数时，在 TS 中他会得到很直接的函数说明和参数类型，而不用像 JS 一样去查看文档甚至源码。

## 能做的和不能做的

Can：

* 解析 ES6、ES7 等最新语法
* 强类型检查
* 更好的代码提示
* 内置 JSX 支持

Can't：

* 不会进行代码打包、压缩等
* 不会 Polyfill 缺少的实现，如 Promise

所以，如果是客户端应用，仍然需要使用 webpack、rollup 和 parcel 等打包工具。