---
layout: post
title: 浏览器客户端识别技术概况
tags: browser,identification
desc: 译文：客户端识别机制技术分析，来自 Chromium Security
--- 

[原文: Technical analysis of client identification mechanisms](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/client-identification-mechanisms)

通常来说，**网络跟踪**（Web Tracking）是指的是一个过程，该过程会把通过**计算或分配**得来的 ID 存储到每一个访问网站的浏览器。
这样做的主要目的是想把用户（或设备）的访问行为和信息通过这个 ID 关联起来，并以此来分析用户，比如个人喜好，因此要求这个 ID 必须具有**唯一性和稳定性**。

目前，一些网络跟踪技术已经相当成熟并且很普遍。常见应用如：

* 用于区分真实用户和恶意机器人
* 增加攻击者侵入用户账户的难度
* 存储用户在网站的个人偏好设置

其中，应用最广的当属在线广告行业，自 90 年代中期开始，它就把 Cookie 作为主要的客户端识别技术。
除此之外，其他的识别技术则鲜为人知，因为它们可能并不直接跟浏览器控件相关，也可能是因为隐藏得太深而至今尚未被发现。
与此同时，也还有一些识别技术已经引起了软件供应商、标准组织和媒体的担忧，尤其是各种客户端指纹（Fingerprint）技术。

为了有效控制浏览器控件的功能范围，同时突出潜在的新 API 设计隐患，我们决定对浏览器端现有的跟踪和指纹技术做一个技术调研。
要强调的是，虽然我们在这里讨论这些技术，但是我们并**不号召**大家去使用它们。
所有网站的拥有者都应该清楚，任何跟踪技术都可能引起用户的不爽，因为它违背了用户意愿或者其他本文未覆盖到的复杂因素。

下文中，我们把跟踪技术分为以下三类：

* 分配类，如 HTTP Cookie ，会明确地给客户端分配一个 ID 
* 设备类，利用客户端设备的固有特征来识别特定机器
* 行为类，利用键盘（或触摸屏）背后用户的行为和偏好来识别

在分析完这些跟踪和指纹技术之后，我们还会讨论未来可能的工作方向，并且总结浏览器和其他软件厂商在检测或阻止这类网络行为时可能面临的挑战。

## 分配类

HTTP 请求本身是无状态的，要想把多个 HTTP 请求关联起来，最典型的做法是在客户端存储一个唯一的、持久的令牌，然后在后续的请求中获取该令牌。现代浏览器提供了多种方式来实现这个想法，包括但不限于：

* 广为人知的 [HTTP Cookie](http://tools.ietf.org/html/rfc6265)
* 类 Cookie 的插件功能，例如 Flash 的[本地共享对象](http://en.wikipedia.org/wiki/Local_shared_object)（Local Shared Objects）和 Silverlight 的[独立存储](http://msdn.microsoft.com/en-us/magazine/dd458794.aspx)（Isolated Storage）
* HTML5 客户端存储机制，包括 [localStorage](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage)、[File](https://developer.mozilla.org/en-US/docs/Web/API/File) 和 [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
* 本地缓存资源或其元数据中包含的独特标记，如 Last-Modified 和 ETag
* 从浏览器 SSL [域名证书](https://www.usenix.org/system/files/conference/usenixsecurity12/sec12-final162.pdf)中衍生出来的指纹
* [HSTS](http://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) 主机名列表中的位编码
* [SDCH](http://en.wikipedia.org/wiki/Shared_Dictionary_Compression_Over_HTTP) 压缩字典和字典元数据中的数据编码

我们相信，以上任意一种方法都足够可靠地标记并识别用户。除此之外，许多类似的标记都在以某种方式运行着，虽然它们看起来可能并不具备唯一性。另一方面，除了稍后要讨论到的几个例外，浏览器也赋予了用户控制这些 API 行为的能力，以防这类标记方式不会扩散到其他浏览器配置文件或私有浏览会话。

本章节接下来的部分，我们会在 Web 应用范围内更加深入地介绍这些客户端标记方法。

### HTTP Cookie

HTTP Cookie 是最典型的浏览器客户端数据存储方式。
实际上，当用户第一次访问网站时，大部分 Web 服务器都会以 HTTP 响应的方式为用户分配一个唯一标识。用户在未来继续访问时，浏览器便会把这个唯一标识通过 HTTP 请求传回给该网站。

多年来，所有主流的浏览器都提供了管理 Cookie 的界面。同时，也涌现出一大批第三方 Cookie 管理工具和阻拦软件。但实际上，有研究曾暗示，只有少数的用户会定期检查或清除 Cookie 。其原因可能是复杂多样的，但其中最主要的原因可能是删除 Cookie 往往会导致破坏性的结果。因为现代浏览器并没有提供任何方式来区分用作用户登录的会话 Cookie 和用作其它用途的 Cookie 。要删的话，所有 Cookie 都会一视同仁地被清除。

一些浏览器也为用户提供了可配置功能，用来限制网站设置第三方 Cookie 。所谓第三方是指当前网站域名以外的其它域名。这种设置第三方 Cookie 的做法，其目的一般用于在线广告或其它需要嵌入式的内容。
要注意的是，这种设置的实现方式会把以下页面或内容设置的所有 Cookie 标记为“第一方”：

* 用户有意跳转页面
* 整页的插入式广告页面中浏览器加载的部分内容
* HTTP 重定向加载的页面
* 点击触发的弹窗页面

与下面要讨论的其它技术相比，公开使用的 HTTP Cookie 对用户来说是相当透明的。
虽然有些网站不直接使用看起来具有唯一性的 Cookie 来标记用户，但是却通过变相地方式用来标记用户。
比如，设置多个看起来无关的而且合理的 Cookie 名称，但是把它们组合起来却能得到唯一的标记；又比如，把具有唯一性的标记存储在 Cookie 的路径、域名或者过期时间等元数据中。
正因为这些方式的隐蔽性，我们才没有意识到浏览器还是可以通过 Cookie 来可靠地标记特定用户。

一个有趣的现象是，如果每个网站都设置 Cookie ，那么同一个客户端就可能存有大量的 Cookie 。这意味着一个网站可以依赖别人设置的 Cookie ，而不需要自己重新设置一个可以直接被追踪到的新 Cookie 。
我们在一些丰富内容的广告中发现过这种现象：这些广告位于一个相同的域名下，但这个域名却被所有的广告商共享，或者更夸张的说，直接在广告所嵌入的页面中运行用于标记用户的相关代码。

## 设备类

## 行为类


## 参考文章

* [浅谈Web客户端追踪](http://www.freebuf.com/articles/web/127266.html)
