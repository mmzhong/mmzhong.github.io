---
layout: post
title: TypeScript 高级类型
tags: typescript,handbook,advanced types
desc: "TypeScript 快速手册：高级类型"
---

预备知识：

* 所有类型（包括原始类型）都可以像变量一样参与运算，运算结果为类型
* 类型运算符包括 `typeof`、`keyof`、`[]`、`in`、`&`、`|` 等

所以要获得一种新类型，有两种方式： 1. 直接定义； 2. 使用类型运算。
预备知识有助于理解本文内容。

## 交集类型

交集类型（Intersection Type）是把多种类型**合并**在一起形成的一种**新类型**，新类型拥有所有类型的成员。

交集类型可以认为是多种类型是 `and` 的关系，使用 `&` 表示。
例如 `Person & Serializable & Loggable` 由三种类型合并而成，该类型的对象将会拥有三种类型的所有成员。

交集类型多见于**混合**（Mixin）和其他不符合经典面向对象编程模式的用法中，但是这些用法却在 JS 中经常用到，比如 `extend()` 函数。

## 联合类型

联合类型是并集关系，可以认为是多种类型是 `or` 的关系，使用 `|` 表示。例如 `string | number` 表示该类型接受 `string` 或 `number` 类型。

注意，使用联合类型时，我们只能访问联合类型的**共有成员**。如：

```ts
interface Bird {
  fly();
  layEggs();
}
interface Fish {
  swim();
  layEggs();
}
function getSmallPet(): Fish | Bird {
  // ...
}
let pet = getSmallPet();
pet.layEggs(); // => ok
pet.swim();    // => error
```

这是因为对于 `A | B` ，编译时能确认的仅仅是 `A` 和 `B` 都有的成员。上例中，`layEggs()` 是 `Bird` 和 `Fish` 都有的成员，所以不管运行时 `pet` 是其中的哪种，调用 `layEggs()` 都不会出错。但如果运行时 `pet` 为 `Bird` ，那么调用 `swim()` 就肯定会出错。为了避免这种运行时错误，编译器就只能让我们使用联合类型的共有成员。

当然，我们也可以在调用前先判断是否是特定类型然后再调用其方法，这就是下面要说的内容。

## 类型守卫和类型辨别

要想在运行时辨别某种具体的类型，最简单的办法是检查其成员是否存在，如：

```ts
let pet = getSmallPet();
if (pet.swim) { // => error
  pet.swim();
}
```

这种用法在 JS 中是没问题的，但是在 TS 中则会引发错误，因为联合类型仅能访问共有成员。为了解决这个错误，可以简单的使用类型断言：

```ts
if ((<Fish>pet).swim) {
  (<Fish>pet).swim();
}
```

还有一种办法是，使用用户自定义的类型守卫（Type Guard）。类型守卫是一种确认运行时类型的表达式。
为了定义类型守卫，只需要定义一个返回值类型为**类型断定**（Type Predicate）的函数：

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (<Fish>pet).swim !== undefined;
}
```

其中，`pet is Fish` 就是类型断定。类型断定的格式为 `parameterName is Type` ，其中的 `parameterName` 必须是当前函数的参数名。

更好的办法是，一种与 JS 中判断类型的类似用法，那就是使用 `typeof` 类型守卫。

```ts
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

`typeof` 类型守卫有两种格式：`typeof v === "typename"` 和 `typeof v !== "typename"` ，其中的 `"typename"` 必须为 `"number"`、`"string"`、`"boolean"` 和 `"symbol"` 之一。
如果不是那四种基本类型，编译器也不会引发错误，但是不会被识别为类型守卫。

同样的，TS 也提供 `instanceof` 类型守卫，用于根据构造函数来辨别类型。用法与 JS 中一致，如 `pet instanceof Fish` 。
使用 `instanceof` 时，TS 编译器会按序把类型定位到：

1. 如果该类型不是 `any`，会确定为构造函数 `prototype` 属性的类型
2. 该类型所有构造函数（包括父类的）返回值组成的联合类型

## 可为空类型

TS 中有两种特殊的类型：`null` 和 `undefined` 。
默认的，编译器认为这两种类型可以赋值给任何类型。这意味着，即使我们想禁止这种赋值行为，默认情况下也是不可能阻止的。

但是我们可以改变默认行为，即开启 `--strictNullChecks` 标记。开启后，声明的类型就不会自动包含 `null` 和 `undefined` 。如果要支持它们，必须手动添加形成一个联合类型。

