---
title: TypeScript 模块解析
createdDate: 2018-01-02
tags: typescript,module resolution
desc: "TypeScript 快速手册：模块解析"
---

## 概念

模块解析是编译器**定位并解析**模块的过程。
例如，对于导入语句 `import { a } from 'moduleA';` ，为了掌握 `a` 到底是什么，编译器首先需要定位 `moduleA` 所在的文件，然后从中解析出 `a` 的定义。

TS 编译器支持两种不同的模块解析策略：Classic 和 Node 。
这些策略会告诉编译器去哪里寻找模块。如果最终没有找到，那么编译器会抛出找不到模块的错误。

## 相对路径 vs. 非相对路径

根据模块标识是否是相对路径，会使用很不同的定位策略。

**相对路劲导入**（Relative Import）使用 `/`、`./` 和 `../`开头，如：

```ts
import Entry from './components/Entry';
import { DefaultHeaders } from '../constants/http';
import '/mod';
```

除相对路径导入以外的其他情况都称为**非相对路劲导入**，如：

```ts
import * as $ from 'jquery';
import { Component } from '@angular/core';
```

相对路劲导入**只能用于定位模块文件**，而**不能用于定位 Ambient 模块声明**。
开发者应该在能确保运行时相对路径不变的情况下才能使用相对路径导入。

注意： Ambient 模块声明不代表一个 `.d.ts` 文件。

非相对路径导入定位文件基于 `baseUrl` 参数，或者路径映射。它同时也能用于定位 Ambient 模块声明。
开发者应该在导入外部依赖时使用非相对路径导入。

## 模块解析策略

TS 支持 Node 和 Classic 两种解析策略，开发者可以通过 `--moduleResolution` 选项来选择其中一种。
如果未指定，那么默认的策略是： `--module AMD | System | ES2015` 使用 Classic ，其他情况使用 Node 。

### Classic

这是 TS 的默认解析策略，现在主要用来向后兼容。

相对路径导入会以当前文件的路径为基础路径来定位文件。
所以对于文件 `/root/src/folder/A.ts` 中的 `import { b } from "./moduleB"` ，编译器会按序查找以下文件：

1. `/root/src/folder/moduleB.ts`
2. `/root/src/folder/moduleB.d.ts`

对于非相对路径导入，编译器会从当前路径开始逐层往上查找。
所以对于文件 `/root/src/folder/A.ts` 中的 `import { b } from "moduleB"` ，编译器会按序查找以下文件：

1. `/root/src/folder/moduleB.ts`
2. `/root/src/folder/moduleB.d.ts`
3. `/root/src/moduleB.ts`
4. `/root/src/moduleB.d.ts`
5. `/root/moduleB.ts`
6. `/root/moduleB.d.ts`
7. `/moduleB.ts`
8. `/moduleB.d.ts`

### Node

