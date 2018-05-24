---
title: Babel
createdDate: 2018-05-18
tags: es6,babel
desc: Babel
---

# Babel 设计

## 编译器假设

Babel 及其官方转换插件对待转换的代码是有前提假设的。设定这些假设的原因要么是不可能去考虑，要么是用法非常怪异。假设如下：

* `undefined`，`NaN` 和 `Infinity` 未被重新定义
* `Object`，`Array`，`String`，`Number`，`Boolean` 等原生对象未被重新定义
* 原生对象的标准方法未被重新定义为与原功能不符的方法

## 编译器运行环境

**注意**：编译器运行环境和编译后代码的运行环境不是同一回事儿

Babel 编译器仅支持以下编译环境：

* Chrome，Firefox，Safari 和 Edge 等现代浏览器
* Node.js 6 及以上版本

## 源码组织

Babel 采用单一仓库（Monorepo）的方式组织源码。单一仓库意味着所有相关的模块都集中在一个源码仓库中，统一管理维护。

这种组织方式的相关工具还被抽离成了开源的单一仓库管理工具 [Lerna](https://github.com/lerna/lerna)。

它具有以下优点：

* 共用相同的代码检查，构建，测试和发布流程
* 易于协调跨模块的变化
* 唯一的报告问题之处
* 共用相同的开发环境
* 跨模块测试一并运行，便于发现涉及多模块的 BUG

当然，也有不足之处：

* 代码库看起来更加吓人
* 仓库体积更加巨大
* 无法使用 `npm install` 直接从 GitHub 安装

单一仓库的组织方式现在已经在多个流行库中被采用，包括 React，Meteor 和 Ember 等。

# 核心

## babel-core

## Babylon

Babylon 是 Babel 的解析器，现在更名为 `@babel/parser`。它的底层依赖 [acorn](https://github.com/marijnh/acorn) ，支持最新版的 ES（默认开启为 ES2017），也支持 JSX、Flow 和 TypeScript 语法。它使用的 AST 格式为 [Babel AST](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md)，该格式拓展了 [ESTree spec](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md) ，当然也可以通过 `estree` 插件把它变回 ESTree 格式。JSX 的解析规范则是基于 [Facebook JSX AST](https://github.com/facebook/jsx/blob/master/AST.md)。

`@babel/parser` 自身集成了一些插件，以支持多种语法。不过官方目前并不愿意对外暴露插件 API，因为对他们来说，维护 Babel 的插件系统已经是繁重的工作了。而且，新增的插件 API 会限制他们对现有代码库的重构和优化。如果开发者想让解析器支持自定义语法，官方的推荐做法是 fork 项目，然后自己修改。

# Plugin

## Babel 运行过程

Babel 运行过程主要包含三个阶段：解析，转换和生成。

解析负责把字符串变成 AST，主要包含两个分析过程：词法分析和语法分析。其中，词法分析把字符串变成字符码（Token），然后语法分析会把所有的字符码变成 AST。

转换负责遍历 AST，并且在遍历过程中按照需求修改 AST，主要由 Babel 插件来完成修改。

生成负责把修改后的 AST 变回字符串，同时也会创建 SourceMap。

## 遍历

转换 AST 的过程中，必须递归遍历 AST 树。使用深度优先的遍历原则。

当遍历到某一个节点时，我们称之为**访问**某一个节点。通过定义访问者（Visitor），我们可以实现对节点访问。每个访问过程包含进入（enter）和（exit）两个事件，我们可以在这两个事件中都做不同处理。

访问者对象的每个属性（或函数）对应一种（或多种）节点类型，表示想要修改的节点类型。

### Path

通常，AST 都会有很多节点，那么如何知道一个节点跟另一个节点之间的关系呢？Babel 使用 Paths 来实现。

Path 是一个对象，表示两个节点之间的关系。除了关系，Path 对象也还包含很多其它的元数据。

实际上，访问者访问的并不是真正的节点，它访问的是节点的 Path。

### State

状态是 AST 转换过程中的地雷。应避免使用状态，应对方式是使用递归，在访问者中使用另一个访问者。

### 作用域

转换 AST 也要注意作用域，不能把无法访问的作用域也影响了。所以我们需要跟踪每个引用的作用域。

创建作用域时需要指定一个 path 和它的父作用域。遍历的时候 Babel 会把该作用域内所有的引用都收集起来，放入 `bindings` 属性。

引用属于一个特定的作用域，这种关系我们称之为绑定（binding）。
