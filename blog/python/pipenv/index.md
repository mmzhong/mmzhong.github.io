---
title: Pipenv
createdDate: 2018-02-03
tags: python,pipenv,tool,package
desc: Python 包管理工具 Pipenv 基本用法
--- 

## Pipenv 是什么

[Pipenv](https://docs.pipenv.org/) 是 Python 官方推荐的包管理工具，它借鉴了其他包管理工具如 bundler, composer, npm, yarn, cargo 等的精髓，力求改善 Python 项目的依赖管理，提高开发效率。

Pipenv 把 windows 作为首选平台，但同时也支持 Linux 和 macOS 。

在 Python 中，通常使用 `pip` 来安装依赖包，但是在实际开发中往往还要跟其他工具结合起来使用，徒增复杂度。Pipenv 则是一种更高级的工具，能够简化依赖管理的常见使用情况。

Pipenv 具备以下主要功能：

* 你不再需要单独使用 `pip` 和 `virtualenv` ，Pipenv 已经把这两者结合起来使用
* 不再被 `requirements.txt` 的问题所困扰，Pipenv 使用 `Pipfile` 和 `Pipfile.lock` 来管理依赖
* 每个依赖包都使用哈希值来校验，主动提醒开发者被篡改过的依赖包
* 主动推荐按使用最新的依赖包，以减小安全风险
* `pipenv graph` 命令查看依赖关系图
* 使用 `.env` 文件来简化开发工作流

## Pipenv 安装

安装 Pipenv 之前需要确保当前系统已经安装了 Python 和 Pip 。另外，官方强烈推荐使用 Python 3 来安装 Pipenv ，因为在兼容性方面做了更好的支持。

```bash
python --version
pip --version
```

注意，pip 默认源的速度很慢，为了加快依赖包安装速度，建议配置为国内源，方法是创建 `~/.pip/pip.conf` 文件，文件内容为：

 ```
 [global]
 trusted-host =  mirrors.aliyun.com
 index-url = https://mirrors.aliyun.com/pypi/simple
 ```

在确保 `python` 和 `pip` 命令都存在之后，最简单的安装方法就是通过 `pip` 来安装 Pipenv ：

```bash
pip install --user pipenv
```

上面的命令会为**当前用户**安装 Pipenv ，这是为了避免覆盖系统全局安装的 Pipenv。
如果想为让系统中所有用户都可以使用 Pipenv ，那么可以去掉 `--user` 选项。
安装完成之后，就可以使用 `pipenv` 命令了。
如果安装完后，找不到 `pipenv` 请检查当前用户的 bin 目录是否添加到了 PATH 。

### Python 虚拟环境

基本上每种动态语言都有自己的虚拟环境，如 Ruby ，Python 也有。虚拟环境的目的是为单个项目提供一个**独立的运行环境**，使得每个项目之间互不干扰。比如项目 A 依赖 Django 1.4 ，而项目 B 则依赖 Django 1.5 ，虚拟环境就可以用来解决这种冲突。在 Python 中，可以使用 `virtualenv` 来创建独立的 Python 环境，它会创建一个包含项目所必须的执行文件。

Pipenv 中，每个项目都会自动创建一个虚拟环境，不再需要开发者手动创建。

## 安装依赖

Pipenv 针对每个项目单独进行依赖管理。所以，安装依赖之前，需要把工作路径切换到项目路径，然后使用 `pipenv install` 命令安装依赖：

```bash
cd myproject
pipenv install requests
```

上面的命令中，Pipenv 会安装 [Requests](https://python-requests.org/) 库，并且会在项目路径下创建一个 `Pipfile` 文件。
该文件用来记录项目的所有依赖情况，以便以后可以通过它重新安装所有依赖。比如别人把项目从 GitHub 上克隆下来后，就可以直接使用这个文件来重新安装所有依赖。

## 使用已安装依赖

依赖已经安装后，我们就可以使用它了，例如创建 `main.py` ：

```python
import requests

response = requests.get('https://httpbin.org/ip')

print('Your IP is {0}'.format(response.json()['origin']))
```

然后使用 `pipenv run` 来运行此脚本：

```bash
pipenv run python main.py
```

`pipenv run` 的作用是把已安装的包暴露给当前脚本，使得脚本可以使用这些包。
当然还有一种方式是使用 `pipenv shell` 创建一个新 shell ，在这个 shell 中的所有命令都可以访问已安装的依赖包。

## 常用命令

直接在命令行中输入 `pipenv` 可以查看所有命令的使用方式。下面列举一些常用命令：

* `pipenv install [package]` ：安装指定依赖包，并写入 `Pipfile`
* `pipenv install [package]==3.1.1` ：安装指定版本的依赖包，版本号用法与 `pip` 一致
* `pipenv install [package] --dev` ：安装为开发依赖
* `pipenv install` ：安装 `Popfile` 中的所有依赖
* `pipenv install --dev` ：安装 `Popfile` 中的所有**开发**依赖
* `pipenv uninstall [package]` ：删除指定的依赖包，并从 `Pipfile` 中移除
* `pipenv uninstall --all` ：删除所有依赖包
* `pipenv update` ：删除所有依赖包，然后重新安装所有依赖包至最新的兼容版本
* `pipenv check` ：检查所有已安装依赖包的完整性
* `pipenv graph` ：显示当前已安装依赖包的关系图
* `pipenv run [command]` ：在虚拟环境中运行命令
* `pipenv shell` ：创建虚拟环境 shell 并进入
* `pipenv --py` ：查看当前项目所使用的 Python 解析器路径

## VS Code

如果使用的编辑器是 VS Code ，安装完 Python 插件后发现，并没有代码提示功能。
这是因为该插件默认使用系统中的 Python 解析器，而不是当前虚拟环境中使用的解析器。
因此，只要指定使用当前项目的解析器即可解决此问题。

以 windows 10 为例，其他系统类似，操作步骤如下：

1. 在项目根路径下运行 `pipenv --py` 查看项目使用的解析器路径，得到的路劲类似为 `C:\cygwin64\home\mm\.virtualenvs\hello-pipenv-M_dpt8Xy\Scripts\python.exe`
2. 按下 `Ctrl+Shift+P` ，并搜索 `Select Interpreter` ，按下 `Enter` 选择任一提示的解析器，此时项目根目录下会多出一个 `.vscode` 路径
3. 打开 `./vscode/settings.json` ，把 `python.pythonPath` 的值改为第 1 步中得到的路径
4. 保存，并重启 VS Code

修改后的 `./vscode/settings.json` 内容如下：

```json
{
  "python.pythonPath": "C:\\cygwin64\\home\\mm\\.virtualenvs\\hello-pipenv-M_dpt8Xy\\Scripts\\python.exe"
}
```