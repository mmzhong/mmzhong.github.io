---
layout: post
title: TypeScript
tags: typescript
desc: TypeScript 基础
---

TypeScript 是 JavaScript 的**超集**，在 JS 语言的基础上新增了**类型检查**功能。超集意味着一段合法的 JS 代码可以直接在 TS 中使用。类型检查的目的是为了**减少运行时错误**。

TS 主要基于 ES6 的语法，编译时可以选择输出为 ES3、ES5 以及更新的 JS 代码。

开发一般的中小应用时，JS 是完全可以胜任的。但如果是开发**大型复杂应用且需要多人协作**时，那么 JS 就会在大规模代码的组织和管理上显得乏力。比如一个开发者使用项目中某个已经写好的函数时，在 TS 中他会得到很直接的函数说明和参数类型，而不用像 JS 一样去查看文档甚至源码。

## 基础类型

基础类型可以依据是否含有类型关键字分为两类：

* 含：`boolean`、`number`、`string`、`null`、`undefinded`、`any`、`never`
* 不含：数组、元组、枚举

注意：所有类型关键字都是**小写**的。

### 声明格式
类型用来指定变量的类型，相同类型之间才能进行赋值、传参等操作。
声明变量类型使用 `变量名: 类型` 格式，如 `let decimal: number = 10`，声明之后 `decimal` 就只能接受 `number` 类型的赋值，否则编译器会报错。

### Array
声明为数组类型时，还需要指定数组元素类型，有以下两种等效方式：

* `let list: number[] = [1, 2, 3]`
* `let list: Array<number> = [1, 2, 3]`

如果数组元素类型有多种呢？那就需要使用元组（Tuple）。

### Tuple

元组可以指定固定索引位置的数组元素类型。

如 `let x: [string, number]` 表示第 0 位和第 1 位分别是 `string` 和 `number` 类型，第 2 位及之后可以是 `string` **或** `number`。

### Enum

枚举类型可以更加**友好**地定义**数值集**。

```ts
enum Color { Red, Green, Blue }
let c: Color = Color.Red;
```

枚举类型默认从 0 开始递增标记成员，也可以**显式**标记部分或者所有成员。部分标记时，未标记成员按前向最近显式标记值递增。

```ts
enum Color { Red = 1， Green, Blue }
// 部分标记时，自动递增，因此 Green => 2, Blue => 3
enum Color { Red = 1, Green = 2, Blue = 4 }
```

一个很好用的功能是，枚举可以反向查询枚举成员名称，如：

```ts
enum Color { Red = 1， Green, Blue }
console.log(Color[2])
// => Green
```

### Any

`any` 表示任何类型，声明为 `any` 的变量可以赋予任何类型的值。

那不就是等于没有类型检测了？

之所以存在这种类型，原因有两：

1. 写代码时开发者也不是很明确要用那种类型，或者只知道部分类型
2. 兼容用户输入或者第三方库

原因 2 中，比如应该把 `jQuery` 对象声明为什么类型呢？当然，可以声明为 `Object`，如 `let $: Object = jQuery`，这样赋值是没问题的。但是调用函数时如 `$.ajax()`，编译器却会报错说找不到 `ajax()` 函数，但是声明为 `any` 却不会。

### Void

`void` 与 `any` 相反，表示不能出现任何类型，多用于定义无返回值的函数。

```ts
function warn(): void {
  alert('warning');
}
```

如果用于声明变量，那么只能接受 `undefinded` 和 `null`，这样的声明其实是没啥用途的。

```ts
let unusable: void = undefined;
```

### Null 和 Undefined

`null` 和 `undefinded` 跟 `void` 一样，定义类型本身是没啥用途的，但是需要注意的是，他们是其他任何类型（包括 `void`）的**子类型**。因此，可以把 `null` 赋值给 `number` 类型，`let decimal: number = null`。

但是，**不建议**这种用法，可以使用 `--strictNullChecks` 选项来关闭。这样的话，`null` 和 `undefinded` 就只能赋值给 `void` 和 它们本身。

### Never

`never` 表示这种类型的值**永远不会出现**。听起来很奇怪，但是它确实有应用场景。

最大的场景就是用在函数返回值中，如：

```ts
function error(msg: string): never {
  throw new Error(msg);
}
function fail() {
  return error('failed');
}
```

```ts
function infiniteLoop(): never {
  while(true) {}
}
```

### 类型断言

TS 编译器会按照声明规则自动检查变量类型，免去了开发者自己检查的烦恼。但是作为规则，它是固定死的，有时也需要灵活“通融”一下。

类型断言就是一种“通融”方式，实质上是一种**类型转换**，它告诉编译器“相信我，我知道我在做什么，我为我的行为负责”。

类型断言有两种语法形式，下例中都是将变量 `anyTypeValue` 转为 `string` 类型：

* angle-bracket-syntax: `(<string>anyTypeValue).length`
* as-syntax: `(anyTypeValue as string).length`

**推荐使用 `as` 语法**，因为当 TS 与 JSX 一起使用时，只允许 `as` 语法。

