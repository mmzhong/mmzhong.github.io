---
layout: post
title: TypeScript 模块
tags: typescript,modules
desc: "TypeScript 快速手册：模块"
---

从 ES6 开始，标准 JS 开始拥有了模块的概念，TS 也引入了此概念。

每个模块拥有自己的作用域（非全局作用域），这意味着在模块内定义的变量、函数、类等对外是不可见的，除非该模块主动对外暴露。
反过来，如果一个模块想使用其他模块中的变量、函数、类等，那么必须手动引入。

模块是需要声明的，模块之间通过文件层次的 `import` 和 `export` 产生关系。

TS 的模块概念与 ES6 的一致。

## 导出

### 声明导出

任何声明包括变量、函数、类、类型别名和接口等，都可以通过简单的加上 `export` 来导出。

```ts
export interface StringValidator {
  isAcceptable(s: string): boolean;
}
```

### 语句导出

当导出对象需要被重新命名时，导出语句会很好用。上面的例子可以写成：

```ts
interface StringValidator {
  isAcceptable(s: string): boolean;
}
export { StringValidator }; // visiable as StringValidator
export { StringValidator as SV }; // visiable as SV
```

注意，不能写成 `export StringValidator` ，因为 `StringValidator` 不是语句。

### 重新导出

**重新导出**（Re-exports）不会把模块引入到当前作用域或者引入本地变量，而是直接导出。

```ts
export { ZipCodeValidator as RexExpBasedZipCodeValidator } from './ZipCodeValidator';
```

上面重新导出时也顺便进行了重新命名。

也可以使用 `*` 表示所有导出对象：

```ts
export * from './ZipCodeValidator';
```

## 导入

仅导入一个导出对象：

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";
```

导入并重命名：

```ts
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
```

导入整个模块到一个变量：

```ts
import * as validator from "./ZipCodeValidator";
let v = new validator.ZipCodeValidator();
```

虽然下面的做法是**不推荐**的，但是有些场景下，一些模块需要单独设置相关全局变量以供其他模块使用。
这些模块没有任何导出，或者使用者不关心其任何导出。
导入这类仅有**副作用**的模块使用以下方法：

```ts
import './my-module.js';
```

## 默认导出

每个模块都可以**可选**的导出一个默认导出对象。
默认导出对象使用 `default` 关键字标记，而且每个模块仅能有一个默认导出。
导入默认导出对象的方式**略有不同**。

以 JQuery 为例：

```ts
// JQuery.d.ts
declare let $: JQuery;
export default $;
```

```ts
// App.ts
import $ from 'JQuery';
```

**类和函数声明**可以直接作为 `default` 导出，而且可以是**匿名声明**。

```ts
export default function() {
  return 'hello, mm';
}
```

其他声明则不能直接使用 `default` 导出：

```ts
export default const mm = 'good boy';
// ERROR       ~~~~~ Expresion expected!
```

默认导出对象也可以仅仅是**值**：

```ts
export default '123';
```

## `export =` 和 `import = require()`

为了兼容 CommonJS 和 AMD 模块，TS 引入 `export =` 和 `import = require()` 语法。

`export =` 用于导出模块的单个对象，可以是类、接口、命名空间、函数和枚举。
对于这种模块，必须使用 `import module = require('module')` 语法导入。

```ts
// StringValidator.ts
interface StringValidator {
  isAcceptable(s: string): boolean;
}
export = StringValidator;
```

```ts
// App.ts
import SV = require('./StringValidator');
```

注意，只有在目标代码模块为 CommonJS 和 AMD 时才能使用此做法。

## 代码生成

TS 支持生成以下格式的模块：

* CommonJS（Node.js）
* AMD (require.js)
* UMD (isomorphic)
* SystemJS
* ES6

### 动态加载

在 JS 应用中，常常要用到**动态加载**功能。
在 TS 中也能实现此功能，但是又如何同时保持类型检查功能呢？毕竟模块是运行时才加载的。

编译器会检查每个模块是否在生成的代码中有被用到。
如果一个模块导出对象在被引用时，**仅仅**被用在**类型注解**中，而**不在任何表达式**中，那么在生成的代码中就不会产生对此模块的 `require` 调用。
这种方式有助于提高性能，也正是实现动态加载原因。

举个栗子：

```ts
// Dynamic Module Loading in Node.js
declare function require(moduleName: string): any;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";
if (needZipValidation) {
  let ZipCodeValidator: typeof Zip = require("./ZipCodeValidator");
  let validator = new ZipCodeValidator();
  if (validator.isAcceptable("...")) { /* ... */ }
}
```

上面从 `./ZipCodeValidator` 中引入 `Zip` ，但是 `Zip` 仅仅用在类型注解中，没有任何表达式用到了它，所以在生成代码时，不会产生对 `./ZipCodeValidator` 的 `require` 调用。

与此同时，为了保持类型检查，这里使用了 `typeof` 。
`typeof` 运算用在类型注解中时，产生的是一个类型，在上面的例子中产生的类型就是模块类型。
这样，编译的时候就可以对类型 `ZipCodeValidator` 进行类型检查。

其他模块方式下的例子如下：

```ts
// Dynamic Module Loading in require.js
declare function require(moduleNames: string[], onLoad: (...args: any[]) => void): void;

