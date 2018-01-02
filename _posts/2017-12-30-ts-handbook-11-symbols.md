---
layout: post
title: TypeScript Symbols
tags: typescript,symbol
desc: "TypeScript 快速手册：Symbols"
---

ES6 引入了一种新的原始类型 `symbol` ，用以解决**命名冲突**问题。

## 使用 Symbol

`symbol` 值通过构造函数 `Symbol` 创建：

```ts
let s1 = Symbol(); // => 'Symbol()`
let s2 = Symbol('key'); // => 'Symbol(key)`
```

其中，字符串参数是**可选的**。添加参数是为了便于与其他 symbol 区分，否则在控制台或者调试时都显示为 `Symbol()` 。
注意，创建 symbol **不能用 `new`** ，因为其返回值不是对象，也因此 `s1` 上不能添加属性。

还有一种创建方式：

```ts
let s1 = Symbol.for('foo'); // create
let s2 = Symbol.for('foo'); // found
s1 === s2; // => true
Symbol.keyFor(s1); // => 'foo'
```

`Symbol.for()` 首先从**全局环境**搜索与参数匹配的 Symbol ，如果未找到，则创建新 Symbol 并记录在全局环境中；反之，则会返回找到的 Symbol 。而，`Symbol()` 则是每次都创建。
`Symbol.keyFor()` 用于查找 Symbol 对应的字符串参数。

`symbol` 值都是**不可修改**且**唯一**的：

```ts
let s1 = Symbol('key');
let s2 = Symbol('key');

s1 === s2; // => false
typeof s1; // => 'symbol'
```

与字符串一样，symbols 可以用做对象的属性名称，也可用于计算属性声明：

```ts
let s1 = Symbol();
let obj = {
  [s1]: 'mm',
};
console.log(obj[sym]); // => 'mm'

let getClassNameSymbol = Symbol();
class C {
  [getClassNameSymbol]() {
    return 'C';
  }
}
let c = new C();
console.log(c[getClassNameSymbol]()); // => 'C'
```

注意，只能使用方括号，否则会被认为是字符串，如 `obj.s1` 是指属性 `'s1'` ， `obj[s1]` 才是 symbol `s1` 。

Symbols 对常规方法**不可见**，包括：

1. `for ... in`
2. `for ... of`
3. `Object.keys()`
4. `Object.getOwnPropertyNames()`
5. `JSON.stringify()`

如果要获取用作属性名的 Symbol 值，有两种方法：

1. `Object.getOwnPropertySymbols()`：仅返回 Symbols
2. `Reflect.ownKeys()`：返回普通属性名和 Symbols

## 内置 Symbols

以上所涉及的都是用户自定义的 Symbols ，除此以外，ES6 还定义了 11 个常用的**内置 Symbols** ，用于**指向语言内部使用的方法**。

上面我们知道，Symbol 可以用来当做属性名和方法名，它可以是用户定义或者内置。而在 JS 语言本身实现时，也使用了 Symbols ，这些 Symbols 就通过内置 Symbols 暴露给开发者。它们就像语言给开发者留下的**钩子**（Hook），开发者可以通过给这些内置 Symbols 赋予新值，从而改变某些运算或者方法的行为。

* `Symbol.hasInstance`

 `instanceof` 运算钩子。当其他对象使用 `instanceof` 运算，判断是否为该对象的**实例**时，会首先检查该对象是否有 `Symbol.hasInstance` 方法，有则调用，无则使用默认行为。

 ```ts
class C {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}
[1, 2, 3] instanceof C; // => false，C 没有 Symbol.hasInstance 方法
[1, 2, 3] instanceof new C(); // => true，C 的实例有 Symbol.hasInstance 方法

class Even {
  static [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
}
2 instanceof Even; // => true
 ```

* `Symbol.isConcatSpreadable`

该 Symbol 属性是一个布尔值，表示对象用于 `Array.prototype.concat()` 时是否可以展开。

```ts
let a = [3, 4];
a[Symbol.isConcatSpreadable] = false;
[1, 2].concat(a); // => [1, 2, [3, 4]]，a 没有展开
```

对于数组，如果 `Symbol.isConcatSpreadable` 属性不存在或者为 `true` ，则展开；
对于类似数组（Array-like），默认不展开，需要手动设置 `Symbol.isConcatSpreadable` 为 `true` 才展开。

* `Symbol.iterator`

`Symbol.iterator` 指向对象的默认遍历器方法。对对象进行遍历时，如果存在该 Symbol 方法则会调用该方法，返回其返回值。

* `Symbol.match` 、`Symbol.replace` 、 `Symbol.search` 、 `Symbol.split`

这些 Symbols 分别对应 `String.prototype` 的 `match()` 、`replace()` 、`search()` 和 `split()` ，当调用这些方法时，如果存在这些 Symbols 方法，则调用它并返回其返回值。

* `Symbol.species`

`Symbol.species` 指向一个构造函数，**运行时**如果需要**再次调用自身构造函数**，会使用该构造函数。

```ts
class ArrayOne extends Array {}
let a1 = new ArrayOne();
a1 instanceof Array; // => true
a1 instanceof ArrayOne; // => true
a1.map(x => x) instanceof ArrayOne; // => true

class ArrayTwo extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}
let a2 = new ArrayTwo();
a2 instanceof Array; // => true
a2 instanceof ArrayTwo; // => true
a2.map(x => x) instanceof ArrayTwo; // => false
```

* `Symbol.toPrimitive`

对象被转为原始类型时，会调用此方法（若存在），返回其返回值。该 Symbol 方法的参数为一个字符串，表示运算模式，分别为 `string`、`number` 和 `default` 。

```ts
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number': return 6;
      case 'string': return '8';
      case 'default': return 'default';
      default: throw new Error();
    }
  }
}

2 * obj === 12;     // => true
'2' + obj === '28'; // => true
obj == 'default';   // => true
```

* `Symbol.toStringTag`

在对象上调用 `Object.prototype.toString()` 时，如果存在 `Symbol.toStringTag` 属性，它的返回值会出现在返回的字符串中，表示对象的类型。也即改变 `[object Object]` 或 `[object Array]` 中的第二个参数。

```ts
class C {
  get [Symbol.toStringTag]() {
    return 'C';
  }
}
let c = new C();
String(c) === '[object C]'; // => true

({[Symbol.toStringTag]: 'Foo'}.toString()); // => '[object Foo]'
```

* `Symbol.unscopables`

`Symbol.unscopables` 指向一个对象，该对象指明哪些属性对 `with` **不可见**。

```ts
let o = {
  foo: () => 'foo inside',
}
const foo = () => 'foo outside';
with (o) {
  foo(); // => 'foo of inside'
}
o[Symbol.unscopables] = { foo: true };
with (o) {
  foo(); // => 'foo outside'
}
```