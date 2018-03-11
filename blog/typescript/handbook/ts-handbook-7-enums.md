---
title: TypeScript 枚举
createdDate: 2017-12-24
tags: typescript,handbook,enum
desc: "TypeScript 快速手册：枚举"
---

**枚举**是一系列相关常量的集合，用来更好的说明代码意图。TS 支持基于**数值或字符串**的枚举类型，使用关键字 `enum` 定义。最新的 JS 标准里**没有**与枚举类型对应的相关定义。

## 数值型枚举

数值型枚举是**默认的**枚举类型，每个枚举成员都是 `number` ，没有显式初始值的成员自动推导为前向最近初始值的递增值。第一个成员默认值为 0 。

```ts
enum Direction {
  Up = 1,
  Down,   // => 2
  Left,   // => 3
  Right,  // => 4
}
```

注意，没有初始值的成员必须是第一个成员或者在使用常量（数值常量或者枚举常量）初始化的成员之后。

## 字符型枚举

字符型枚举的**每个成员都必须初始化**为字符串常量或者其他字符型枚举成员，不能缺少初始值，因为它无法像数值型枚举成员一样可以进行自动递增推导。

```ts
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}
```

与数值型枚举相比，字符型枚举具备的一个优势是对程序**调试更加友好**。调试时，字符型枚举值可以**直接**通过字符串辨别其用途，但是数值型枚举值只能**直接**看到数值本身，而不知其具体含义，虽然可以通过下文的反向映射得知其成员名称，但是远不如字符型枚举值来得直接。

TS 并没有禁止数值型和字符型成员混合在同一个枚举类型中，但是并**不建议**这样做。如下面的定义是合法的：

```ts
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

## 计算成员和常量成员

枚举成员的值可以是**常量值**或者**计算值**。

常量值包括：

1. 第一个成员，且没有初始化，默认为 0
2. 没有初始化，但是前向成员中有数值常量
3. 初始化为**常量枚举表达式**

其中，常量枚举表达式是指可以在**编译时**就能计算出确定值的表达式，包含以下情况：

1. 字面量表达式，如 `1 + 1`
2. 引用已定义的枚举成员，如 `Direction.Up`
3. 加括号的枚举表达式，如 `(Direction.Up)`
4. 一元操作符 `+`、`-` 和 `~` 运算，如 `+Direction.Up`
5. 二元操作符 `+`、`-`、`*`、`/`、`%`、`<<`、`>>`、`>>>`、`&`、`|` 和 `^` 运算，如 `Direction.Up+Direction.Down`

第 5 点中，如果计算值为 `NaN` 或者 `Infinity` 则会抛出**编译错误**。

常量值以外的其他情况都是**计算值**，如 `'123'.length` 。

## 联合枚举和枚举成员类型

当一个枚举的所有成员都是**字面量枚举成员**时，该枚举类型会有**额外的语义**。

所谓字面量枚举成员是指没有初始化的常量枚举成员或者初始值为以下三种情况的成员：

1. 字符串字面量
2. 数值字面量
3. 负号操作符运算的数值字面量，如 `-100`

额外的语义包含两种：

1. 每个枚举成员变成一种**新类型**

```ts
enum ShapeKind {
  Circle, // Circle type
  Square, // Square type
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}

let c: Circle = {
  kind: ShapeKind.Square, // => error, must be Circle type
  radius: 100,
}
```

2. 枚举类型本身变成了每个成员类型组成的**联合类型**

枚举类型变成联合类型后，编译器就可以知道枚举具体包含该了哪类型值，这可以帮助开发者**避免一些低级错误**。（联合类型以后会详细说明，暂且可以忽略）

```ts
enum E {
  Foo,
  Bar,
}
function f(x: E) {
  if (x !== E.Foo || x !== E.Bar) {
    //               ~~~~~~~~~~~
    // Error! Operator '!==' cannot be applied to types 'E.Foo' and 'E.Bar'.
  }
}
```

上面的例子中，首先检查 `x` 是否不是 `E.Foo` 。如果不是 `E.Foo` ，那么 `||` 运算会被短路，直接执行 `if` 代码块内容。如果是 `E.Foo` ，那么 `x` 就只能是 `E.Foo` ， `x !== E.Bar` 也肯定为真，然后也会执行 `if` 代码块内容。所以，发现了猫腻没？不管 `x` 为何值，`if` 代码块**总是会执行**，这可能与开发者想要的逻辑有所背离。

## 运行时枚举

运行时枚举就是**普通对象**。

```ts
enum E {
  X, Y, Z
}
function f(obj: { X: number }) {
  return obj.X;
}
f(E); // => ok，类型兼容，E 也有 X 属性
```

### 反向映射（Reverse mappings）

**数值型枚举**拥有反向映射功能，它可以通过值获取枚举成员名称。

```ts
enum Enum {
  A
}
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

实际上，`Enum` 编译后为：

```ts
var Enum;
(function (Enum) {
  Enum[Enum["A"] = 0] = "A";
})(Enum || (Enum = {}));
```

注意，字符型枚举没有这种功能。

### 常量枚举

常量枚举能**减小编译后的代码量**。例如，对于下面的代码：

```ts
enum Directions {
  Up,
  Down,
  Left,
  Right
}
let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right]
```

编译后为：

```ts
var Directions;
(function (Directions) {
    Directions[Directions["Up"] = 0] = "Up";
    Directions[Directions["Down"] = 1] = "Down";
    Directions[Directions["Left"] = 2] = "Left";
    Directions[Directions["Right"] = 3] = "Right";
})(Directions || (Directions = {}));
var directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right];
```

但如果是常量枚举，即声明时加上 `const` 变成 `const enum Directions` ，那么生成的代码就少了很多了，使用枚举成员的地方直接替换成了具体的值：

```ts
var directions = [0 /* Up */, 1 /* Down */, 2 /* Left */, 3 /* Right */];
```

### 环境枚举（Ambient enums）

环境枚举用来描述已存在枚举的形状。

```ts
declare enum Enum {
  A = 1,
  B,
  C = 2
}
```