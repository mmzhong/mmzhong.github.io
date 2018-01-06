---
layout: post
title: TypeScript 对 JS 文件进行类型检查
tags: typescript,js file
desc: "TypeScript 快速手册：对 JS 文件进行类型检查"
---

自 v2.3 版本开始，TS 支持对 JS 文件进行类型检查。
该功能可以通过命令行参数 `--checkJS` 或 `tsconfig.json` 中 `checkJS` 字段开启。

开启后，可以使用注释 `// @ts-nocheck` 来**跳过**检查；
未开启时，可以使用注释 `// @ts-check` 来**启动**检查；
也可以在代码前一行添加 `// @ts-ignore` 来**忽略**检查。

下文将列举 `.js` 和 `.ts` 文件之间类型检查的主要区别。

## JSDoc

`.js` 文件中的类型也可以像 `.ts` 一样被推断。
如果不能被推断，那么可以像在 `.ts` 中使用类型注解一样，来使用 JSDoc 指定类型。

```js
/** @type {number} */
var x;

x = 0; // => ok
x = false; // => error
```

完整的 [JSDoc 用法](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript)。

## 类属性类型推断

ES6 并没有规定如何声明类的属性。类的属性都是动态赋值的，就像对象字面量一样。

在 `.js` 中，属性的声明类型是根据类的实现中的赋值来推断的。
属性的类型是所有赋值类型组成的联合类型。
默认的，定义在构造函数中的属性是必选的，而在方法、getters、setters 中新增的属性则认为是可选的。

也可以使用 JSDoc 来显式指定类型。

如果在类的实现中没有设置任何属性，那么认为该类的属性是未知的。如果类只想暴露只读的属性，可以将该属性在构造函数中初始化为 `undefined` 。

## CommonJS

使用 CommonJS 格式的 `.js` 文件可以当成是输入模块格式。
对 `exports` 和 `module.exports` 的赋值会被当做是导出声明。
同样的，`require` 则被当做为模块引入。

```js
// import module 'fs'
const fs = require('fs');

// export function readFile
module.exports.readFile = function(f) {
  return fs.readFileSync(f);
}
```

## 开放的对象字面量

默认的，在 `.ts` 中对象字面量本身就是一种类型。
把对象字面量赋值给变量，就指定了该变量的类型，新属性是不能再被添加到该变量上的。

当时这个限制在 `.js` 中被放开了，可以添加任意新属性。

```js
let obj = { a: 1 };
obj.b = 2; // => ok
```

对象字面量的默认索引签名为 `[x: string]: any` ，这就允许在上面添加任何属性。

如果不想放开这个限制，那么可以使用 JSDoc 来实现：

```js
/** @type */
let obj = { a: 1 };
obj.b = 2; // => error, 类型 {a: number} 不存在属性 b
```

## 函数参数

除了使用默认参数值， JS 中没有其他办法可以标记一个参数是可选的，所以所有函数参数默认是可选的。
可以传入更少的参数，但是不允许传入过多的参数。

但是，使用 JSDoc 可以帮助我们标记一个参数是可选的：

```js
/**
 * @param {string} [somebody] - Somebody's name.
 */
function sayHello(somebody) {
  if (!somebody) {
    somebody = 'John Doe';
  }
  alert('Hello ' + somebody);
}
```

## var-args 参数

函数如果使用了 `arguments` ，那么该函数会被隐式的认为有 var-args 参数，如 `(...arg: any[]) => any` 。
使用 JSDoc 的 var-arg 语法来指定 `arguments` 的类型。

## 类型参数

未指定的泛型类型参数默认为 `any` 。
列举下面的情况：

* 在 `extends` 语句中

例如，`React.Component` 接受两个类型参数： `Props` 和 `State` 。
在 `.js` 文件中，没有办法可以在拓展时指定类型参数，所以这两个类型参数默认为 `any` ：

```js
import { Component } from "react";

class MyComponent extends Component {
  render() {
    this.props.b; // => ok, since this.props is of type any
  }
}
```

但是借助 JSDoc 的 `@arguments` 可以显式指定类型参数类型：

```js
import { Component } from "react";

/**
 * @augments {Component<{a: number}, State>}
 */
class MyComponent extends Component {
  render() {
    this.props.b; // => error, b does not exist on {a:number}
  }
}
```

* 在 JSDoc 引用中

```js
/** @type{Array} */
var x = [];

x.push(1);        // => ok
x.push("string"); // => ok, x is of type Array<any>

/** @type{Array.<number>} */
var y = [];

y.push(1);        // => ok
y.push("string"); // => error, string is not assignable to number
```

* 在函数调用中

调用泛型函数时，会使用参数来推断类型参数的类型。
但是，有时候这种推断可能会因为缺少源文件而失败，此时类型参数就会默认为 `any`，例如：

```js
var p = new Promise((resolve, reject) => { reject() });
p; // Promise<any>;
```