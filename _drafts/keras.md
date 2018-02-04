---
layout: post
title: Keras 入门指南
tags: keras,tensorflow
desc: Keras 入门指南
---

## Keras

[keras](https://keras.io/) 是一个流行的 Python 深度学习库，它以 [TensorFlow](https://github.com/tensorflow/tensorflow) ，[CNTK](https://github.com/Microsoft/cntk)，和 [Theano](https://github.com/Theano/Theano) 作为**底层库**（或者称为**后端**），提供一系列更高级的神经网络 API 。

简单来说，Keras 是对 TensorFlow，CNTK 和 Theano 更进一步的封装，以便让开发者能够更简单快速建模并验证。

值得关注的是，还有一个在浏览器运行 Keras 模型的 JS 库：[Keras.js](https://github.com/transcranial/keras-js) 。

## 安装 Keras

系统信息：windows 10 x64 ，Python 3.6.4 ，Pipenv 9.0.0。

本文使用 TensorFlow 作为 Keras 的底层库（后端），因此首先需要安装 TensorFlow 。
对于 TensorFlow ，如果仅仅需要支持 CPU ，则仅需两个命令即可完成 Keras 安装：

```bash
pipenv install tensorflow
pipenv install keras
```

> 如果是自学或者代码调试，安装仅支持 CPU 的版本是满足要求的。

如果要支持 GPU ，则需要先安装 CUDA Toolkit 和 cuDNN 。

截至到 2018.02.03， TensorFlow 最新版本为 1.5.0 ，已经开始支持 CUDA 9 和 cuDNN 7 ，安装步骤如下：

1. 安装 Visiual Studio ：进入 [下载地址](https://www.visualstudio.com/)，选择 Visiual Studio IDE Community 2017，安装过程中可以不选任何其他组件
2. 安装 CUDA Toolkit ：进入 [下载地址](https://developer.nvidia.com/cuda-toolkit-archive)，选择 CUDA Tookit 9.0 ，安装完成后会自动设置相应的环境变量，验证安装是否成功：`nvcc -V`
3. 安装 cuDNN ：进入 [下载地址](https://developer.nvidia.com/cudnn)，选择 cuDNN v7.0.5 for CUDA 9.0 ，下载完成后，按照[指引](http://docs.nvidia.com/deeplearning/sdk/cudnn-install/index.html#installwindows)把对应文件拷贝到目标地址即可
4. 安装 TensorFlow ：`pipenv install tensorflow-gpu` 

注意：一定要选对版本，v9.0 就 v9.0 不要选择 v9.1 ，否则可能无法使用 TensorFlow 的预编译二进制包。

第 4 步中可能会发生 `"Unknown requires Python '>=2.6, <3' but the running Python is 3.6.4"` 的[问题](https://github.com/tensorflow/tensorflow/issues/16478)，解决办法是手动安装 `futures` : `pipenv install futures==3.1.1` ，然后再 `pipenv install tensorflow-gpu` 。

如何验证 TensorFlow 是否安装成功？

```bash
$ pipenv shell
$ python
Python 3.6.4 
>>> import tensorflow as tf
>>> hello = tf.constant('Hello, TensorFlow!')
>>> sess = tf.Session()
>>> print(sess.run(hello))
Hello, TensorFlow!
>>> 
```

注意，虽然安装的是 `tensorflow-gpu`，但是我们在导入时使用的仍然是 `tensorflow` ，而不是 `tensorflow-gpu` 。

如果输出 `Hello, TensorFlow!` ，则表示已经安装成功。否则，请参考[常见的安装错误](https://www.tensorflow.org/install/install_windows?hl=zh-cn#common_installation_problems)。

如何验证 Keras 是否安装成功？

```bash
$ pipenv shell
$ python
Python 3.6.4 
>>> import keras
Using TensorFlow backend.
>>>
```

如果输出 `Using TensorFlow backend.`，则表示已经可以使用 Keras 了。

## 基本概念

理解以下基本概念可以帮助我们更好的学习 Keras 。

### 符号计算

> 科学计算包括**数值计算**和**符号计算**两种。大部分人都知道计算机能够对数值进行一些列运算，但是不知道计算机也能够对含未知量的式子进行推导/演算。一个常见的符号计算应用是对一个函数进行求导/积分。

Keras 的底层库 TensorFlow 和 Theano 都是一个基于计算图的**符号式**库。这也决定了 Keras 的编程与传统的 Python 代码有所差别。

简单来说，符号计算首先定义各种变量，然后建立一个**计算图**（Computational Graph），该计算图规定了各个变量之间的计算关系。
建立好的计算图需要通过**编译**来确定其内部细节，编译好后的计算图就好比一个公式，没有任何实际的数据；只有把需要运算的数据输入之后，计算图才能运行起来，形成数据流，进而产生输出。

Keras 的建模跟符号计算类似，当我们的 Keras 模型搭建完毕之后，这个模型仅仅是一个空壳子，只有实际编译生成可调用函数后，输入数据才能产生真正的数据流。

这种使用计算图的库最大的缺点就是**难以调试**，没有经验的开发者很难知道计算图到底在做什么。
当然也有一些工具可以帮助开发者理解计算图结构，如 [TensorBoard](https://github.com/tensorflow/tensorboard) 。
尽管难以调试，但是目前大多数的深度学习框架都是使用符号计算这套方法，因为符号计算能够提供关键的计算优化和自动求导等功能。

### 张量

**张量**（Tensor），TensorFlow 取名的前半部分，足见张量的重要性。

张量是向量和矩阵等数据的**统一表述**，用来表示广泛的**数据类型**。

张量是有**阶数**的，或者称为**维度**。0 阶张量对应**标量**，表示单个数；1 阶张量对应**向量**，表示序列；2 阶张量对应**矩阵**，表示向量序列；3 阶张量表示矩阵序列，可以称为**立方体**，具有三个颜色通道的彩色图片就是这样一个立方体。
图片中的每个像素点 `[R, G, B]` 组成 1 阶张量（即向量），每一行像素构成 2 阶张量（即矩阵），所有像素行组合起来就构成了 3 阶张量（即立方体）。
继续把立方体作为元素组成序列，就叫 4 阶张量，以此类推。

在 Python 代码中，通常使用**轴**（Axis）表示阶数。例如对于矩阵 `[[1,2], [3,4]]`，它表示 2 阶张量，对应两个轴，沿着第 0 轴我们可以得到 `[1,2]` 和 `[3,4]` 两个向量，沿着第 1 轴可以得到 `[1,3]` 和 `[2,4]` 两个向量。下面的代码可以帮助我们理解轴的含义：

```python
import numpy as np
a = np.array([[1,2], [3,4]])
sum0 = np.sum(a, axis=0)
sum1 = np.sum(a, axis=1)
print(sum0) # [4,6]
print(sum1) # [3,7]
```

### data_format

### 函数式模型

### batch

批次？

### epochs

数据执行多少次？

## 参考文章

* [Keras 中文文档](https://keras-cn.readthedocs.io/en/latest/)