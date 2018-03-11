---
title: TypeScript JSX
createdDate: 2018-01-05
tags: typescript,jsx
desc: "TypeScript 快速手册：JSX"
---

JSX 因为 React 的流行而被大众所熟悉。
TS 当然不会放过这个烫手山芋啦~
TS 支持对 JSX 进行类型检查，并且能直接把它转为 JS 。

## 基本用法

为了使 TS 支持 JSX ，需要做以下两件事：

1. 文件拓展名使用 `.tsx`
2. 开启 `jsx` 选项

开启 `jsx` 选项可以使用命令行参数 `--jsx` 或者在 `tsconfig.json` 中配置。

TS 自带的 JSX 支持三种模式： `preserve`，`react` 和 `react-native` 。
这些模式仅仅作用于代码生成阶段，不会影响到 JSX 的类型检查。

`preserve` 模式不会对任何 JSX 进行转换，仅仅是把文件拓展名改为 `.jsx` 。

`react` 模式使用 `React.createElement` 转换 JSX ，并把文件拓展名改为 `.js` 。

`react-native` 模式也不会对任何 JSX 进行转换，但是会把文件拓展名改为 `.js` 。

对比如下：

| 模式 | 输入 | 输出 | 输出文件拓展名 |
| --- | --- | --- | --- |
| `preserve` | `<div />` | `<div />` | `.jsx` |
| `react` | `<div />` | `React.createElement("div")` | `.js` |
| `react-native` | `<div />` | `<div />` | `.js` |

其中，`React` 是写死的，所以必须确保其可用。

## `as` 运算

类型断言有两种方式，其中一种是使用尖括号，如 `let foo = <foo>bar;` 。
由于 JSX 中也用到了尖括号，使得难以区分到底是类型断言还是 JSX 。
因此，TS 索性不允许在 `.tsx` 文件中使用尖括号类型断言。

但是可以使用 `as` 类型断言，它在 `.ts` 和 `.tsx` 中均能使用。

## 类型检查

为了理解 JSX 的类型检查，首先必须的区分什么是**内置元素**（Intrinsic Elements）和**值元素**（Value-based Elements）。
对于给定的 JSX 表达式 `<expr />` ，`expr` 可能是当前环境固有的元素（如 DOM 环境中的 `div` ），也可能是自定义组件。

区分这两种元素的原因在于：

1. 创建方式不一样。在 React 中，内置元素使用 `React.createElement('div')` 创建，而自定义组件使用 `React.createElement(MyComponent)` 。
2. 传递给 JSX 元素的属性类型查找方式不一样。内置元素属性是固定的，而自定义组件的属性则是自定义的。

TS 采用与 React 一样的元素名称转换方式：内置元素都转成小写字母，值元素使用首字母大写的驼峰式命名。

### 内置元素

内置元素存不存在是通过接口 `JSX.IntrinsicElements` 来查找的。
默认的，如果该接口没有具体的定义，那么内置元素可以是任何元素，且不会对其进行类型检查。
但是，如果定义了该接口，那么只有定义了的属性名称才是内置元素。

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
  }
}
<foo />; // => ok
<bar />; // => error
```

上面的例子中，`JSX.IntrinsicElements` 中定义了 `foo` 属性，所以 `<foo />` 才算是内置元素。

### 值元素

值元素存不存在则是通过查找当前作用域来实现的。

```ts
import MyComponent from './myComponent`;
<MyComponent />; // => ok
<OtherComponent />; // => error
```

有两种定义值元素的方法：

1. 无状态函数组件（Stateless Functional Component, SFC）
2. 类组件（Class Component)

由于无法直接从 JSX 表达式中区分是 SFC 还是类组件，所以编译器首先把它作为 SFC 来解析，如果解析成功，那么就使用 SFC ；
然后，再作为类组件解析；如果都无法正常解析，那么就抛出错误。

### SFC

无状态函数组件就是普通的函数，它的第一个参数为 `props` 对象，返回值为 JSX 。
为此， TS 编译要求它的返回值必须能赋值给 `JSX.Element` 。

```ts
interface FooProp {
  name: string
}
declare function AnotherComponent(prop: {name: string});
function ComponentFoo(prop: FooProp) {
  return <AnotherComponent name=prop.name />;
}
```

既然 SFC 是普通函数，那么我们也可以对它进行**函数重载**。

```ts
interface ClickableProps {
  children: JSX.Element[] | JSX.Element;
}
interface HomeProps extends ClickableProps {
  home: JSX.Element;
}
interface SideProps extends ClickableProps {
  side: JSX.Element;
}
function MainButton(prop: HomeProps): JSX.Element {};
function MainButton(prop: SideProps): JSX.Element {};
```

### 类组件

在此对类组件进行类型检查之前，首先要理解两个概念：**元素类类型**和**元素实例类型**。

对于 `<Expr />`，它的元素类类型就是类型 `Expr` 。
元素实例类型是类类型调用签名和构造函数签名的联合类型。
对于 ES6 类来说，元素实例类型就是类实例类型，如果是个工厂函数，那就是其返回值类型。

```ts
// 类
class MyComponent {
  render() {}
}
// 使用构造函数签名
let myComponent = new MyComponent();
// 元素类类型 => MyComponent
// 元素实例类型 => { render: () => void }

