---
layout: post
title: TypeScript 类型推断
tags: typescript,handbook,type inference
desc: "TypeScript 快速手册：类型推断"
---

本文主要介绍在什么情况下会发生类型推断，以及如何推断。

## 基础推断

当没有显式的类型注解时，编译器便会使用类型推断。比如 `let x = 3` ，`x` 被推断为 `number` 类型。

这种推断适用于变量与成员初始化、设置默认值以及函数返回值类型确定。

大部分情况下，类型推断都是很直接明了的，但下文所提到的一些情况存在一些细微的差别。

## 最通用推断

当要从多个表达式中推断类型时，会推断出一种能兼容所有这些表达式类型的类型。

比如对于 `let x = [0, 1, null]` ，编译器会考虑每个元素的类型，这里是 `number` 和 `null` 。然后，**最通用类型算法**会考虑每一种**候选类型**，并选出能和其他所有类型兼容的类型，所以这里会把 `x` 的类型推断为 `number[]` 。

有时，真正兼容所有候选类型的类型并不在候选类型之中。比如：

```ts
let zoo = [new Rhino(), new Elephant(), new Snake()];
```

理想情况是把 `zoo` 推断为 `Animal[]` ，但是数组中并没有出现 `Animal` 类型。即候选类型中也没有 `Animal` ，所以编译器没法推断 `zoo` 的类型为 `Animal[]` ，而是推断为联合数组类型 `(Rhino | Elephant | Snake)[]` 。

## 上下文推断

顾名思义，上下文推断根据当前所处的上下文来推断表达式类型。比如：

```ts
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // => error
}
```

编译器会使用 `window.onmousedown` 的函数类型来推断右侧的函数类型，从而推断出 `mouseEvent` 的类型。如果右侧的函数不是赋值给 `window.onmousedown` ，那么 `mouseEvent` 的类型将会是 `any` 。

但是如果显式指明类型，上下文推断的类型将被忽略，如：

```ts
window.onmousedown = function(mouseEvent: any) {
  console.log(mouseEvent.button); // => ok
}
```

上下文推断常用场景包括函数调用传参、赋值、类型断言、对象成员、字面量数组和返回语句。

上下文推断的类型也可以是最通用类型算法的候选类型，如：

```ts
function createZoo(): Animal[] {
  return [new Rhino(), new Elephant(), new Snake()];
}
```

这里根据返回语句的上下文推断新增三个候选类型 `Rhino` 、`Elephant` 和 `Snake` 。再加上函数本身指定的返回值类型 `Animal` ，总共有四个候选类型。很明显，`Animal` 会被最通用类型算法选中。