---
title: 深入理解 TS 声明文件原理
createdDate: 2018-01-28
tags: typescript,declaration
desc: "深入理解 TypeScript 声明文件原理"
---

使用模块来构建确切的 API 形状可能会非常棘手。
比如，我们可能需要一个既可以使用 `new` 又可以不使用 `new` 类类型模块。

本文讲解了一些有用的方法，来帮助我们定义拥有良好接口但却复杂的声明文件。
内容主要聚焦在**库模块**，因为这些库的运行行为往往取决于向他们传入的选项，而这些选项是多变的。
如果理解了复杂的用法，那么简单的用法就轻而易举了。

## 核心概念

通过理解 TS 运行机制中的一些核心概念，可以帮助我们理解如何去定义形状的声明。

### 类型（Types）

在 TS 中，**创建类型**有以下方式：

* 类型别名声明（`type sn = number | string`）
* 接口声明 （`interface I { x: number[] }`）
* 类声明（`class C {}`）
* 枚举声明（`enum E { A, B, C}`）
* 引用类型的导入声明（`import IOptions from './a'`）

### 值（Values）

值是我们可以在表达式中引用的运行时名称，例如，`let x = 5;` 创建了一个称为 `x` 的值。

在 TS 中，**创建值**有以下方式：

* `let`，`const` 和 `var` 声明
* `enum` 声明
* `class` 声明
* `function` 声明
* 包含值的 `namespace` 和 `module` 声明
* 引用值的 `import` 声明

### 命名空间（namespaces）

类型是可以包含在命名空间中的。
例如，对于声明 `let x: A.B.C;` ，我们可以说类型 `C` 来自于命名空间 `A.B` 。
在这里，这种区别很微妙，但是却很重要，`A.B` 并不一定是一种类型或者值。

## 简单合并（Combination）：一个名称，多种含义

给定名称 `A` ，它最多可以有三种不同的含义：一种类型，一个值或者一个命名空间。该名称的解析取决于它在上下文中的使用方式。比如，在声明 `let m: A.A = A;` 中，`A` 首先被解析为命名空间，然后是类型，最后是值。不同的含义最终可能引用自完全不同的声明。

这种用法看起来会让人觉得混乱且疑惑，但实际上用起来会非常方便，只要我们不过分的重载它。

下面是一些非常有用的合并行为。

### 内建合并（Built-in Combinations）

聪明的你可能通过上文已经发现，`class` 既可以用来创建类型又可以用来创建值。声明 `class C {}` 创建了两种东西：一种是指向类实例形状的类型 `C` ，一种是指向构造函数的值 `C` 。
有类似行为的还有枚举声明。

### 用户合并（User Combinations）

假如有一个模块文件 `foo.d.ts` :

```ts
export var SomeVar: { a: SomeType };
export interface SomeType {
  count: number;
}
```

然后，我们使用它：

```ts
import * as foo from './foo';
let x: foo.SomeType = foo.SomeVar.a;
console.log(x.count);
```

上面的用法完全没问题，但是如果注意观察，我们会发现 `SomeType` 和 `SomeVar` 有非常紧密的关联，以至于我们希望它们能合并在同一个名称中。

那么我们可以这样写，把它们都放在名称 `Bar` 中：

```ts
export var Bar: { a: Bar };
export interface Bar {
  count: number;
} 
```

这样的话，就可以为我们使用代码带来更好的便利：

```ts
import { Bar } from './foo';
let x: Bar = Bar.a;
console.log(x.count);
```

可以看出，此时 `Bar` 既是类型也是值。

### 高级合并（Advanced Combination）

有些种类的声明可以跨越多个声明然后结合在一起。比如，`class C {}` 和 `interface C {}` 能够同时存在，并且会合并形成类型 `C` 。

在不引发不产生冲突的情况下，这种同名写法是**合法的**。
判断是否冲突的经验规则是：

* 除非被声明为命名空间，否则值总是和其他同名值冲突
* 使用类型别名声明的同名类型总是会冲突
* 命名空间永远不会冲突

下面来看看合并的应用场景。

#### 使用 `interface` 来合并

可以使用 `interface` 声明来给同名的接口**新增成员**。例如：

```ts
// 已经存在的接口
interface Foo {
  x: number;
}

// 在别处，给 Foo 新增成员
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // => ok
```

也可以给同名的类新增成员：

```ts
// 已存在的类
class Foo {
  x: number;
}

// 在别处，给类 Foo 新增成员
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // => ok
```

也就是说，可以使用 `interface` 来拓展现有接口或类。但是，要注意的是，这种方式**不能拓展类型别名**。

#### 使用 `namespace` 来合并

在不引发冲突的情况下，可以使用命名空间声明来新增类型，值以及命名空间。

例如，我们可以给类新增一个静态成员：

```ts
// 已存在的类
class C {}

// 在别处，拓展 C
namespace C {
  export let x: number;
}
let y = C.x; // => ok
```

上面的例子中，我们仅仅给 `C` 的静态面新增了一个值。这是因为我们新增的是值 `x` ，而值的容器必须是另一个值（在这里，这个值就是 `C` 的构造函数）。类型的容器是命名空间，命名空间的容器是另一个命名空间。

也可以给类新增带命名空间 `C` 的类型：

```ts
// 已存在的类
class C {}

// 在别处，拓展 C
namespace C {
  export interface D {}
}
let y: C.D; // => ok
```

例子中，在我们使用 `namespace` 声明 `C` 之前是不存在命名空间 `C` 的。但是 `C` 作为命名空间并不会和它作为类型或者值的含义相冲突，所以声明它为命名空间是允许的。

使用 `namespace` 声明可以进行多种不同的合并。来看一个复杂但是并不太符合应用的例子，它能帮助我们理解所有合并行为。

```ts
// 已存在的 X
namespace X {
  export interface Y { }
  export class Z { }
}

// 在别处，拓展 X
namespace X {
  export var Y: number;
  export namespace Z {
    export class C { }
  }
}
type X = string;
```

上例中的第一段代码创建了以下名称含义：

* 值 `X` （因为 `namespace` 声明包含值 `Z`）
* 命名空间 `X` （因为 `namespace` 声明包含类型 `Y`）
* 命名空间 `X` 下的类型 `Y`
* 命名空间 `X` 下的类型 `Z` （类实例的形状）
* 值 `Z` 作为值 `X` 的属性 （类类型的构造函数）

第二段代码则创建了以下名称含义：

* 值 `Y` 作为值 `X` 的属性
* 命名空间 `Z`
* 值 `Z` 作为值 `X` 的属性 （因为 `namespace` 声明包含值 `C`）
* 命名空间 `X.Z` 下的类型 `C`（类实例的形状）
* 值 `C` 作为值 `X.Z` 的属性（类类型的构造函数）
* 类型 `X` （类型别名）

#### 使用 `export =` 和 `import`

记住，`export` 和 `import` 声明会导出或引入目标对象名称包含的**所有含义**。