```ts
// --strictNullChecks
let s = 'foo';
s = null; // => error
let sn: string | null = 'foo';
sn = null; // => ok
sn = undefined; // => error
```

### 可选参数和属性

开启 `--strictNullChecks` 后，可选参数和可选属性类型的后面会自动添加 `| undefined` 。

```ts
function f(x: number, y?: number) {
  return x + (y || 0);
}
f(1); // => ok
f(1, undefined); // => ok
```

### 类型守卫和类型断言

如何判断当前值是否是 `null` 呢？

与 JS 中一样的方法是：

```ts
function f(sn: string | null): string {
  if (sn == null) {
      return "default";
  }
  else {
      return sn;
  }
}
```

或者简写为：

```ts
function f(sn: string | null): string {
  return sn || "default";
}
```

但是还有些情况下，编译器并不能消除 `null` 或 `undefined` ，此时可以使用类型断言操作来手动移除空类型。其语法是 `identifier!` ：

```ts
function broken(name: string | null): string {
  function postfix(epithet: string) {
    return name.charAt(0) + '.  the ' + epithet; // error, 'name' is possibly null
  }
  name = name || "Bob";
  return postfix("great");
}
function fixed(name: string | null): string {
  function postfix(epithet: string) {
    return name!.charAt(0) + '.  the ' + epithet; // ok
  }
  name = name || "Bob";
  return postfix("great");
}
```

上面的例子中使用了嵌套函数，虽然我们很容就能看出 `name` 已经不可能是 `null` 值了，但是编译器并不知道 `postfix()` 中的 `name` 值不会是 `null` 值，因为编译器不会运行我们的函数，它只是会进行静态检测。
所以这里我们需要用 `!` 手动告知编译器从 `name` 的类型中移除 `null` 和 `undefined` 。

## 类型别名

使用类型别名我们为类型创建了一个新的名称，但是要注意，并没有创建新类型。

类型别名也支持泛型，也可以使用类型参数：

```ts
type Container<T> { value: T };
```

也可以让类型别名在**属性**中引用自身：

```ts
type Tree<T> = {
  value: T;
  left: Tree<T>;
  right: Tree<T>;
}
```

结合交集类型和类型别名，可以创造出令人相当费解的类型：

```ts
type LinkedList<T> = T & { next: LinkedList<T> };
interface Person { name: string };
let people: LinkedList<Person>;
let s = people.next.next.next.name;
```

但是，**不允许**类型别名出现在**非属性**中：

```ts
type Yikes = Array<Yikes>; // => error
```

上面的 `Tree<T>` 跟定义接口非常相似，但是类型别名与接口还是存在一些微小的差别，值得注意。

首先一点是，接口创建了一种新类型，但是类型别名没有。

其次是，类型别名不能被继承且不能被实现。所以考虑到开放拓展原则，我们应尽量使用接口代替类型别名。
但是，也有接口做不到的事情，比如需要使用联合类型来表示某种类型，那么类型别名将会是个好办法。

## 字面量字符串类型

字面量字符串类型（String Literal Types）允许我们限定值的类型只能是某些固定的值。
实际应用中，它跟联合类型、类型守卫和类型别名结合在一起会非常有用。

```ts
type Easing = "ease-in" | "ease-out" | "ease-in-out";
```

它也能用在函数重载中用做不同类型参数：

```ts
function createElement(tagName: "img"): HTMLImageElement;
function createElement(tagName: "input"): HTMLInputElement;
```

## 字面量数值类型

与字符串一样，也有字面量数字类型（Numeric Literal Types）。

```ts
function rollDie(): 1 | 2 | 3 | 4 | 5 | 6 {
  // ...
}
```

## 枚举成员类型

从字面量字符串类型、字面量数值类型和字面量对象类型可以看出，每个字面量值都是一种独立的类型。
因此，当枚举的所有成员都是字面量初始值时，该枚举的每个成员也都是一种独立的类型。

大多数时候，我们所说的单例类型（Singleton Types），指的就是枚举成员类型和数值/字符串字面量类型，也有不少人使用另一种叫法：字面量类型。

## 可辨识联合类型

可以结合单例类型、联合类型、类型守卫和类型别名写出一种高级模式的类型用法，称为**可辨识联合**（Discriminated Unions），或标签联合（Tagged Unions）或代数数据类型（Algebraic Data Types）。
这种高级用法在函数式编程中特别有用。

可辨识联合类型是指一组不同的类型，但是这些类型中的某个成员每种类型都有的。
因此，要形成这种高级类型，需要具备以下条件：

