---
layout: post
title: TypeScript 命名空间
tags: typescript,namespaces
desc: "TypeScript 快速手册：命名空间"
---

在 TS 中，还可以使用**命名空间**（Namespaces）来组织代码。
命名空间在旧版 TS 中曾经称为**内部模块**。
任何使用 `module` 来声明内部模块的地方，都可以使用 `namespace` 代替，并且这是现在的推荐做法。

命名空间的作用是把相关的实体关联在一起，同时避免造成命名冲突。

## 命名空间用法

命名空间可以形成一个新的隔绝空间，在这个隔绝空间里，只有导出部分才能被外部感知。

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

let validators: { [s: string]: Validation.StringValidator; } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
Validation.lettersRegexp;
// error   ~~~~~~~~~~~~~ Property 'lettersRegexp' does not exist on type 'typeof Validation'.
```

上面的代码中，命名空间 `Validation` 内部就是一个隔绝空间（与作用域类似），只有 `export` 才能在外界访问，如 `StringValidator` ；像 `lettersRegexp` 一样的未导出对象，是无法访问的。

## 多文件命名空间

当应用足够大时，把同一个命名空间相关的代码放到同一个文件变得不太好管理，这时可以放到多个文件中。
但是需要用引用标签标注依赖关系。

```ts
// file Validation.ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
}
```

```ts
/// <reference path="Validation.ts" />

// file LettersOnlyValidator.ts
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/;
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}
```

```ts
/// <reference path="Validation.ts" />

// file ZipCodeValidator.ts
namespace Validation {
  const numberRegexp = /^[0-9]+$/;
  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}
```

```ts
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// file Test.ts
let validators: { [s: string]: Validation.StringValidator; } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
```

一旦涉及多个文件，我们就需要确保所有编译后的文件已被加载。有两种办法：

第一种，使用 `--outFile` 把所有相关文件合并在一起并输出到统一的文件中：

```ts
tsc --outFile sample.js Test.ts
```

另一种，在默认编译行为，每个文件单独编译输出，但是我们需要使用 `<script>` 按序逐个去引用：

```ts
<script src="Validation.js" type="text/javascript" />
<script src="LettersOnlyValidator.js" type="text/javascript" />
<script src="ZipCodeValidator.js" type="text/javascript" />
<script src="Test.js" type="text/javascript" />
```

## 别名

如果命名空间的层次很深，那么使用时对它的引用将变得很长，形如 `a.b.c.d.e` 。
为了简化这个过程，可以使用 `import q = a.b.c.d.e` 语法来创建别名。
注意与模块加载 `import x = require('name')` 语法的区别，这种语法仅仅用来创建别名。

这种别名方式可用于所有变量，包括从模块中导入的对象。

```ts
namespace Shapes {
  export namespace Polygons {
    export class Triangle { }
    export class Square { }
  }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square();

import Square = polygons.Square;
let square = new Square();
```

这种语法跟 `var` 很像，不同的是别名可以用在类型和命名空间上，但是使用 `var` 的却不行。

```ts
namespace Shapes {
  export namespace Polygons {
    export class Triangle { }
    export class Square { }
  }
}

import SQ = Shapes.Polygons.Square;
let sq: SQ = new SQ();
var ST = Shapes.Polygons.Triangle;
let st: ST = new ST(); // error, Cannot find name 'ST'
```

## 在第三方库中的使用

跟模块一样，命名空间也有 Ambient Namespaces ，也是在 `.d.ts` 文件中。
如 D3 使用了全局变量 `d3` ：

```ts
// file D3.d.ts
declare namespace D3 {
  export interface Selectors {
    select: {
      (selector: string): Selection;
      (element: EventTarget): Selection;
    };
  }

  export interface Event {
    x: number;
    y: number;
  }

  export interface Base extends Selectors {
    event: Event;
  }
}

declare var d3: D3.Base;
```

## 模块 vs. 命名空间

模块和命名空间都可以包含实现代码和声明。

命名空间是全局环境中一个简单的 JS 对象。
因此，就像全局命名污染一样，我们很难辨别组件的依赖是什么，尤其是在大型应用中。

与命名空间不同的是，模块还声明了它的依赖。
同时，模块也依赖模块加载器。

使用模块可以获得更好的代码复用、更强的隔离以及更好的打包工具支持。

### 注意事项

* 使用 `/// <reference>` 加载模块

一个常见的误解是使用 `/// <reference ... />` 语法来引用模块，而不是使用 `import` 。
为了理解这个问题，首先要知道编译器是如何基于 `import` 路径来定位模块类型信息的。

编译器会先根据路径尝试找出 `.ts`、`.tsx` 文件，然后是 `.d.ts` 文件。
如果没有找到模块文件，然后编译器会寻找 Ambient 模块声明。

```ts
/// <reference path="myModules.d.ts" />
import * as m from "SomeModule";
```

这里编译器可以根据引用标签定位声明文件。`node.d.ts` 就是用的这种做法。

* 不必要的命名空间

任何两个不同模块是独立的，互不影响的。所以没必要再模块中又包含一层命名空间，这会使得模块变得啰嗦。如：

```ts
// file shapes.ts
export namespace Shapes {
  export class Triangle { /* ... */ }
  export class Square { /* ... */ }
}
```

```ts
// file shapeConsumer.ts
import * as shapes from "./shapes";
let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
```

## 模块的权衡

就像 JS 中文件和模块是一对一的关系，TS 的模块源文件和输出文件也是**一对一**关系。
这种一对一方式的弊端之一就是无法基于目标模块格式把多个源文件合并起来。
举例来说，TS 不能使用 `--outFile` 选项来输出 `commonjs` 或 `umd` 模块，但是从 v1.8 开始，可以使用 `--outFile` 选项来输出 `amd` 或 `system` 模块。

这也就是 TS 本身没有打包功能的原因。