Node 策略模仿 Node.js 的运行时模块解析机制。附：[完整的 Node.js 解析机制](https://nodejs.org/api/modules.html#modules_all_together)

#### Node.js 模块解析简介

Node.js 使用 `require()` 函数来导入模块。
它会根据相对路径或者非相对路径来进行不同的操作。

* 相对路径

对于文件 `/root/src/moduleA.js` 中的 `var x = require("./moduleB");` ， Node.js 会按序进行以下查找：

1. 文件 `/root/src/moduleB.js` 是否存在；
2. 路径 `/root/src/moduleB` 下的 `package.json` 文件中 `main` 字段指向的文件；
3. 路径 `/root/src/moduleB` 下的 `index.js` 文件；

* 非相对路径

非相对路径下会查找特殊路径 `node_modules` 。

对于文件 `/root/src/moduleA.js` 中的 `var x = require("moduleB");` ， Node.js 会按序进行以下查找：

1. `/root/src/node_modules/moduleB.js`
2. `/root/src/node_modules/moduleB/package.json` 中 `main` 字段
3. `/root/src/node_modules/moduleB/index.js`
4. `/root/node_modules/moduleB.js`
5. `/root/node_modules/moduleB/package.json` 中 `main` 字段
6. `/root/node_modules/moduleB/index.js`
7. `/node_modules/moduleB.js`
8. `/node_modules/moduleB/package.json` 中 `main` 字段
9. `/node_modules/moduleB/index.js`

#### TS Node 模块解析

TS 在 Node.js 模块解析策略的基础上做了两点更改：

1. 文件拓展名换成了 `.ts`、`.tsx` 和 `.d.ts`
2. `package.json` 中使用 `types` 代替 `main` 字段

* 相对路径

对于文件 `/root/src/moduleA.ts` 中的 `import { b } from "./moduleB"` ， TS 会按序进行以下查找：

1. `/root/src/moduleB.ts`
2. `/root/src/moduleB.tsx`
3. `/root/src/moduleB.d.ts`
4. `/root/src/moduleB/package.json` 中 `types` 字段
5. `/root/src/moduleB/index.ts`
6. `/root/src/moduleB/index.tsx`
7. `/root/src/moduleB/index.d.ts`

* 非相对路径

对于文件 `/root/src/moduleA.ts` 中的 `import { b } from "moduleB"` ， TS 会按序进行以下查找：

1. `/root/src/node_modules/moduleB.ts`
2. `/root/src/node_modules/moduleB.tsx`
3. `/root/src/node_modules/moduleB.d.ts`
4. `/root/src/node_modules/moduleB/package.json` 中 `types` 字段
5. `/root/src/node_modules/moduleB/index.ts`
6. `/root/src/node_modules/moduleB/index.tsx`
7. `/root/src/node_modules/moduleB/index.d.ts`
8. `/root/node_modules/moduleB.ts`
9. `/root/node_modules/moduleB.tsx`
10. `/root/node_modules/moduleB.d.ts`
11. `/root/node_modules/moduleB/package.json` 中 `types` 字段
12. `/root/node_modules/moduleB/index.ts`
13. `/root/node_modules/moduleB/index.tsx`
14. `/root/node_modules/moduleB/index.d.ts`
15. `/node_modules/moduleB.ts`
16. `/node_modules/moduleB.tsx`
17. `/node_modules/moduleB.d.ts`
18. `/node_modules/moduleB/package.json` 中 `types` 字段
19. `/node_modules/moduleB/index.ts`
20. `/node_modules/moduleB/index.tsx`
21. `/node_modules/moduleB/index.d.ts`

看似很长，但请不要被吓到，其实都是逐层往上一级路径进行相同的查找。

### 模块解析的相关选项

注意，编译器并**不会改变**模块引用标识符，它仅用模块引用标识符来定位文件。

* `baseUrl`

`baseUrl` 告诉编译器去哪里查找模块。所有的非相对路径都将基于 `baseUrl` 来定位，不影响相对路径名称。

`baseUrl` 使用以下方式来确定：

1. `baseUrl` 的命令行参数
2. `tsconfig.json` 中的 `baseUrl` 属性

* `paths`

`paths` 用来创建路径映射，类似于路径别名。
`paths` 定义于 `tsconfig.json` 中的编译选项中。


```json
{
  "compilerOptions": {
    "baseUrl": ".", // 使用 paths 时，该选项必须指定
    "paths": {
      "jquery": ["node_modules/jquery/dist/jquery"], // 路径基于 baseUrl
    }
  }
}
```

像上面配置好后，代码中就可以直接 `import * as $ from 'jquery'` 。

`paths` 中还可以使用通配符来实现更复杂的情况。例如：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": [
        "*",
        "generated/*"
      ]
    }
  }
}
```

它告诉编译器任何匹配中 `*` 的模块路径，在以下两个地方查找模块：

1. `"*"`： 不改变名称，`<moduleName> => <baseUrl>/<moduleName>`
2. `generated/*`：在模块路劲前增加前缀 `generated`，`<moduleName> => <baseUrl>/generated/<moduleName>`

注意，这种使用方式不利于与 webpack、rollup 等打包工具的使用。在打包工具中，可能找不到对应的模块。

* `rootDirs`

有时，我们想要多个路径下的文件经过编译后输出到相同的路径。
这可以被看做是多个源路径合并成一个虚拟路径。
`rootDirs` 可以帮助我们创建这种虚拟路径，从而让编译器解析虚拟路径中的模块，就好像它们真的在同一个路径中一样

例如，对于以下文件路径：

```
src
└── views
    └── view1.ts (imports './template1')
    └── view2.ts
generated
└── templates
        └── views
            └── template1.ts (imports './view2')
```

`view1.ts` 中有 `import template from './template1'`，且 `template1.ts` 中有 `import view from './view2'` 。很明显，在正常情况下，编译器无法解析到模块 `'./template1'` 和 `'./view2'` 。

但是，通过设置 `rootDirs` 可以它正常工作：

```json
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates/views"
    ]
  }
}
```

它告诉编译器： 编译时，把 `src/views` 和 `generated/templates/views` 两个路径下的文件当做是在相同的路径下。
这样的话，对于 `src/views` 和 `generated/templates/views` 中的每个文件，每次编译器遇到一个相对路径时，它都会尝试从 `rootDirs` 的每个路径中查找。

注意，`rootDirs` 只能用在 `tsconfig.json` 中，不能用在命令行。

* `--traceResolution`

开启 `--traceResolution` 选项后，使用 `tsc` 命令会打印出详细的模块解析过程。
包括使用的解析策略、详细路径等。

* `--noResolve`

默认的，编译器会在编译之前尝试定位所有的模块文件。
每成功定位一个模块文件，就会把它加入到编译名单中。

开启 `--noResolve` 选项会阻止编译器把定位到的文件加入到编译名单中，除非在命令行中显式指定。

例如：

```ts
//file app.ts
import * as A from 'moduleA'; // => ok
import * as B from 'moduleB'; // => error, Cannot find module 'moduleB'
```

```bash
tsc app.ts moduleA.ts --noResolve
```

因为命令行中并未传入 `moduleB` ，所以不会解析它。