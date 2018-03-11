---
title: 向量和矩阵
createdDate: 2018-03-04
tags: quantum,qdk,vector,matrix
desc: 向量和矩阵
---

要想理解量子计算，有必要去掌握一些向量和矩阵的概念和应用。
本文仅提供一个简短的介绍，有兴趣的读者可以参考[线性代数课程](http://joshua.smcvt.edu/linearalgebra/)。

一个具有 $n$ 维的列向量 $v$ 由 $n$ 个复数 $(v_1, v_2, \cdots, v_n)$ 按序排列而成，数学表示为：

$$
v = \begin{bmatrix}
v_1 \\
v_2 \\
\vdots \\
v_n
\end{bmatrix}
$$

向量 $v$ 的**模**定义为 $\sqrt{\sum_i|v_i|^2}$ 。如果向量的模为 $1$ ，我们就说这个向量是**单位向量**。向量 $v$ 的伴随向量记为 $v^\dag$ ，定义为以下行向量，其中 $*$ 表示**复共轭**（Complex Conjugate）：

$$
\begin{bmatrix}
v_1 \\
v_2 \\
\vdots \\
v_n
\end{bmatrix}^\dag = [v^*_1 \ldots v^*_n]
$$

最常用的向量乘法是**内积**（Inner Product），也叫做**点积**（Dot Product）。内积定义了一个向量到另一个向量的映射，并且在描述如何把一个向量表述为其它更简单向量的和时，尤其有用。向量 $u$ 和 $v$ 的内积记为 $\langle u,v \rangle$ ，定义为：

$$
\langle u,v \rangle = u^\dag_1v_1 + \ldots + u^\dag_n v_n
$$

使用这种记法，向量 $v$ 的模可以写为 $\sqrt{\langle u,v \rangle}$

我们可以把向量乘以一个数 $c$ 从而得到一个新向量，该新向量的每个元素都是原向量元素乘以 $c$ 得到的值。也可以把两个向量 $u$ 和 $v$ 相加：

$$
If \space u = \begin{bmatrix}
u_1 \\
u_2 \\
\vdots \\
u_n
\end{bmatrix}
and \space v = \begin{bmatrix}
v_1 \\
v_2 \\
\vdots \\
v_n
\end{bmatrix},
then \space au + bv = \begin{bmatrix}
au_1 + bv_1 \\
au_2 + bv_2 \\
\vdots \\
au_n + bv_n
\end{bmatrix}.
$$

一个 $m \times n$ 的矩阵是由 $mn$ 个复数按 $m$ 行 $n$ 列排列的，记为：

$$
M = \begin{bmatrix}
M_{11} & M_{12} & \ldots & M_{1n} \\
M_{21} & M_{22} & \ldots & M_{2n} \\
\ddots \\
M_{m1} & M_{m2} & \ldots & M_{mn} 
\end{bmatrix}
$$

以此类推，一个 $n$ 维的向量就是一个 $n \times 1$ 的矩阵。同向量一样，我们可以用一个常数 $c$ 乘以矩阵，也可以把两个具有相同维数的矩阵相乘。

## 矩阵乘法和张量积

逆矩阵（）

克罗内克积是张量积的特殊形式。