import  * as Zip from "./ZipCodeValidator";
if (needZipValidation) {
  require(["./ZipCodeValidator"], (ZipCodeValidator: typeof Zip) => {
    let validator = new ZipCodeValidator.ZipCodeValidator();
    if (validator.isAcceptable("...")) { /* ... */ }
  });
}
```

```ts
// Dynamic Module Loading in System.js
declare const System: any;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";
if (needZipValidation) {
  System.import("./ZipCodeValidator").then((ZipCodeValidator: typeof Zip) => {
    var x = new ZipCodeValidator();
    if (x.isAcceptable("...")) { /* ... */ }
  });
}
```


## 使用第三方库

为了描述非 TS 编写的第三方库，我们可以使用**声明**（Declaration）来描述其所暴露的 API 。

这些不包含实现的声明称为 Ambient ，它们被定义在 `.d.ts` 文件中，作用与 C/C++ 中的 `.h` 头文件类似。

### Ambient 模块

在 Node.js 中，大部分的功能都是通过模块来实现的。
我们可以为内置模块单独定义一个 `.d.ts` 文件来描述其导出接口，但是更便捷的做法是把所有内置模块定义在同一个 `.d.ts` 文件中。
为此，我们使用 `module` 关键字来表明模块名称。

```ts
// node.d.ts
declare module "url" {
  export interface Url {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }
  export function parse(urlStr: string, parseQueryString?, slashesDenoteHost?): Url;
}
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

定义好之后，便可以使用 `/// <reference path="node.d.ts"/>` 来引用此文件，并且引入模块：

```ts
/// <reference path="node.d.ts"/>
import url = require('url');
```

如果觉得像上面那样细致的定义声明很麻烦，那么可以使用**速记声明**（Shorthand Declaration）：

```ts
// declarations.d.ts
declare module "hot-new-module";
```

这样的话，从 `hot-new-module` 模块导入的对象都是 `any` 类型：

```ts
import X, {Y} from 'hot-new-module';
X(Y); // => X has any type
```

一些模块加载器如 SystemJS 和 AMD 允许加载非 JS 内容。
它们的做法通常是使用**前缀**或者**后缀**来表明特殊内容的加载方式。
**通配符模块声明**可用于这种场景。

```ts
declare module "*!text" {
  const content: string;
  export default content;
}
// Some do it the other way around.
declare module "json!*" {
  const value: any;
  export default value;
}
```

```ts
import fileContent from "./xyz.txt!text";
import data from "json!http://example.com/data.json";
```

对于 UMD 或 Isomorphic 模块，它们可以被作为一个模块引入或者直接引用全局变量。
这种情况下使用以下方式声明：

```ts
// math-lib.d.ts
export function isPrime(x: number): boolean;
export as namespace mathLib;
```

这样的话，就可以通过 `import` 导入：

```ts
import { isPrime } from "math-lib";
isPrime(2); // => ok
mathLib.isPrime(2); // => error
```

或者使用全局变量：

```ts
mathLib.isPrime(2);
```

全局变量方式**仅仅适用于脚本**内，也就是没有导入和导出的脚本内。

## 模块组织指引

### 尽量导出顶层对象，以防访问层次过深

模块的导出内容应该尽量简单，易于理解，避免造成开发者困惑。太多的嵌套层次会使得模块变得笨重。

在模块中导出命名空间就是嵌套太多层次的常见问题。命名空间有其用武之地，但是在模块导出中新增一层命名空间通常是没必要的。

* 如果仅导出一个类或者函数，那么请使用 `export default`，这样的话，开发者就无需知道模块导出名称是是什么。
* 如果需要导出多个对象，那么请把它们都作为顶层对象导出

### 使用重新导出来实现拓展

当需要拓展模块的功能时，最常用的方法是直接在原对象上拓展，JQuery 插件用的就是这种方法。
但是在 TS 中，我们推荐**不修改原对象**，而是重新导出一个对象来新增模块功能。

类似于优先使用继承来拓展策略。

### 不在模块中使用命名空间

命名空间主要用于在**全局环境**中避免命名冲突。但是模块是一个独立的环境，在这个环境中，开发者有足够的理由保证命名不会冲突。

### 检查红线

如果存在以下行为，那么很可能是错误的模块组织用法：

1. 模块的顶层声明为 `export namespace Foo { ... }`（应该移除 `Foo` 并把导出内容提高一个层次）
2. 模块中只有一个 `export class` 或 `export function` (应该使用 `export default` )
3. 多个模块有相同的顶层 `export namespace Foo {` （千万别以为它们会合并到对象 `Foo` ）