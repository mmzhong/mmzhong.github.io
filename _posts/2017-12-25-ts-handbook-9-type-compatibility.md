---
layout: post
title: TypeScript 类型兼容
tags: typescript,handbook,type compatibility
desc: "TypeScript 快速手册：类型兼容"
---

## 引入

TS 所采用的类型系统是**结构子类型**（Structural Subtyping），它表示只要两个类型**具有相同结构组成**，那么它们就是等价的。
与结构类型系统对立的另一种类型系统称为**标明子类型**（Nominal Subtyping），它要求若两个类型要相等，就必须具有相同的类型声明名字。

子类型的意思是，如果类型 `A` 具有类型 `B` 拥有的所有成员，那么 `A` 就是 `B` 的子类型。
TS 中判断两种类型是否等价就是判断它们是否类型兼容（Type Compatibility）。

比如，对于下面代码的写法在 TS 中是允许的，因为它们具有相同的成员结构；但是在标明类型系统的语言中（如 Java），这种做法确实不允许的，因为 `Person` 并没有明确的表示它实现了 `Named` 接口。

```ts
interface Named {
  name: string;
}

class Person {
  name: string;
}

let p: Named;
p = new Person(); // => ok, because of structural typing
```

TS 之所以采用结构类型系统，是因为现有 JS 代码中广泛的使用了匿名对象（匿名函数、对象字面量等）。结构类型系统能够使得我们以更自然的方式来表示 JS 库之间不同类型的关系。

## 基本规则

TS 的结构类型系统中，最基本的规则是：如果 `x` 至少拥有与 `y` 相同的成员，那么就认为 `x` 是兼容 `y` 的，就可以把 `y` 类型的值赋值给 `x` 类型的值。

```ts
interface Named {
  name: string;
}

let x: Named;
let y = { name: "Alice", location: "Seattle" };
x = y; // => ok
```

上面的例子中，为了判断 `y` 是否可以赋值给 `x` ，编译器会检查 `x` 的每个属性以找出 `y` 中能与之兼容的属性。这里就要求 `y` 必须拥有一个叫 `name` 的字符串属性。虽然 `y` 具有额外的 `location` 属性，但是 `y` 确实也拥有 `string` 类型的 `name` 属性，所以这里能把 `y` 赋值给 `x` 。

函数传参是否兼容用的也是这种检查方式，并且这种检查方式会**递归**的检查子成员的类型。

## 函数兼容

函数兼容的比较方法会更复杂一些。

首先来看下函数参数比较：

```ts
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;
y = x; // => ok
x = y; // => error
```

上面的代码中，只有 `x` 函数的每个参数类型都能与 `y` 中与之对应位置的参数类型相兼容，才能把 `x` 赋值给 `y` 。
注意，这里只比较参数类型，而**不比较参数名称**。反过来，`y` 中的第二个参数类型与 `x` 中的第二个参数（没有参数）类型不兼容，所有无法将 `y` 赋值给 `x` 。

为什么会允许这种奇怪的做法？简单点，所有参数类型都相兼容不就行了？

这是因为在 JS 中**忽略多余**的参数是很常用的做法。例如 `Array#forEach` 为它的回调函数提供了三个参数：`element`、`index` 和 `array` ，但是大多数情况下我们只用到第一个参数 `element` 。

然后来看下函数返回值比较：

```ts
let x = () => ({name: "Alice"});
let y = () => ({name: "Alice", location: "Seattle"});
x = y; // => ok
y = x; // => error, because x() lacks a location property
```

这里我们把等号左边的内容称为**源**，等号右边的内容称为**目标**，赋值就是让源变成目标。

所以，上面的例子中，编译器会强制**源函数返回值类型**必须是**目标函数返回值类型**的子类型。

### 函数参数

比较函数参数类型时，不管是源参数可以赋值为目标参数，还是反过来，赋值都会成功。这种做法很**不健全**。

但，这是考虑到函数调用时传参可能是更加具体的类型，但函数参数类型本身是比较抽象的类型。

之所以允许这种不健全的做法是因为实际应用中这种错误非常少见，而且这样可以允许很多常见的 JS 模式。

```ts
enum EventType { Mouse, Keyboard }
interface Event { timestamp: number; }
interface MouseEvent extends Event { x: number; y: number }
interface KeyEvent extends Event { keyCode: number }
function listenEvent(eventType: EventType, handler: (n: Event) => void) {
    /* ... */
}

// Unsound, but useful and common
listenEvent(EventType.Mouse, (e: MouseEvent) => console.log(e.x + "," + e.y)); // => ok

// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, (e: Event) => console.log((<MouseEvent>e).x + "," + (<MouseEvent>e).y)); // => pk
listenEvent(EventType.Mouse, <(e: Event) => void>((e: MouseEvent) => console.log(e.x + "," + e.y))); // => ok

// Still disallowed (clear error). Type safety enforced for wholly incompatible types
listenEvent(EventType.Mouse, (e: number) => console.log(e)); // => error
```

### 可选参数和剩余参数

源类型额外的可选参数不会造成类型错误，目标类型没有源类型对应的可选参数也不会造成类型错误。

剩余参数被当做为无限的可选参数序列。

这种处理方法是为了迁就 JS 中不传参数就相当于参数为 `undefined` 的语法。

### 函数重载

当一个函数有重载函数时，源类型的每个重载函数都必须与目标类型兼容才能算是兼容。这是为了确保不管源函数使用哪种重载函数，目标函数都能被正确调用。

## 枚举

枚举兼容数值，数值也兼容枚举。但来自不同枚举的成员之间是不兼容的。

```ts
enum Status { Ready, Waiting };
enum Color { Red, Blue, Green };

let status = Status.Ready;
status = Color.Green;  // => error
```

## 类

类跟象字面量和接口的类型兼容检查一样，唯一的不同是类具有静态类型和实例类型。但是，进行类型兼容比较时，仅比较实例成员，而忽略静态成员。

私有和受保护成员会影响到类型兼容比较。

当比较私有成员时，如果目标类包含一个私有成员，那么源类也必须包含相同的私有成员继承自相同的类。受保护成员也使用这种比较方法。
这样做是为了能**允许该类赋值给其父类**。

## 泛型

由于 TS 是基于结构类型的，所以类型参数只会影响有成员使用类型参数的时候。

```ts
interface Empty<T> {}
let x: Empty<number>;
let y: Empty<string>;
x = y; // => ok
```

上例中，虽然声明了类型参数，但是并没有成员使用该类型参数，所以 `x` 和 `y` 是相互兼容的。但如果使用了类型参数，如：

```ts
interface NotEmpty<T> {
  data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;
x = y;  // => error, x and y are not compatible
```

此时，就会像非泛型类型一样进行类型比较。

还有一种情况是，类型参数的类型也还没有确定，这个时候会把类型参数当做 `any` ，然后再像非泛型类型一样进行类型比较。

```ts
let identity = function<T>(x: T): T {
  // ...
}
let reverse = function<U>(y: U): U {
  // ...
}
identity = reverse;  // => ok, because (x: any)=>any matches (y: any)=>any
```