---
layout: post
title: 浏览器客户端识别机制
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

其中，应用最广的当属在线广告行业，它自从 90 年代中期就开始以 Cookie 作为主要的客户端识别技术。
除此之外，其他的识别技术则鲜为人知，因为它们可能跟浏览器控件无关，也可能是尚未被发现。
与此同时，也有一些识别技术已经引起了软件供应商、标准组织和媒体的担忧，尤其是各种客户端指纹（Fingerprint）技术。

