---
layout: post
title: Python 3 快速入门
date: 2017-11-21
tags: python3
desc: 简短的 Python 入门示例
---

这是一篇简短的入门总结，主要参考自 [Learn X in Y minutes: Python 3](https://learnxinyminutes.com/docs/python3/)。

```python
# 单行注释，无多行注释

"""
多行字符串
通常作为模块或者函数的文档字符串
"""

####################################################
## 1. 数据类型和操作
####################################################

# 整除
5 // 3    # => 1
-5.0 // 3 # => -2.0

# 除法
10.0 / 3  # => 3.3333333333333335

# 求余（取模）
7 % 3     # => 1

# 幂乘
2**3      # => 8

# Boolean, 大写开头
True
False

# 逻辑操作
not  True      # => False
True and False # => False
False or True  # => True

# 与整数一起运算时，False 等于 0，True 等于 1
0 and 2  # => 0
-5 or 0  # => -5
0 == False # => True
2 == True  # => False
-5 != False != True # => True

# 比较操作，链式比较时要所有都满足
1 == 1 # => True
1 != 1 # => False
2 <= 2 # => True
2 >= 2 # => True
1 < 2 < 3 # => True，等效于 1 < 2 and 2 < 3

# `is` 操作判断两者是否指向相同对象，`==` 操作比较值相等
a = [1, 2]
b = [1, 2]
b is a # => False，指向不同
b == a # => True，值相同

# 字符串使用双引号或者单引号，字符串连接可以用 `+` 或者什么都没有（不能有变量）
"Hello " + 'world!' # => "Hello world!"
"Hello " 'world!'   # => "Hello world!"

# 字符串是字符数组
"Hello"[0]   # => "H"
len("Hello") # => 5

# 字符串插值, 可以指定索引或者名称
"{} and {}".format("a", "b") # => "a and b"
"{0}: {0} and {1}".format("a", "b") # => "a: a and b"
"{first} and {second}".format(first="a", second="b") # => "a and b"

# None 是对象，请使用 `is` 来进行与 None 的比较操作
None         # => None
None is None # => True

# None、0、空字符串、空列表、空字典和空元组转化为 Bool 值都是 False
bool(0) == bool("") == bool([]) == bool({}) == bool(()) == False # => True

####################################################
## 2. 变量与集合
####################################################

# 变量不用声明，赋值即变量定义，惯例是使用 lower_case_with_underscores 格式命名
some_var = 6
some_var # => 6

# 引用未定义的变量会抛异常
some_unknown_var # => NameError

# if 语句可以用作表达式，相当于三元操作符 `?:`
"Hello" if 3 > 2 else "World" # => "Hello"

# 列表
li = []
li.append(1) # => [1]，返回值 None
li.pop()     # => []，返回值为 1
len(li)      # => 0

# 索引从 0 开始，超出范围抛 IndexError 异常，负数索引从尾端开始算起
li2 = [1, 2, 3]
li2[0]  # => 1
li2[-1] # => 3
li2[4]  # => IndexError

# 列表分片，不更改原列表，返回新列表
# 分片语法为 [start:end:step]，包含 start，不含 end
# start 默认为 0，end 默认为列表长度，step 默认为 1
li2[1:3] # => [2, 3]
li2[2:]  # => [3]
li2[:2]  # => [1, 2]
li2[::-1] # => [3, 2, 1]，反向
li2[:]    # => [1, 2, 3]，深拷贝

# 删除列表元素，使用索引
del li2[0] # => [2, 3]

# 删除列表元素，使用元素值，只删除最先出现的位置处的元素
li3 = [1, 2, 1, 3]
li3.remove(1) # => [2, 1, 3]

# 指定索引位置前面插入元素
li3.insert(1, 4) # => [2, 4, 1, 3]

# 列表拼接
[1] + li3 # => [1, 2, 4, 1, 3]，li3 本身不变
li3.extend([2]) # => li3.extend([2])，修改 li3 自身

# 检查元素是否在列表中
5 in li3 # => False

# 解包
li4 = [1, 2]
a, b = li4        # => a is 1, b is 2
a, b = [1]        # => ValueError
a, *b = [1, 2, 3] # => a is 1, b is [2, 3]

# 元组跟列表很类似，但是元组是只读的
t = (1, 2, 3)
t[0]     # => 1
t[0] = 3 # => TypeError

# 长度为 1 的元组必须加上冒号 `,`
type((1))  # => <class 'int'>
type((1,)) # => <class 'tuple'>
type(())   # => <class 'tuple'>

# 元组支持大多数列表操作，只要是不修改原始元组的操作
len(t)     # => 3
t + (4, 5) # => [1, 2, 3, 4, 5]
t[:2]      # => (1, 2)
a, *b = (1, 2, 3) # => a is 1, b is (2, 3)

# 字典，key 可以是任何类型，但是必须是不可修改类型，如整数、浮点数、字符串、元组
invalid_dict = {[1,2]: "12"} # => TypeError
valid_dict = {(1, 2): "12"}
valid_dict[(1, 2)]           # => "12"
valid_dict["a"]              # => KeyError

# 获取 keys/values 列表，必须使用 `list()` 转换才能成为列表
list(valid_dict.keys())   # => [(1, 2)]
list(valid_dict.values()) # => ["12"]

# 函数操作
d = {"a": 1, "b": 2}
d.get("a")    # => 1
d.get("c")    # => None，不会抛异常
d.get("c", 4) # => 4, 不存在时使用默认值
d["a"] = 3    # => {"a": 3, "b": 2}
d.update("a", 3) # => {"a": 3, "b": 2}

# 设置默认值，只有在 key 对应的值不存在时才有效
d.setdefault("c", 5) # d["c"] is 5
d.setdefault("c", 6) # d["c"] is still 5

# 删除
del d["c"] # => {"a": 3, "b": 2}

# Python 3.5 之后可以使用解包
{"a": 1, **{"b": 2}} # => {"a": 1, "b": 2}

# 集合，集合元素也必须是不可修改类型
empty_set = set()
some_set = {1, 1, 2, 3} # => {1, 2, 3}

# 新增
some_set.add(4) # => {1, 2, 3, 4}

# 集合运算
other_set = {3, 4, 5}
some_set & other_set # => {3, 4}， 交集
some_set | other_set # => {1, 2, 3, 4, 5}，并集
some_set - other_set # => {1, 2}，差集
some_set ^ other_set # => {1, 2, 5}，对此差集

# 集合包含关系
{1, 2} >= {1, 2, 3}   # => False
{1, 2} <= {1, 2, 3}   # => True
{1, 2} < {1, 2, 3}    # => True
{1, 2, 3} < {1, 2, 3} # => False

2 in {1, 3} # => False

####################################################
## 3. 控制流和遍历
####################################################

# 打印输出，分隔符默认为空格，结尾符默认为换行
print("Hello", "World", sep=' ', end='!') # => Hello World!

# Python 使用缩进来控制代码块，相同缩进位置的代码为同一代码块
# 习惯使用 4 个空格表示缩进

# if 语句，elif 和 else 都是可选的
a = 4
if a > 8:
    print("a is bigger than 8")
elif a < 8:
    print("a is smaller than 8") # print
else:
    print("a is indeed 8")

# for 循环，遍历列表
# => 1,2,3,
for number in [1, 2, 3]:
    print(number, end=',')

# range(lower, upper, step) 返回包含数字可遍历对象，包含 lower，不含 upper，step 默认为 1
# => 4,5,6,7,
for i in range(4, 8):
    print(i, end=',')

# while 循环
# => 0,1,2,3,
i = 0
while i < 4:
    print(i, end=',')
    i += 1

# 异常处理
"""
catch
clean up 
"""
try:
    raise IndexError("index error")
except IndexError as e:
    print("catch")    # 捕获到异常
except (TypeError, NameError):
    pass              # pass 是空操作，不做任何处理，用作占位符，因为空代码块是不允许的
else:
    print("all good") # 没有异常抛出时运行
finally:
    print("clean up") # 任何情况都会运行

# with 结束时会释放资源，可以代替 try/finally，适用于对资源进行访问的场合，以确保不管是否发生异常，都会释放资源
with open("myfile.txt") as f:
    for line in f:
        print(line)

# 可遍历对象，可以被当成是列表一样来遍历
d = {"a": 1, "b": 2}
our_iterable = d.keys()
print(our_iterable) # => dict_keys(['a', 'b'])，该对象实现了可遍历接口

for i in our_iterable:
    print(i)

# 不能使用下标索引
our_iterable[0] # TypeError

# 转化为遍历器
our_iterator = iter(our_iterable)
next(our_iterator) # => a
next(our_iterator) # => b
next(our_iterator) # => 抛出异常 StopIteration

####################################################
## 4. 函数
####################################################

# 函数定义使用 `def`，必须先定义后使用，传参如果不指定参数名，则按序传参
def add(x, y):
    print("x={},y={}".format(x, y))
    return x + y

add(5, 6)     # => x=5, y=6
add(y=2, x=3) # => x=3, y=2

# 参数默认值
def increase(x, step=1):
    return x + step
increase(3)     # => 4
increase(3, 2)  # => 5

# 参数默认值就是定义函数时的值
i = 5
def f(arg=i):
    return arg
i = 6
f() # => 5

# 参数默认值值计算一次，尤其要注意默认值为可变数据时的情况
def f1(a, L=[]):
    L.append(a)
    return L
f1(1) # => [1]
f1(2) # => [1, 2]

# 捕获元组参数
def varargs(*args):
    return args

varargs(1, 2, 3) # => (1, 2, 3)

# 捕获关键字参数
def keyword_args(**args):
    return args

keyword_args(a=1, b=2) # => {"a": 1, "b": 2}

# 也可以一起使用
def all_args(*args, **kwargs):
    print(args)
    print(kargs)

# 相反地，调用函数时也可以使用 `*` 和 `**` 来解包
args = (1, 2, 3)
kargs = {"a": 1, "b": 2}
all_args(*args, **kwargs) # 等效于 all_args(1, 2, 3, a=2, b=2)

# 支持返回多个值，实际上是返回一个元组
def swap(x, y):
    return y, x # 省略了括号，也可以加上

x = 2
y = 3
x, y =swap(x, y) # => x = 3, y = 2

# 函数作用域

x = 5
def set_x(num):
    # 局部变量 x 
    x = num  # => 43
    print(x) # => 43

def set_global_x(num):
    global x
    print(x) # => 5
    x = num  # 全局变量 x 被设置为 6
    print(x)

set_x(43)
set_global_x(6)

# 函数可以返回任何值，包括函数
def creat_adder(x):
    def adder(y):
        return x + y
    return adder

add_10 = creat_adder(10)
add_10(3) # => 13

# 匿名函数可以使用 lambda 定义
# 语法： `lambda 参数 : 返回值
(lambda x: x > 2)(3)             # => True
(lambda x, y: x**2 + y**2)(2, 1) # => 5

# 列表推导式，把所有返回值构建成一个新列表
[add_10(i) for i in [1, 2, 3]] # => [11, 12, 13]

# 同样可以用于集合和字典
{x: x**2 for x in [1, 2]}             # => {1: 1, 2: 4}
{x for x in "abbcc" if x not in "cd"} # => {'a', 'b'}

####################################################
## 5. 模块
####################################################

# 引入模块
import math

# 引入模块的部分函数
from math import ceil, floor

# 引入模块的所有函数，不推荐
from math import *

# 模块别名
import math as m
math.sqrt(16) == m.sqrt(16) # => True

# Python 模块就是普通的 Python 文件，模块名就是文件名
# Python 文件中的全局变量和函数就是该模块导出的变量和函数
# 如果本地模块名与内置模块名重合，那么会加载本地模块

# 查看模块内容
dir(math)


####################################################
## 6. 类
####################################################

# 使用 `class` 定义类，类名首字母大写
class Human:

    # 类属性，所有实例共享
    species = "H. sapiens"

    # 初始化函数，当类实例化时自动调用此函数
    # 使用双下划线开始和结束的函数称为特殊函数，由 Python 自动处理
    # 开发者不应创建自己的特殊函数
    def __init__(self, name):
        self.name = name
        self._age = 0   # 私有属性以下划线开头

    # 实例方法的第一个参数都是 self
    def say(self, msg):
        print("{name}: {message}".format(name=self.name, message=msg))
    
    # 类方法，被所有实例共享，使用类作为第一个参数
    @classmethod
    def get_species(cls):
        return cls.species

    # 静态方法，无需实例化即可调用
    @staticmethod
    def grunt():
        return "*grunt*"

    # getter 方法
    # 将同名属性变成只读
    @property
    def age(self):
        return self._age

    # setter 方法
    @age.setter
    def age(self, age):
        self._age = age

    # 删除函数，允许删除该属性
    @age.deleter
    def age(self):
        del self._age

if __name__ == '__main__':
    i = Human(name="Ian")
    i.say("hi")         # => "Ian: hi"
    j = Human("Joel")
    j.say("halo")       # => "Joel: halo"

    i.say(i.get_species()) # "Ian: H. sapiens"

    # 修改类属性会同时影响所有类实例
    Human.species = "H. neanderthalensis"
    j.say(j.get_species()) # => "Joel: H. neanderthalensis"

    # 静态方法调用，不会传入 self
    print(Human.grunt())   # => "*grunt*"

    # 仍然可以调用...，但如果不加 staticmethod 装饰器的话，会抛异常： TypeError: grunt() takes 0 positional arguments but 1 was given
    print(i.grunt())       # => "*grunt*"

    # 删除实例属性
    del i.age
    # i.age                # => AttributeError

# 继承
class Superhero(Human):

    # 如果子类想要不做任何修改的完全继承父类，只需要在类代码块使用 `pass`

    # 覆盖父类属性
    species = 'Superhuman'

    def __init__(self, name, movie=False,
                  superpowers=["super strength", "bulletproofing"]):
        
        # 新增额外的实例属性
        self.fictional = True
        self.movie = movie
        self.superpowers = superpowers

        # `super()` 返回父类，通过该父类我们可以访问被子类重载的方法
        super().__init__(name)

    # 重载父类方法
    def sing(self):
        return "Dun, dun, DUN!"

if __name__ == '__main__':

    sup = Superhero(name="Tick")

    # 检查实例类别
    if isinstance(sup, Human):
        print('I am human')
    if type(sup) is Superhero:
        print('I am a superhero')

# 多父类继承
class Bat:
    species = 'Baty'

    def __init__(self, can_fly=True):
        self.fly = can_fly

class Batman(Superhero, Bat):
    def __init__(self, *args, **kwargs):
        Superhero.__init__(self, 'anonymous', movie=True,
                            superpowers=["Wealthy"], *args, **kwargs)
        Bat.__init__(self, *args, can_fly=False, **kwargs)
    
    def sing(self):
        return 'nan nan batman!'

if __name__ == '__main__':

    # 方法检索顺序： 按书写顺序遍历
    print(Batman.__mro__) # => (<class '__main__.Batman'>, 
                          # => <class 'superhero.Superhero'>, 
                          # => <class 'human.Human'>, 
                          # => <class 'bat.Bat'>, <class 'object'>)

####################################################
## 7. 进阶
####################################################

# 生成器： 使用了 `yield` 的函数，返回一个迭代器
# 生成器只加载下一个要处理的数据，适用于处理超大量的数据
def double_numbers(iterable):
    for i in iterable:
        yield i + i

# `range` 也是一个生成器，返回一个可迭代对象
for i in double_numbers(range(1, 9000000)):
    print(i)
    if i >= 30:
        break

# 装饰器： 重新包装函数的能力
from functools import wraps

def beg(target_function):
    @wraps(target_function)
    def wrapper(*args, **kwargs):
        msg, say_please = target_function(*args, **kwargs)
        if say_please:
            return "{} {}".format(msg, "拜托了!")
        return msg
    return wrapper

@beg
def say(say_please=False):
    msg = "你能请我喝一杯啤酒么?"
    return msg, say_please

print(say())
print(say(say_please=True))
```