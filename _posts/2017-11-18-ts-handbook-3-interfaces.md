---
layout: post
title: TypeScript 接口
tags: typescript,handbook,interface
desc: "TypeScript 快速手册：接口"
---

类型检查只关注目标类型的**形状**（Shape），这是 TS 最核心的理念之一。对于对象来说，形状是指该对象拥有哪些成员（属性和方法）以及属性的读写性质。接口就是 TS 定义形状的方式。

## 接口定义

TS 的类型检查有以下特点：

* 只检查**形状**
* 宽泛检查策略：至少包含指定类型（At least），允许多余的其他属性
* 无关声明顺序

接口定义有两种方式：

* 使用 `interface` 定义一个**具名接口**
* 使用 `{}` 定义一个**匿名接口**

```ts
// 具名接口
interface LabelValued {
  label: string;
}
function printLabel(labelledObj: LabelValued) {
  console.log(labelledObj.label);
}
```
```ts
// 匿名接口
function printLabel(labelledObj: { label: string }) {
  console.log(labelledObj.label);
}
```

以上两种方式等效，编译器都会要求参数拥有 `label` 属性。

## 可选属性

在变量名称后面新增一个 `?` 表示该属性是可选的，如:

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}
```

## 只读属性

定义只读属性需要在变量前面加上 `readonly` ，如：

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}
```

只读属性只能在被声明时赋值，后续都不能再次修改。

如果要声明一个只读数组，可以使用内置的 `ReadonlyArray<T>` 类型，它是 `Array<T>` 的“阉割”版本：所有会修改数组的方法都被移除，如 `push()`。

注意，它们是两个不同的类型，所以不能把 `ReadonlyArray<T>` 类型赋值给 `Array<T>` 类型，但是反过来却可以，因为 `ReadonlyArray<T>` 的形状是 `Array<T>` 的子集。

```ts
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a; // => ok
a = ro; // => error!
a = ro as number[]; // => ok
```

## 额外属性检查（Excess Property Checks）

当使用**字面量对象（Object Literal）进行赋值或传参**时，编译器会采取**额外属性检查**策略，即：如果字面量对象包含额外的目标类型属性，编译器会报错。这种方式能有效的发现可能因拼写错误而诱发的 BUG。

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(config: SquareConfig): { color: string; area: number } {
  // ...
}
let mySquare = createSquare({ colour: "red", width: 100 }); // => error!
```

上例中，使用字面量对象对 `createSquare()` 进行传参，按照上文中提到的宽泛检查策略的话，是没有问题的；但是，为了帮助开发者发现可能存在的拼写错误，编译器此时采取的策略是额外属性检查，字面量中**不允许**出现目标类型不包含的其他属性。

如果不使用字面量对象进行传参的话，也是没问题的，如：

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}
function createSquare(config: SquareConfig): { color: string; area: number } {
    // ...
}
let config = { colour: "red", width: 100 };
let mySquare = createSquare(config); // => ok
```

那如果确实要包含额外的属性呢？

最简单的，只需要使用 `as` 告诉编译器 “you know what you are doing” 就可以，如:

```ts
createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

更好的做法是，使用**索引签名**（Index Signature），如：

```ts
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: any; // 索引签名
}
```

这告诉编译器，允许 `SquareConfig` 拥有任意数量、类型为 `any` 的其他属性。索引签名在下文会详细说明。

## 函数类型

除了定义属性类型，接口还可以定义**函数类型**。
TS 以**调用签名**（Call Signature）的方式定义函数类型。
个人认为，叫**函数签名**会更好，因此下面都称之为函数签名。

函数签名只包含参数列表和返回值，如：

```ts
interface SearchFunc {
  (source: string, subString: string): boolean;
}
```

有两种写法能实现对函数签名的类型检查，一种类似箭头函数，另一种则是匿名接口：

```ts
function identity(arg: number): number { return arg; }
let i1: (arg: number) => number = identity;
let i2: { (arg: number): number } = identity;
```

对于函数签名，编译器**不检查参数名称，只检查参数类型**。

## 可索引类型（Indexable Types）

可索引类型使用**索引签名**来描述我们可以使用什么类型的索引去索引对象或数组。

```ts
interface StringArray {
  [index: number]: string; // 索引签名
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr = myArray[0];
```

索引签名表示 `StringArray` 使用数字作为索引，返回字符串类型的值。在此，`myStr` 会依据索引签名被自动推导为 `string` 类型。

TS 支持 `string` 和 `number` 两种索引签名，通常一个索引签名选择其中一种就可以了。

但如果想要同时支持 `string` 和 `number` 两种索引，那么数字索引返回值类型必须是字符串索引返回值类型的**子类型**。为什么呢？因为在 JS 中使用数字索引时实际上都会转化为字符串索引，为了兼容这种转化，所以要求 `number` 索引返回值必须是 `string` 索引返回值的子类型。

使用索引签名时，会强制要求当前接口中的所有类型都符合该索引签名。

```ts
interface NumberDictionary {
  [index: string]: number;
  length: number;    // => ok
  name: string;      // => error, string 不是 number 的子类型
}
```

最后，索引类型可以使用 `readonly` 来防止数组元素被修改。

## 类类型

类使用 `implements` 来实现接口。

接口中，定义构造函数的类型使用**构造函数签名**，用 `new` 来定义：

```ts
interface ClockConstructor {
  new (hour: number, minute: number);
}
```

当接口应用在类类型时，要注意区分类的**静态属性和实例属性**。因为在类实现接口的过程中，编译器**只检查实例属性，不检查静态属性**。另外，构造函数也属于静态属性。

## 拓展接口

使用 `extends` 来继承接口，需要同时继承多个时，使用逗号分隔。

```ts
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}
```

### 混合类型（Hybrid Type）

混合类型能让一个类型即充当函数类型，同时又充当接口类型。主要用在使用第三方库时。

## 接口拓展类类型

接口拓展（extends）类类型时，该接口会**继承所有类成员，但不继承其实现**，就像在接口中声明了这些类成员一样。这里的继承也包含**私有成员和受保护成员**，这也意味着该接口只能被这个类或者其子类实现。