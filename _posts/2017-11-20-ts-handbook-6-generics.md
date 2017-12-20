---
layout: post
title: TypeScript 泛型
tags: typescript,handbook,generics
desc: "TypeScript 快速手册：泛型（Generics）"
---

**组件复用**是软件开发中遵循的重要原则之一，**泛型**是实现组件复用的重要方法。
TS 的泛型允许我们只写一个组件就可以适配多种类型的数据。

## Hello Generics

为了能让一个函数可以接受多种类型的参数，最简单的做法是把参数类型设置为 `any` ：

```ts
function identity(arg: number): number { return arg; }
function identity(arg: any): any { return arg; }
```

但使用 `any` 会带来一些问题，我们会因此丢失了参数的类型，返回值也没有提供任何有效的类型。
通常，可能我们期待的是：参数是什么类型，返回值也应该是什么类型。很明显，使用 `any` 没有满足这种需求。

为满足这种需求，我们需要一种能**捕获参数类型**的方式，这样就可以把捕获的参数类型应用在返回值上。
因此，TS 引入**类型变量**（Type Variable），一种用来存储类型的特殊变量。

```ts
function identity<T>(arg: T): T { return arg; }
```

当传入 `number` 类型参数时，`T` 的值就为 `number`，返回值类型也指定为 `number` 类型。
这种形式的函数就称之为**泛型函数**。

类型变量作为一种特殊变量，它可以像变量一样命名为任何合法的变量名称，但一般都命名为 `T`、`U`、`K` 等大写名称。

使用泛型函数有两种方式，第一种是给所有的参数变量都传值，包括类型变量，如下：

```ts
let output = identity<string>('hello');
```

这样，`T` 就会被显式的设置为 `string` 类型。

更通用的做法是，不对类型变量进行传值，利用编译器的**类型参数推导**完成类型变量的赋值。

```ts
let output = identity(666);
```

这种做法让代码显得更加简洁。
但这并不意味着第一种方式就没用途，如果编译器类型推导失败或者在复杂的代码中使用泛型时，显式对类型变量传值也还是能帮上忙的。

一旦在函数内部使用泛型变量，编译器便会强制对其进行类型检查。
这意味着，你要把这些类型当做是任何可能的类型（注意：任何类型与任意类型 `any` 是不同的）。
如果使用泛型变量不包含的属性，则会引发编译器报错，如：

```ts
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);  // Error: T doesn't have .length
  return arg;
}
```

因为 `T` 可能是任何类型，比如 `number` 就没有 `length` 属性，所以编译器报错。

## 泛型接口

通过前面的文章我们可以知道，泛型的函数签名可以使用以下两种等效方式：

```ts
function identity<T>(arg: T): T { return arg; }
let i1: <T>(arg: T) => T = identity;
let i2: { <T>(arg: T): T } = identity;
```

`i2` 中用的其实是匿名接口，把它提取出来变成具名接口，我们就定义了一个泛型接口。

```ts
interface GenericIdentityFn {
  <T>(arg: T): T
}
function identity<T>(arg: T): T { return arg; }
let i2: GenericIdentityFn = identity;
```

`GenericIdentityFn` 中的泛型变量 `T` 仅对那个函数签名有效，如果想让 `T` 在整个接口范围内都有效，可以把 `T` 提升到接口名称上。

```ts
interface GenericIdentityFn<T> {
  (arg: T): T
}
function identity<T>(arg: T): T { return arg; }
let i2: GenericIdentityFn<number> = identity;
```

此时，在接口内部就可以像使用其他类型一样使用泛型变量 `T` 。

除了泛型接口，TS 还可以定义泛型类，但是**不能定义泛型枚举和泛型命名空间**。

## 泛类

泛型类简称**泛类**，定义方式与接口类似，使用泛类实例化时需要显式传入类型变量。

```ts
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
```

要注意，泛型变量**只能用于实例成员**，不能用于静态成员。

## 泛型约束

前面提到类型变量可能是任何类型，有时我们则希望类型变量是某种类型，**泛型约束**就是用来限制泛型类型的。

通常，最简单的是使用接口来定义泛型约束。

```ts
interface lengthwise {
  length: number;
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // ok
  return arg;
}
```

添加约束后，泛型函数就只能接受类型匹配的类型，使用 `loggingIdentity(3)` 将会抛出错误。

更复杂点，还可以使用泛型变量来约束另一个泛型变量。
比如我们想要从一个对象中获取给定名称的属性值，就需要确保给定名称的属性存在于这个对象上。

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

最后，泛型变量也可以跟类类型一起结合使用。以使用工厂模式创建实例为例，我们就需要引用类类型的构造函数类型。

```ts
class BeeKeeper { hasMask: boolean; }
class ZooKeeper { nametag: string; }
class Animal { numLegs: number; }
class Bee extends Animal { keeper: BeeKeeper; }
class Lion extends Animal { keeper: ZooKeeper; }
function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}
```
