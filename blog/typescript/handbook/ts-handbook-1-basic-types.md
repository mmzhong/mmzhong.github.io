---
title: TypeScript 基础类型
createdDate: 2017-12-16
tags: typescript,types
desc: "TypeScript 快速手册：基础类型"
---

基础类型可以依据**是否含有类型关键字**分为两类：

* 含：`boolean`、`number`、`string`、`null`、`undefined`、`any`、`never`
* 不含：数组、元组、枚举

注意：所有类型关键字都是**小写**的。

> 注：这种分类不是很准确，分类的目的仅仅用于帮助记忆

## 声明格式

类型用来指定变量的类型，相同类型之间才能进行赋值、传参等操作。
声明变量类型使用 `变量名: 类型` 格式，如 `let decimal: number = 10`，声明之后 `decimal` 就只能接受 `number` 类型的赋值，否则编译器会报错。

## Array

声明为数组类型时，还需要指定数组元素类型，有以下两种等效方式：

* `let list: number[] = [1, 2, 3]`
* `let list: Array<number> = [1, 2, 3]`

如果数组元素类型有多种呢？那就需要使用元组（Tuple）。

## Tuple

**元组**可以指定固定索引位置的数组元素类型。

如 `let x: [string, number]` 表示第 0 位和第 1 位分别是 `string` 和 `number` 类型，第 2 位及之后可以是 `string` **或** `number`。

## Enum

枚举类型可以更加**友好**地定义**数值集合**。

```ts
enum Color { Red, Green, Blue }
let c: Color = Color.Red;
```

枚举类型默认从 0 开始递增标记成员，也可以**显式**标记部分或者所有成员。部分标记时，未标记成员按前向最近显式标记值递增。

```ts
enum Color { Red = 1, Green, Blue }
// 部分标记时，自动递增，因此 Green => 2, Blue => 3
enum Color { Red = 1, Green = 2, Blue = 4 }
```

一个很好用的功能是，枚举可以**反向查询**枚举成员名称，如：

```ts
enum Color { Red = 1, Green, Blue }
console.log(Color[2])
// => Green
```

## Any

`any` 表示任意类型，声明为 `any` 的变量可以赋予任意类型的值。

那是不是等于没有类型检测了？

之所以存在这种类型，原因有两：

1. 写代码时开发者也不是很明确要用哪种类型，或者只知道部分类型
2. 兼容用户输入或者第三方库

原因 2 中，比如应该把 `jQuery` 对象声明为什么类型呢？当然，可以声明为 `Object`，如 `let $: Object = jQuery`，这样赋值是没问题的。但是当调用函数时，比如 `$.ajax()`，编译器却会报错说找不到 `ajax()` 函数，但是声明为 `any` 却不会。

## Void

`void` 与 `any` 相反，表示不能出现任意类型，多用于定义无返回值的函数。

```ts
function warn(): void {
  alert('warning');
}
```

如果用于声明变量，那么只能接受 `undefined` 和 `null`，这样的声明其实是没啥用途的。

```ts
let unusable: void = undefined;
```

## Null 和 Undefined

`null` 和 `undefinded` 跟 `void` 一样，定义类型本身是没啥用途的，但是需要注意的是，他们是其他任何类型（包括 `void`）的**子类型**。因此，可以把 `null` 赋值给 `number` 类型，`let decimal: number = null`。

但是，**不建议**这种用法，可以使用 `--strictNullChecks` 选项来关闭。这样的话，`null` 和 `undefined` 就只能赋值给 `void` 和它们本身。

## Never

`never` 表示这种类型的值**永远不会出现**。听起来很奇怪，但是它确实有应用场景。

最大的场景就是用在函数返回值中，如：

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

## 类型断言

TS 编译器会按照声明规则自动检查变量类型，免去了开发者自己检查的烦恼。但是作为规则，它是固定死的，有时也需要灵活“通融”一下。

类型断言就是一种“通融”方式，实质上是一种**类型转换**（Type cast），它告诉编译器“相信我，我知道我在做什么，我为我的行为负责”，然后编译器就会把它认为是兼容的类型。

类型断言有两种语法形式，下例中都是将变量 `anyTypeValue` 转为 `string` 类型：

* angle-bracket-syntax: `(<string>anyTypeValue).length`
* as-syntax: `(anyTypeValue as string).length`

**推荐使用 `as` 语法**，因为当 TS 与 JSX 一起使用时，只允许 `as` 语法。