## 变量声明

声明变量有`var`、`let` 和 `const` 三种方式，它们在 TS 中的用法与 JS 一致。

### `var` 声明

与其他语言的变量声明相比，`var` 声明的变量有一些比较奇怪的作用域规则，主要体现在：

* **变量提升**现象
* 可**重复**声明
* **函数**作用域捕获

最常见的例子如下：

```ts
function f1() {
  for (var i = 0; i < 10; i++) {
    setTimeout(function f2() { console.log(i); }, 100 * i)
  }
}
f1();
```

很多人认为输出打印为 0 到 10 的数字，然而真实打印为 10 个 10。这就是函数作用域在作怪。上面代码只有等到 `for` 循环结束后才会打印输出，`f2` 中的 `i` 指向是 `f1` 函数作用域中的 `i` ，等到 `f2` 执行时 `i` 已经是 10 。

要想输出 0 到 10 也很简单，既然只有函数作用域才能捕获变量，那么我们可以在 `f1` 和 `f2` 之间再加一层函数作用域。

```ts
function f1() {
  for (var i = 0; i < 10; i++) {
    (function fn(i) {
      setTimeout(function f2() { console.log(i); }, 100 * i)
    })(i);
  }
}
f1();
```
型如 `fn` 的函数称为**立即执行函数表达式**（IIFE，Immediately Invoked Function Expression），它会在每次循环中执行一次，并把当时的 `i` 值作为参数被 `fn` 的函数作用域捕获。这样，执行 `f2` 时就会先查找到 `fn` 函数作用域中的 `i` 值。

要取得相同的效果，还有更简单的办法，那就是使用接下来要说的 `let` 。

### `let` 声明

为了避免 `var` 的各项怪异行为，ES 6 引入了 `let` ，它的语法与 `var` 相同，但是却有更加严谨的使用方式。主要表现为引入**块级作用域**，也称为词法作用域。

块级作用域的引入意味着不再需要使用创建函数来定义一个新的作用域，而只需要使用大括号 `{}` 即可以创建一个新的作用域。

块级作用域中的变量**必须先声明后使用**，相同作用域内**不允许重复声明**。

作为作用域，函数作用域和块级作用域是相同的，具有以下特点：

1. 寻找变量时逐层外外查找，直到找到为止，否则报引用错误
2. 内层作用域可以访问外层作用域内的变量，而反过来不行
3. 内层作用域变量会屏蔽（Shadowing）外层作用域中的同名变量（特点 1 的推论）
4. 作用域内代码即使已经执行完毕，该作用域捕获的变量仍然存在（闭包）

针对 4 举例：

```ts
function theCityThatAlwaysSleeps() {
    let getCity;

    if (true) {
        let city = "Seattle";
        getCity = function fn() {
            return city;
        }
    }

    return getCity();
}
```

上例中，运行 `getCity()` 时，`if` 代码块已经执行完毕，但是我们任然可以使用 `city` ，因为 `fn` 函数作用域捕获了 `if` 块作用域内的 `city` 。

当 `let` 声明作为循环语句的一部分时，它有特殊表现：它为每此循环创建一个新的块级作用域，而不是为整个循环语句本身创建一个作用域。所以，上文中循环设置 `setTimeout` 的问题可以使用一下以下方式轻松解决，因为每次迭代时，`f2` 和 `f1` 之间都会创建一个新的块级作用域。

```ts
function f1() {
  for (let i = 0; i < 10; i++) {
    setTimeout(function f2() { console.log(i); }, 100 * i)
  }
}
f1();
```

### `const` 声明

`const` 与 `let` 一致，唯一不同的是，它声明的变量只能在声明时赋值，之后都**不能被再次赋值**，即其他语言中所说的**常量**。

对于使用 `const` 声明的数组和对象，声明的变量本身是不能被修改的，但是数组元素和对象属性仍然是可以被修改。

### 解构（Destructuring）

解构把数据从数组或者对象中提取出来并赋值给对应变量。

#### 数组解构

```ts
let [first, second] = [1, 2];
// => first = 1, second = 2

[second, first] = [first, second];
// swap => first = 2, second = 1

let [alpha, ...rest] = [1, 2, 3];
// => alpha = 1, rest = [2, 3]
```

#### 对象解构

解构同名属性。

```ts
let o = {
  a: 1,
  b: 2,
  c: 3
};
let { a, b } = o;
// => a = 1, b = 2

let { a, ...other } = o;
// => a = 1, other = { b: 2, c: 3 }

let { a: first, b: second } = o;
// rename => first = 1, second = 2

let { a, b, c, d = 4} = o;
// default => d = 4

function f({a, b}) {}
f(o);
// => a = 1, b = 2
```

### 拓展（Spread）

拓展运算符与解构相反，它把数据展开并合并到数组或者对象中，使用的是 `...` 语法。

```ts
let first = [1, 2];
let second = [3, 4];
let both = [...first, ...second];
// => both = [1, 2, 3, 4]

let o1 = { a: 1, b: 2, c: 3 };
let o2 = { b: 4, ...o1 };
// => o2 = { a: 1, b: 4, c: 3}
```
注意：

