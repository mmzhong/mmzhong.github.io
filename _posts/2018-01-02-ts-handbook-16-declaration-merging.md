---
layout: post
title: TypeScript 声明合并
tags: typescript,declaration merging
desc: "TypeScript 快速手册：声明合并"
---

## 介绍

TS 中有一些独特的概念，在顶层类型级别描述了 JS 对象的结构。
其中最为独特的是**声明合并**（Declaration Merging）。
理解声明合并不仅可以为我们结合现有 JS 带来帮助，它还能解锁更多的高级抽象概念。

本文中的声明合并意味着，编译器会合并多个在不同地方、使用相同名字的声明。
合并而成的声明包含了原声明的所有功能。
原声明的数量是不限的。

## 基本概念

在 TS 中， 一个声明会创建一个实体，这个实体至少是**命名空间、类型和值**三种类型中的一种。

下表为不同声明及其创建的实体列表：

| 声明类型 | 命名空间 | 类型 | 值 |
| --- | --- | --- | --- |
| namespace | &#10004; | | &#10004; |
| class | | &#10004; | &#10004; |
| enum | | &#10004; | &#10004; |
| interface | | &#10004; | |
| type alias | | &#10004; | |
| function | | | &#10004; |
| variable | | | &#10004; |

理解声明创建了哪些实体可以帮助我们理解声明合并到底合并了什么。

注意，产生类型合并的前提条件是**类型名称相同**。

## 合并同名接口

接口合并是最简单的，同时也是最常见的类型声明合并。
它会把接口声明的所有成员合并到一个同名接口中。

```ts
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

let box: Box = {height: 5, width: 6, scale: 10};
```

接口的非函数成员名称应该是**独特**的，如果名称相同，那么应该拥有相同的类型，否则编译器报错。

对于函数成员，相同名称的函数会当作为函数重载，后面声明的接口具有优先权。

```ts
interface Cloner {
  clone(animal: Animal): Animal;
}

interface Cloner {
  clone(animal: Sheep): Sheep;
}

interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```

上面的三个接口合并后形成的声明为：

```ts
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```

注意，后面声明的接口成员排在前面，且原顺序也不变。

唯一的例外是函数签名的参数为单个字面量字符串类型时，参数字面量字符串类型的函数会冒泡到重载函数列表的顶部，但仍遵循后者优先的规则。

```ts
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}
```

合并结果为：

```ts
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}
```

> 疑问：使用的时候，顺序好像并不重要？毕竟类型声明的顺序是无关类型检查的。

## 合并同名命名空间

从前文可知，命名空间声明会创建一个命名空间和一个值。所以，我们需要分别理解这两者是如何合并的。

合并命名空间时，每个命名空间中导出的对象本身是合并的，再把这些已合并的导出对象合并成一个命名空间就算完成了合并。

合并命名空间值时，在每个声明处，如果命名空间已经存在，那么后续的命名空间会把导出对象新增到已经存在的命名空间上。

```ts
namespace Animals {
  export class Zebra { }
}

namespace Animals {
  export interface Legged { numberOfLegs: number; }
  export class Dog { }
}
```

等价于：

```ts
namespace Animals {
  export interface Legged { numberOfLegs: number; }
  export class Zebra { }
  export class Dog { }
}
```

但是未导出对象是怎么合并的呢？
未导出对象**仅对原命名空间可见**。这就意味着，合并进来的成员无法访问另一个命名空间中的未导出对象。

例如：

```ts
namespace Animal {
  let haveMuscles = true;

  export function animalsHaveMuscles() {
    return haveMuscles;
  }
}

namespace Animal {
  export function doAnimalsHaveMuscles() {
    return haveMuscles;  // => error, haveMuscles is not visible here
  }
}
```

## 命名空间合并同名类、函数和枚举

命名空间也可以和其他同名类型合并。
合并时，命名空间声明必须听从要与它合并的声明。
合并后的声明拥有原声明的所有类型。

* 与类合并

```ts
class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel { }
}
```

命名空间 `Album` 中新增的静态成员会同步到类 `Album` 中。

* 与函数合并

```ts
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}

namespace buildLabel {
  export let suffix = "";
  export let prefix = "Hello, ";
}

alert(buildLabel("Sam Smith"));
```

* 与枚举合并

```ts
enum Color {
  red = 1,
  green = 2,
  blue = 4
}

namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    }
    else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    }
    else if (colorName == "magenta") {
      return Color.red + Color.blue;
    }
    else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
```

## 不允许的合并

并不是所有的合并都是合法的。目前，类不能跟其他类或者变量合并。
如果要实现类似的类合并功能，可以参考[混合](http://www.typescriptlang.org/docs/handbook/mixins.html)（Mixins）

## 模块增强

尽管 JS 模块不支持合并，但是我们可以通过把现有对象导入然后再修改它的方式来实现。如：

```ts
// file observable.js
export class Observable<T> {
  //...
}
```

```ts
// file map.js
import { Observable } from './observable';
Observable.prototype.map = function(f) {
  //...
}
```

上面的方式在 TS 中也能正常工作，但是编译器没法对 `.map` 进行类型检查。
此时，可以使用**模块增强**（Module Augmentation）来告诉编译器 `map` 的类型：

```ts
// observable.ts stays the same
// file map.ts
import { Observable } from './observable';
declare module './observable' {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}
Observable.prototype.map = function(f) {
  //...
}
```

模块名称必须跟 `import/export` 中的一样，所以写为 `'./observable'` 和 `Observable<T>`。这样的话，这个模块增强部分就会跟在原文件 `observable.js` 中定义的一样。

但是，不能重新定义一个顶层的声明，只能在现有的声明的基础上新增修改。

可以看出，模块增强的作用是在不修改原模块的情况下，从另一个模块对原模块新增类型。

## 全局增强

也可以从模块内部向全局环境新增声明：

```ts
// observable.ts
export class Observable<T> {
  // ... still no implementation ...
}

declare global {
  interface Array<T> {
    toObservable(): Observable<T>;
  }
}

Array.prototype.toObservable = function () {
  // ...
}
```

全局增强的行为和约束同模块增强一样。
