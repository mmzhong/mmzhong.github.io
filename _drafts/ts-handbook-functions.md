---
layout: post
title: TypeScript 函数
tags: typescript,handbook,class
desc: TypeScript 快速手册： 函数
---

TS 在标准 JS 函数的基础上新增了一些功能。

## 函数类型

函数类型包含两部分：参数类型和返回值类型。

当等式两边仅一边包含类型时，TS 会自动根据上下文推导（Inference）出另一边的类型。这能让开发者少写一些代码。

```ts
let myAdd = function(x: number, y: number): number { return  x + y; };
// => myAdd 自动推导为 (x: number, y: number) => number 
let myAdd: (baseValue: number, increment: number) => number = function(x, y) { return x + y; };
// => x, y 自动推导为 number
```

## 可选参数和默认参数

函数参数默认为都是必选参数。

```ts
function fn1(firstName: string, lastName?: string) {}
function fn2(firstName: string, lastName = 'Smith') {}
function fn3(firstName = 'John', lastName = 'Smith') {}
```

`fn1` 和 `fn2` 两个函数拥有相同的函数类型 `(firstName: string, lastName?: string) => string` ，但是 `fn2` 和 `fn3` 的函数类型不同。

需要注意的是：

1. 可选参数必须在必选参数之后，通常放在最后面
2. 默认参数可以放在任何位置，非最后位置时，必须显式传入 `undefined` 才会被赋值为默认值

## 剩余参数

使用 `...` 来集合多个参数。

```ts
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + ' ' + resfOfName.join(' ');
}
```

## this

`this` 的使用是 JS 必须掌握的技能。

在 JS 中，`this` 是在**函数调用时**设置的一个变量，所以知道函数执行时的上下文至关重要。
尤其是在返回一个函数或者函数作为参数时，经常让人摸不着头脑。

TS 使用了一系列的方法来纠正 `this` 的不正确用法。

### 箭头函数

顶层的非方法语法调用会把 `this` 设置为 `window`（严格模式下，设置为 `undefined`）。

箭头函数会捕获其创建时的上下文为 `this`，而不是其运行时的上下文。
但是 TS 会默认地把箭头函数的 `this` 类型设置为 `any` 。
如果给编译器传入了 `--noImplicitThis` 选项，那么此时编译器会警告说 `this` 的类型为 `any` 。

为了明确的指定箭头函数的类型，可以使用 `this` 参数，如下：

```ts
interface Card {
  suit: string;
  card: number;
}
interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  // NOTE: The function now explicitly specifies that its callee must be of type Deck
  createCardPicker: function(this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return {suit: this.suits[pickedSuit], card: pickedCard % 13};
    }
  }
}
```

`this` 参数是参数列表的第一个参数，但它**假参数**，仅用于给编译器校验类型，它并不会影响函数真正使用时的参数列表。

可以设置 `this` 参数为 `void` 使得函数内部的 `this` 不可用。

```ts
function fn(this: void) {
  // 函数内部 this 不可用，否则编译器报错
}
```

在回调函数中使用 `this` 也会经常引发错误，为了避免这类错误，`this` 参数也可以应用在**回调函数**中。

做法如下：

1. 第三方库需要在回调函数类型中使用 `this` 参数，使得编译器知道回调函数中 `this` 的类型
2. 给第三方传入的回调函数也加上 `this` 参数，这样编译器就可以比较两次的 `this` 类型是否兼容

```ts
class UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void {};
}
class Handler {
  info: string;
  onClickBad(this: Handler, e: Event) {
    this.info = e.message;
  }
}
let uiElement = new UIElement();
uiElement.addClickListener(new Handler().onClickBad);
// => error，this 类型不兼容
```
上例中，把 `onClickBad` 的 `this: Handler` 去掉可以消除错误，但是会引发运行时错误，因为 `UIElement` 在调用此回调时 `this` 值为 `void` 。

但如果回调函数中真的要用到 `this`，那该怎么办呢？可以使用箭头函数，因为它不会捕获 `this`。但是这会导致每个 `Handler` 实例都会创建一个单独的 `onClickGood`，而不是放在原型上。

```ts
class Handler {
  info: string;
  onClickGood = (e: Event) => { this.info = e.message }
}
```

## 重载（Overloads）

在 JS 中经常会根据参数类型的不同而返回不同类型的值。TS 为这种做法提供了更加灵活的方法：**重载**。

重载会声明多个函数名相同但是函数签名不同的函数，编译器会自动根据参数类型来选择调用哪个函数。

编译器选择执行的重载函数时，会按照**声明的先后顺序查找**，选择第一个类型匹配的函数执行。
因此，在声明重载函数时往往从上到下对应类型从具体到宽泛。