* 同名时，后面的值**覆盖**前面的值
* 只拓展对象本身的**可枚举属性**

```ts
class C {
  p = 12;
  m() {
  }
}
let c = new C();
let clone = { ...c };
clone.p; // ok
clone.m(); // error! 对象实例方法能拓展
```

## 接口（Interface)

类型检查只关注目标值的**形状**（Shape）是 TS 最核心的理念之一。对于对象来说，形状是指该对象拥有哪些属性或方法以及属性的读写属性。接口就是 TS 定义形状的方式。

TS 的类型检查有以下特点：

* 只检查**形状**（Shape)
* 宽泛检查策略：至少包含指定类型（At least），允许新增其他属性
* 检查无关顺序

接口定义有两种方式：

* 使用 `interface` 定义一个具名接口
* 使用 `{}` 定义一个匿名接口

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

### 可选属性

在变量名称后面新增一个 `?` 表示该属性是可选的，如:

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}
```

### 只读属性

定义只读属性需要在变量前面加上 `readonly` ，如：

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}
```

只读属性只能在被声明时赋值，后续都不能再次修改。

如果要声明一个只读数组，可以使用内置的 `ReadonlyArray<T>` 类型，它是 `Array<T>` 的“阉割”版本：所有会修改数组的方法都被移除，如 `push()`。

注意，它们两是两个不同的类型，所以不能把 `ReadonlyArray<T>` 类型赋值给 `Array<T>` 类型，但是反过来却可以，因为 `ReadonlyArray<T>` 的形状是 `Array<T>` 的子集。

```ts
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a; // => ok
a = ro; // => error!
a = ro as number[]; // => ok
```

### 额外属性检查（Excess Property Checks）

当使用**字面量对象（Object Literal）进行赋值和传参**时，编译器会采取**额外属性检查**策略，即：如果字面量对象包含额外的目标类型属性，编译器会报错。这种方式能有效的发现可能因拼写错误而诱发的 BUG。

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

上例中，使用字面量对象对 `createSquare()` 进行传参，按照上文中提到的宽泛检查策略的话，是没有问题的；但是，为了帮助开发者发现可能存在的拼写错误，编译器此时采取的策略是额外属性检查，字面量中不允许出现目标类型不包含的其他属性。

如果不使用字面量对象进行传参的话，也是没问题的，如：

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

如果确实要包含额外的属性？

最简单的，只需要使用 `as` 告诉编译“you know what you are doing”，如:

```ts
createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

更好的做法是，使用**索引签名**（Index Signature），如：

> 索引签名在下文会详细说明

```ts
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: any; // 索引签名
}
```

这告诉编译器，允许 `SquareConfig` 拥有任意数量类型为 `any` 的其他属性。

### 函数类型

除了定义属性类型，接口还可以定义**函数类型**。
TS 以**调用签名**（Call Signature）的方式定义函数类型。
个人认为，叫函数签名会更好，因此下面都称之为函数签名。

函数签名只包含参数列表和返回值，如：

```ts
interface SearchFunc {
    (source: string, subString: string): boolean;
}
```

对于函数签名，编译器不检查参数名称，只检查参数类型。

### 可索引类型（Indexable Types）

可索引类型使用**索引签名**来描述我们可以使用什么类型的索引去索引对象或数组。

```ts
interface StringArray {
    [index: number]: string; // 索引签名
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr = myArray[0];
```

索引签名表示 `StringArray` 使用数字作为索引，返回字符串类型的值。在此，`myStr` 会被自动推导为 `string` 类型。

TS 支持 `string` 和 `number` 两种索引签名，通常一个索引签名选择其中一种就可以了。

但如果想要同时支持 `string` 和 `number` 两种索引，那么数字索引返回值的类型必须是字符串索引返回值的**子类型**。为什么呢？因为在 JS 中使用数字索引时实际上都会转化为字符串，要求是子类型可以与此保持一致性。

使用索引签名时，会强制要求当前接口中的所有类型都符合索引签名。

```ts
interface NumberDictionary {
    [index: string]: number;
    length: number;    // => ok
    name: string;      // => error, string 不是 number 的子类型
}
```

最后，索引类型可以使用 `readonly` 来实现数组元素不被修改。

### 类类型

类使用 `implements` 来实现接口。


接口中，定义构造函数的类型使用**构造函数签名**，用 `new` 来定义：

```ts
interface ClockConstructor {
    new (hour: number, minute: number);
}
```

接口应用在类类型时，要注意区分类的静态属性和实例属性。因为在类实现接口的过程中，编译器**只检查实例属性，不检查静态属性**。另外，构造函数也属于静态属性。

### 拓展接口

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

### 接口拓展类

接口拓展（extends）类时，该接口会**继承所有类成员，但不继承其实现**，就像在接口中声明了这些类成员一样。这里的继承也包含**私有成员和受保护成员**，这也意味着该接口只能被这个类或者其子类实现。