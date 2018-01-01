---
layout: post
title: TypeScript 遍历器
tags: typescript,symbol
desc: "TypeScript 快速手册：遍历器"
---

## 可遍历类型

TS 中，如果一个对象实现了 `Symbol.iterator` 属性，那么就认为它是**可遍历类型**。
一些内置的类型如 `Array`、`Map`、`Set`、`String`、`Int32Array` 等默认就已经实现了 `Symbol.iterator` 属性。
`Symbol.iterator` 函数的职责就是返回用于遍历的值列表。

`for..of` 是 ES6 新引入遍历语句。当把它应用于可遍历对象时，它调用的就是 `Symbol.iterator` 属性。

`for..in` 也是用于遍历，两者的区别在于：

1. `for..in` 遍历的是对象的**键名列表**，而 `for..of` 遍历的是对象的**数值键**对应的**属性值列表**
2. `for..in` 能用于**任何对象**，`for..of` 仅能用于可遍历对象

```ts
let list = [1, 2, 3];
for (let i in list) {
  console.log(i); // => '0', '1', '2'
}
for (let i of list) {
  console.log(i); // => '1', '2', '3'
}
```

## 代码生成

受限于语言支持，如果目标生成 ES3 或 ES5 的代码，那么可遍历器仅仅能用于 `Array` 类型，否则编译器将抛出错误，即便是被遍历对象实现了 `Symbol.iterator` 。

如果目标语言不低于 ES6 ，那么编译器生成的代码将直接使用 `for..of` 。
