---
layout: post
title: TypeScript 三斜杠指令
tags: typescript,triple-slash directive
desc: "TypeScript 快速手册：三斜杠指令"
---

三斜杠指令（Triple-Slash Directive）是包含一个 XML 标签的单行注释，其内容会作为**编译指令**。

该指令只有出现在文件**最顶部**时才会被编译器识别。
也即，该指令之前不能出现任何其他语句或声明，否则无效。

## `/// <reference path="..." />`

该指令是最常用的一种，它指明了声明文件的依赖关系。

它有两种作用：

1. 告诉编译器在编译过程中把指定文件添加进来进行编译。
2. 当使用 `--out` 或 `--outFile` 时，作为对输出文件进行排序的方法。文件内容被输出到输出文件中的顺序同它们被输入的顺序。

### 预处理输入文件

编译器会对输入文件进行预处理（Preprocess），以解析其中的三斜杠指令。
在这个过程中，指定的额外文件被载入到编译器中。

处理过程是从**根文件**（Root File）开始的，这些根文件就是命令行中指定的文件或者 `tsconfig.json` 中 `files` 列表指定的文件。
根文件的预处理顺序与它们的指定顺序一致。在把根文件载入到编译器之前，所有的三斜杠指令会以**深度优先**的方式被解析，从而把指定的文件载入。

三斜杠指令中的路径如果不是绝对路径的话，是以当前文件来作为相对路径解析的。

### 错误处理

引用不存在的文件或者引用当前文件自己都会导致编译错误。

### 使用 `--noResolve` 选项

如果开启 `--noResolve` 选项，那么三斜杠指令将不起任何效果，也即关闭禁用了三斜杠指令。

## `/// <reference types="..." />`

该指令也是用来指明对声明的依赖关系，只不过它的依赖是 NPM 包而不是文件。

包名的解析过程跟模块包名的解析是一样的，也可以理解为该指令就是对声明文件包的 `import` 语句。
例如 `/// <reference types="node" />` 会解析为 `@types/node/index.d.ts` 文件。

注意，只有在自己写 `.d.ts` 文件时，才需要使用该指令。

对于通过编译产生的声明文件，编译器会自动加上该指令。
当且仅当生成的目标文件使用了相关声明时，才会在最后产生的声明文件中加上这个指令。

对于依赖的 `@types` 包，可以使用命令行参数 `--types` 指定或者在 `tsconfig.json` 中配置。更多细节请查看[相关配置](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types)。

## `/// <reference no-default-lib="true"/>`

该指令会标记当前文件为**默认库**（Default Library）。我们可以在 [lib.d.ts](https://github.com/Microsoft/TypeScript/blob/master/lib/lib.d.ts) 中看到它及其变种。

它指示编译器**不要**在编译时载入默认库（如 `lib.d.ts` ），以提高性能。作用相当于命令行参数 `--noLib` 。
同时也要注意，`--skipDefaultLibCheck` 选项只会跳过包含该指令的文件。

## `/// <amd-module />`

AMD 模块默认是异步生成的。当使用其他工具（如打包工具 `r.js` ）处理生成的文件时，这可能会导致出错。

该指令允许传入一个可选的模块名称给编译器：

```ts
// amdModule.ts
/// <amd-module name="NamedModule"/>
export class C {}
```

这样的话，输出文件的 `define` 中就会使用这个名字：

```ts
// amdModule.js
define("NamedModule", ["require", "exports"], function (require, exports) {
  var C = (function () {
    function C() {
    }
    return C;
  })();
  exports.C = C;
});

```