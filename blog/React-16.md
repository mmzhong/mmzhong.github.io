# React v16

## JSX

JSX 是 JavaScript 的语法拓展，在 React 中用来构建 UI 。与模板语言不同的是，它支持完整的 JavaScript 功能。

* 使用中括号 `{}` 来插值，支持任何 JS 表达式
* 属性名称使用`camelCase`格式命名，用`""`或者`{}`给属性赋值，注意 `className` & `htmlFor`
* 支持自闭标签和嵌入子元素
* 任何插值自动 `escapes` ，避免 XSS
* JSX 本质上是 JS 对象，可以进行参与表达式操作
* JSX 必须只有一个根元素

JSX 经过编译后，最终都是使用 `React.createElement(component, props, ...children)` 来表示。因此，当前作用域必须能够访问 `React` ，这也是为什么每个组件文件都要 `import React from 'react'` 的原因。

## React element

React element VS DOM element：

* 两者都与 UI 组成部分一一对应
* React element 是很简单的 JS 对象，可以大量创建；而 DOM element 耗资源，不宜大量创建；
* React element 一旦创建，它的属性和子元素不能再修改

React DOM 会自动使用最优策略把 React element 的更新同步到 DOM 。

## Component

使用组件我们把 UI 划分为多个**独立的、可复用**的多个部分。它就像 JS 函数，从外界接收输入（即 `props`）并返回 React elements 。由此可以看出，React element 是组件的组成成分。

* 组件的命名使用 `CamelCase` 格式
* `props` 是只读的，切勿修改
* 所有的组件必须是对 `props` 的纯函数

### Functional Component VS Class Component

函数组件是最简答的组件，只需要定义一个 `(props) => ReactElement` 类型的函数。它不含内部状态，组件完全依赖于外部传入的属性，**无内部状态**。

当然，使用 `class` 定义一个只有 `render()` 函数的类也是等效的函数组件。

类组件使用 `class` 定义，通常需要**维护自己的内部状态**。

### Controlled Components VS Uncontrolled Components

受控组件的表单数据**由组件本身维护管理**，它为表单设置一个 `onChange` 属性，每当表单数据变化时会将表单数据同步到组件内部维护的状态中。当需要获取表单数据时，直接从组件状态获取即可。

不受控组件的表单数据**由表单元素自己管理维护**。当需要获取表单数据时，需要主动从表单元素获取，通常与 Ref 一起使用。

| Feature | Controlled | Uncontrolled |
| --- | --- | --- |
| 表单数据获取 | 从组件状态获取 | 从表单元素中获取 |
| 表单数据设置 | `value` 或 `checked` 属性 |表单元素自行设置，使用 `defaultValue` 或 `defaultChecked` 设置默认值 |
| 优点 | 坚持唯一数据源原则 | 实现简单 |
| 缺点 | 样板代码较多（`onChange`） | 有违唯一数据源原则 |

## Ref

`ref` 提供了一种直接操作外部 DOM 或 React Component 的能力，但这不符合组件化的思想，应尽量避免。

经典应用场景：

1. 输入框聚焦、文本选择或者媒体播放控制
2. 触发动画
3. 与第三方 DOM 库一起集成时

`ref` 属性是一个带有一个参数的函数。如果宿主是 DOM 元素，那么这个参数就是当前 DOM 元素；如果宿主是一个类组件，那么这个参数就是该类组件实例；如果是函数组件，那么就是用法错误，因为函数组件不会实例化，但是可以在函数组件**内部**使用 `ref`。