1. 不同类型之间有共同的单例类型属性，即辨别
2. 定义类型别名为这些类型组成的联合类型，即联合
3. 类型守卫应用于辨别属性

```ts
interface Square {
  kind: "square";
  size: number;
}
interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}
interface Circle {
  kind: "circle";
  radius: number;
}
```

上面每个类型都有共同的 `kind` 成员，而且是不同的字面量字符串类型，`kind` 称为**可辨识成员**或**标签成员**。

```ts
type Shape = Square | Rectangle | Circle;
```

其次定义一个联合类型的类别别名把这些类型关联起来。最后就可以使用这个可辨识联合类型了。

```ts
function area(s: Shape) {
  switch (s.kind) {
    case "square": return s.size * s.size;
    case "rectangle": return s.height * s.width;
    case "circle": return Math.PI * s.radius ** 2;
  }
}
```

不过这样看起来，我们好像并没有获得任何好处。
先别急。如果此时我们再新增了一种 `Triangle` 类型：

```ts
type Shape = Square | Rectangle | Circle | Triangle;
function area(s: Shape) {
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.height * s.width;
        case "circle": return Math.PI * s.radius ** 2;
    }
    // should error here - we didn't handle case "triangle"
}
```

使用可辨识联合类型的好处就是编译器知道 `kind` 的所有可能情况，这样就有助于**完整性检查**（Exhaustiveness Checking） `switch` 的所有可能情况。
上面我们新增 `Triangle` 后，我们希望编译器会提醒我们漏掉了 `Triangle` ，但是并没有。还需要再增加点内容。

为了实现这个功能，有两种办法：

1. 开启 `--strictNullChecks` 并声明返回值类型

```ts
function area(s: Shape): number { // error: returns number | undefined
  switch (s.kind) {
    case "square": return s.size * s.size;
    case "rectangle": return s.height * s.width;
    case "circle": return Math.PI * s.radius ** 2;
  }
}
```

其实，形成可辨识联合类型后，编译器已经能够掌握 `kind` 的所有情况了。怎么证明呢？我们把光标移到 `area` 处会提示函数签名类型：

* `--strictNullChecks` 未开启时，`area()` 返回值类型被推断为 `number`
* `--strictNullChecks` 开启后，`area()` 返回值类型被推断为 `number | undefined`

这个多出来的 `undefined` 好理解，因为没有匹配中 `switch` 的任何 `case` 时，函数隐式返回的值就是 `undefined` 。

但如果我们加上 `case "triangled": `，此时的 `area()` 返回值类型被推断为了 `number` ，`undefined` 被移除了！

这个方法里声明返回值类型的作用就在于使得推断类型与声明类型产生冲突，从而提示开发者遗漏的情况。

2. 使用 `never` 类型来让编译器检查所有的可能

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}
function area(s: Shape) {
  switch (s.kind) {
    case "square": return s.size * s.size;
    case "rectangle": return s.height * s.width;
    case "circle": return Math.PI * s.radius ** 2;
    default: return assertNever(s); // error here if there are missing cases
  }
}
```

当我们遗漏掉 `Triangle` 的情况时，`s` 就会被赋值为一个 `Triangle` 类型，从而引发类型冲突。

## this 类型的多态性

this 类型的多态性指的是类或者接口的子类型中 `this` 的多态特性。
这种多态称为**F-界多态性**（F-bounded Polymorphism），利用这种特性，可以更容易实现链式调用。

```ts
class BasicCalculator {
  public constructor(protected value: number = 0) { }
  public currentValue(): number {
    return this.value;
  }
  public add(operand: number): this {
    this.value += operand;
    return this;
  }
  public multiply(operand: number): this {
    this.value *= operand;
    return this;
  }
}
let v = new BasicCalculator(2)
  .multiply(5)
  .add(1)
  .currentValue();
```

拓展下此类：

```ts
class ScientificCalculator extends BasicCalculator {
  public constructor(value = 0) {
    super(value);
  }
  public sin() {
    this.value = Math.sin(this.value);
    return this;
  }
}
let v = new ScientificCalculator(2)
  .multiply(5)
  .sin() // => ok
  .add(1)
  .currentValue();
