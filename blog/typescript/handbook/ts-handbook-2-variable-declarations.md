---
title: TypeScript 变量声明
createdDate: 2017-12-17
tags: typescript,var,let,const,declaration
desc: "TypeScript 快速手册：变量声明"
---

TS 声明变量有`var`、`let` 和 `const` 三种方式，它们在 TS 中的用法与 JS 一致。

## `var` 声明

与其他语言的变量声明相比，`var` 声明的变量有一些比较奇怪的作用域规则，主要体现在：

* **变量提升**现象
* 可**重复**声明
* **函数**作用域捕获

最常见的例子如下：

```ts
function f1() {
  for (var i = 0; i < 10; i++) {
    setTimeout(function f2() { console.log(i); }, 100 * i)
  }
}
f1();
```

很多人认为输出打印为 0 到 10 的数字，然而真实打印为 10 个 10。这就是函数作用域在作怪。上面代码只有等到 `for` 循环结束后才会打印输出，`f2` 中的 `i` 指向是 `f1` 函数作用域中的 `i` ，等到 `f2` 执行时 `i` 已经是 10 。

要想输出 0 到 10 也很简单。既然只有作用域才能捕获变量，那么我们可以在 `f1` 和 `f2` 之间再加一层函数作用域。

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

形如 `fn` 函数的用法称为**立即执行函数表达式**（IIFE，Immediately Invoked Function Expression），它会在每次循环中都执行一次，并把当时的 `i` 值作为参数被 `fn` 的函数作用域捕获。这样，执行 `f2` 时就会先查找到 `fn` 函数作用域中的 `i` 值。

要实现相同的效果，还有更简单的办法，那就是使用接下来要说的 `let` 。

## `let` 声明

为了避免 `var` 的各项怪异行为，ES 6 引入了 `let` ，它的语法与 `var` 相同，但是却有**更加严谨**的使用方式。主要表现为引入**块级作用域**，也称为**词法作用域**。

块级作用域的引入意味着不再需要使用创建函数来定义一个新的作用域，而只需要使用大括号 `{}` 即可以创建一个新的作用域。

块级作用域中的变量**必须先声明后使用**，相同作用域内**不允许重复声明**。

作为作用域，函数作用域和块级作用域是相同的，具有以下特点：

1. 寻找变量时逐层外外查找，直到找到为止，否则报引用错误
2. 内层作用域可以访问外层作用域内的变量，而反过来不行
3. 内层作用域变量会屏蔽（Shadowing）外层作用域中的同名变量（特点 1 的推论）
4. 作用域内代码即使已经执行完毕，该作用域捕获的变量仍然存在（闭包）

针对特点 4 举例：

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

上例中，运行 `getCity()` 时，`if` 代码块已经执行完毕，但是我们仍然可以使用 `city` ，因为 `fn` 函数作用域捕获了 `if` 块作用域内的 `city` 。

当 `let` 声明作为循环语句的一部分时，它有特殊表现：它为每次循环创建一个新的块级作用域，而不是为整个循环语句本身创建一个作用域。所以，上文中循环设置 `setTimeout` 的问题可以使用以下方式轻松解决，因为每次迭代时，`f2` 和 `f1` 之间都会创建一个新的块级作用域。

```ts
function f1() {
  for (let i = 0; i < 10; i++) {
    setTimeout(function f2() { console.log(i); }, 100 * i)
  }
}
f1();
```

## `const` 声明

`const` 与 `let` 一致，唯一不同的是，它声明的变量只能在声明时赋值，之后都**不能被再次赋值**，对应其他语言中所说的**常量**。

对于使用 `const` 声明的数组和对象，声明的变量本身是不能被修改的，但是数组元素和对象属性仍然是可以被修改。

## 解构（Destructuring）

解构把数据从数组或者对象中提取出来并赋值给对应变量。

### 数组解构

```ts
let [first, second] = [1, 2];
// => first = 1, second = 2

[second, first] = [first, second];
// swap => first = 2, second = 1

let [alpha, ...rest] = [1, 2, 3];
// => alpha = 1, rest = [2, 3]
```

### 对象解构

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

## 拓展运算符（Spread）

拓展运算符与解构相反，它把数据展开并合并到数组或者对象中，使用 `...` 语法。

```ts
let first = [1, 2];
let second = [3, 4];
let both = [...first, ...second];
// => both = [1, 2, 3, 4]

let o1 = { a: 1, b: 2, c: 3 };
let o2 = { b: 4, ...o1 };
// => o2 = { a: 1, b: 4, c: 3}
```

> 题外话：如果使用了 ES6 语法，但是又不想添加 `Object.asign` 的 polyfill ，此时可以使用展开实现相同的效果而不需 polyfill 。

注意：

* 同名时，后面的值**覆盖**前面的值
* 只展开对象本身的**可枚举属性**

```ts
class C {
  p = 12;
  m() {
  }
}
let c = new C();
let clone = { ...c };
clone.p; // ok
clone.m(); // error! 对象实例方法能展开
```