// 工厂函数
function MyFactoryFunction() {
  return {
    render: () => {
      // ...
    }
  }
}
// 使用调用签名
let myComponent = MyFactoryFunction();
// 元素类类型 => MyFactoryFunction
// 元素实例类型 => { render: () => void }
```

元素实例类型必须能赋值给 `JSX.ElementClass` ，否则引发编译错误。
`JSX.ElementClass` 默认为 `{}` ，但可以通过类型合并来增强对类型的限制。

```ts
declare namespace JSX {
  interface ElementClass {
    render: any;
  }
}
class MyComponent {
  render() {}
}
function MyFactoryFunction() {
  return { render: () => {} }
}

<MyComponent />; // => ok
<MyFactoryFunction />; // => ok

class NotAValidComponent {}
function NotAValidFactoryFunction() {
  return {};
}

<NotAValidComponent />; // => error
<NotAValidFactoryFunction />; // => error
```

### 属性类型检查

对属性类型进行检查的第一步是要确定**元素属性类型**，内置元素和值元素的确定方式略有不同。

对于内置元素来说，它的元素属性类型就是在 `JSX.IntrinsicElements` 中声明的类型。

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: {
      bar?: boolean
    }
  }
}

<foo bar />; // => ok
```

对于值元素，会更复杂些。它的类型由元素实例类型中的 `props` 属性决定。
`props` 也可能是其它名称，这个由 `JSX.ElementAttributesProperty` 决定，该类型只能声明一个属性，该属性就是 `props` 对应的名称。

```ts
declare namespace JSX {
  interface ElementAttributesProperty {
    props: {}; // 指定唯一的属性名称和类型
  }
}
class MyComponent {
  // 声明元素实例类型的属性
  props: {
    foo?: string;
  }
}

<MyComponent foo="bar" />
```

一个元素属性类型检查的例子：

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: { requiredProp: string; optionalProp?: number }
  }
}
<foo requiredProp="bar" />; // => ok
<foo requiredProp="bar" optionalProp={0} />; // => ok
<foo />; // => error, 属性 requiredProp 缺失
<foo requiredProp={0} />; // => error, 属性 requiredProp 应该是 string
<foo requiredProp="bar" unknownProp />; // => error, 属性 unknownProp 不存在
<foo requiredProp="bar" some-unknown-prop />; // => ok, 因为属性 some-unknown-prop 不是合法的标识符
```

注意，如果属性名称不是合法的 JS 标识符，如 `data-*` ，那么编译器会忽略对其检查。

使用展开运算符也是可以的。

```ts
let props = { requiredProp: "bar" };
<foo {...props} />; // => ok

let badProps = {};
<foo {...badProps} />; // => error
```

### 子元素类型检查

从 v2.3 开始，TS 新增了对子元素的类型检查。
与元素属性类型类似，子元素的属性名由 `JSX.ElementChildrenAttribute` 决定。

```ts
declare namespace JSX {
  interface ElementChildrenAttribute {
    children: {}; // 指定唯一的子元素名称和类型
  }
}
```

如果没有显式定义子元素的类型，那么默认使用 [React typings](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) 中的类型。

也可以声明子元素为其他任何类型，这会覆盖 React typings 的默认类型。
JSX 允许使用 `{ }` 来嵌入表达式。


```ts
interface PropsType {
  children: JSX.Element;
  name: string;
}

class Component extends React.Component<PropsType, {}> {
  render() {
    return (
      <h2>
        { this.props.children }
      </h2>
    )
  }
}

<Component>
  <h1>hi</h1>
</Component>
// => ok

<Component>
  <h1>hi</h1>
  <h1>hi</h1>
</Component>
// => error, 子元素必须是 JSX.Element 而不是 JSX.Element 数组

<Component>
  <h1>hi</h1>
  mm
</Component>
// => error, 子元素必须是 JSX.Element 而不是 JSX.Element | string 的数组
```

## JSX 返回值类型

默认的，JSX 返回值类型为 `any` 。开发者可以通过 `JSX.Element` 接口来声明自定义类型。
但是，无法该接口中获取 JSX 的元素、属性或子元素的类型信息。它对编译器来说就是黑盒。

## React 集成

为了能在 React 中使用 JSX，应该使用 [React typings](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)。
它在 JSX 命名空间中定义了很多适当的类型。

安装了 `@types/react` 之后，编译器会默认加载 `react.d.ts` ，我们可以直接在代码中使用。

```ts
interface Props {
  foo: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>;
  }
}

<MyComponent foo="bar" />; // => ok
<MyComponent foo={0} />; // => error
```
