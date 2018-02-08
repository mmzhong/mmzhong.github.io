---
layout: post
title: Stream
tags: stream
desc: 理解 Stream
---

## 流式编程

## Stream 类别

Node 中有四种基本的流类别：

* Readable：可读流，可以可读流中读取数据
* Writable：可写流，可以往可写流写入数据
* Duplex：复合流，可读流和可写流的并集
* Transform：转换流，会在读写过程中**转换数据**的复合流

### 对象模式（Object Mode）

默认的，使用 Node API 创建的流**只能**操作**字符串和 `Buffer` （或 `Uint8Array`）对象**。但是，也可以实现能操作其他 JS 数据类型（不含 `null` ，因为它是流终止的标识）的流，这种流就称为在**对象模式**下工作的流。

要想创建一个在对象模式下工作的流实例，只需给构造函数传入 `objectMode` 选项，如 `Readable({ objectMode: true })。注意，把一个已经存在的流切换到对象模式是不安全的做法，因此不推荐这么做。

## 实践

## 参考文章

* [substack/stream-handbook](https://github.com/substack/stream-handbook)
* [nodejs-stream](http://taobaofed.org/blog/2017/08/31/nodejs-stream/)
* [stream-basics](https://tech.meituan.com/stream-basics.html)
