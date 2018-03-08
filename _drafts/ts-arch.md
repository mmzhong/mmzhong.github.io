---
layout: post
title: TypeScript 架构概述
tags: TypeScript,Architecture
desc: TypeScript 架构概述
---

本文首先介绍了 TS 架构的各个层次，然后是涉及的数据结构，最后会介绍整个编译过程。

## 架构分层

![TS 架构分层](/assets/img/ts-architecture.png)

TS 架构层次如上图所示，下面将对每层进行分析。

### 核心编译器

核心编译器位于最底层，它包含以下部分：

* 语法解析器（Parser）：根据 TS 语法，从一系列源文件生成对应的抽象语法树（AST）。

* 类型联合器（Binder）：合并同一类型的所有声明，例如在不同文件中的同名接口，这使得类型系统可以直接使用合并后的类型。

* 类型检查器（Checker）：解析每种类型的解构，检查语义并产生正确的检查结果。

* 代码生成器（Emitter）：从 `.ts` 和 `.d.ts` 文件生成 `.js`、`.d.ts` 和 `.map` 等文件。

* 预处理器（Pre-processor）：**编译上下文**（Compilation）指的是和程序相关的所有文件。该上下文通过

### 独立编译器

### 语言服务

## 数据结构

## 编译过程概述

## 术语