```

从 `BasicCalculator` 的定义可以看出， `multiply()` 返回值类型是 `BasicCalculator` 。
`multiply()`  后紧接着调用 `sin()` ，然而 `BasicCalculator`
并没有 `sin()` 方法，按理说此处应该会引发编译错误，但是并没有。
这就是 this 类型多态性的体现。因为 this 类型的多态性，编译器会自动把 `multiply()` 返回值类型会自动切换为 `ScientificCalculator` 。

## 索引类型

索引类型用来帮助编译器检查使用动态属性名称的代码。

比如在 JS 中，常常有以下用法：

```js
function pluck(o, names) {
  return names.map(n => o[n]);
}
```

为了避免运行时错误，我们希望 `names` 中所有的元素都是 `o` 拥有的成员。在 TS 中，可以使用索引类型查询运算符和索引访问运算符来实现这一检查。

```ts
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}
interface Person {
  name: string,
  age: number
}
let person: Person = { name: 'BirdMan', age: 18 };
let strings: string[] = pluck(person, ['name']); 
```

编译器会检查 `person` 是否拥有 `name` 属性。这里用到了两种**类型运算**：

* `keyof T` 称为**索引类型查询运算**（Index Type Query Operator）

对于任何类型 `T` ，`keyof T` 就是 `T` 的所有**公有属性**成员名称组成的联合类型。如 `keyof Person` 等价于 `'name' | 'age'` 。

* `T[K]` 称为**索引访问运算**（Indexed Access Operator）

它与数组或者对象的成员运算符 `[]` 类似，只不过作用的对象是类型 `T`，值为对应键名的类型。如 `Person['name']` 表示的类型为 `string` 。

## 映射类型

经常会有这样的需求：基于一个现有类型创建所有属性都是可选属性的新类型。
例如，基于 `Person` 创建一个所有属性都为可选属性的新类型：

```ts
interface Person {
  name: string,
  age: number
}
// 手动定义
interface PersonPartial {
  name?: string,
  age?: number
}
```

有什么办法能不从头开始定义 `PersonPartial` 吗？因为这样很麻烦呢！

有。TS 提供了这么一种基于旧类型创建新类型的方式：**映射类型**。
在映射类型中，新类型会使用相同的方式**转换**旧类型的每个属性。
比如：

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}
type PersonPartial = Partial<Person>;
```

`Partial<T>` 就是映射类型，它里面使用的 `in` 运算符与 `for .. in` 类似，`P` 会循环绑定 `keyof T` 的所有元素。
要注意的是，映射类型仅能作用于公有成员属性，不含成员方法，这是由 `keyof` 运算所决定的。

类似的，还可以定义：

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}
```

也可以把 `keyof T` 移动到类型变量中，以约束第二个类型变量：

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[K];
}
type Record<K extends string, T> = {
  [P in K]: T;
}
```

`Partial`、`Readonly`、`Pick` 和 `Record` 是非常常用的，所以 TS 的标准库中默认就已经包含了。
它们中前三个是同态的，称为**同态类型**（Homomorphic Type）。
同态意味着**映射转换不会丢失修饰符**，属性原来拥有什么修饰符，经过映射后的属性仍然拥有对应的修饰符。
比如，如果 `Person.name` 是 `readonly` 的，那么 `Partial<Person>.name` 将变成是只读且可选的。

`Record` 不是同态类型，因为它并没有一个输入类型可以作为它复制属性的来源。
非同态类型实质上是创建了新属性，所以它们不能从任何地方复制属性修饰符。

多个映射类型一起使用的例子：

```ts
interface Person {
  name: string,
  age: number
}

type ReadonlyAndPartialPerson = Readonly<Partial<Person>>;
// equals to 
type ReadonlyAndPartialPerson = {
  readonly name?: string;
  readonly age?: number;
}
```

一个实际的使用例子：

```ts
type Proxy<T> = {
  get(): T;
  set(value: T): void;
}
type Proxify<T> = {
  [P in keyof T]: Proxy<T[P]>;
}
function proxify<T>(o: T): Proxify<T> {
  let result = {} as Proxify<T>;
  for (const k in o) {
    result[k] = {
      get(): T[keyof T] {
        return o[k];
      },
      set(value: T[keyof T]): void {
        o[k] = value;
      }
    }
  }
  return result;
}
let person = {
  name: 'mm',
  age: 18
};
let proxyPerson = proxify(person);
console.log(proxyPerson.name.get()); // => mm
```

### 映射类型推断

映射类型的作用是**包装**（Wrap）类型属性，**展开**（Unwrapping）也是很容易的。

```ts
function unproxify<T>(t: Proxify<T>): T {
  let result = {} as T;
  for (const k in t) {
    result[k] = t[k].get();
  }
  return result;
}
let orignalPerson = unproxify(proxyPerson);
```

上面的例子中，编译器能根据映射类型推断出函数返回值的类型。

展开推断仅能用于同态映射类型。如果映射类型不是同态的，那么必须给函数额外新增一个显式的类型参数。