---
title: JetBrains IDE 使用 SSH 方式 Git Clone 时提示输入 Git 用户密码的问题
tags:
  - jetbrains
  - git
  - ssh
  - windows
author:
  name: Zihlu Wang
  email: real@zihluwang.me
---

在 Windows 环境下使用 JetBrains 系列 IDE（例如 IntelliJ IDEA、PyCharm、WebStorm、GoLand 等）开发项目时，如果 Windows 本地用户名使用了中文，在通过 SSH 方式执行 `git clone` 时，有时会遇到一个比较奇怪的问题：

> 明明配置的是 Git SSH 地址，却一直提示输入 Git 用户的密码。

例如仓库地址：

```text
git@git.example.com:project/demo.git
```

正常情况下，Git 应该通过 SSH Key 进行身份认证，而不应该要求输入 Git 用户本身的登录密码。

这种问题在命令行 Git 中可能不明显，但在 JetBrains IDE 中执行 Clone、Pull、Push 等操作时可能出现。

## 问题表现

假设 Windows 用户名为：

```text
张三
```

对应的用户目录可能是：

```text
C:\Users\张三
```

在 JetBrains IDE 中选择：

```text
Git → Clone → Repository URL
```

然后填写：

```text
git@git.example.com:project/demo.git
```

点击 Clone 后，可能出现类似提示：

```text
git@git.example.com's password:
```

或者 IDE 弹出密码输入框，要求输入 Git 用户的密码。

但是即使输入正确的密码，也可能无法完成 Clone。

## 为什么 SSH 地址还会要求输入密码？

要理解这个问题，先要理解 SSH 的认证回退机制。

SSH 登录时，认证方式是按顺序尝试的：

1. **公钥认证（Public Key）**——客户端拿出本地私钥，服务器检查对应公钥是否在 `~/.ssh/authorized_keys`（Git 服务端则是用户上传的 SSH Key）中;
2. **密码 / 键盘交互认证（Password / Keyboard-Interactive）**——如果公钥认证没有通过，服务器会继续询问密码。

因此，当 IDE 里出现 `git@git.example.com's password:` 时，**问题并不是「没有走 SSH」，而是「公钥认证失败了」**：SSH 客户端没能拿出正确的那把私钥，服务器于是退回到密码认证，向你索要 Git 服务器上 `git` 用户的密码——注意，是 `git` 这个账户的密码，而不是你自己的账号密码。而主流 Git 服务端（GitLab、Gitea 等）默认都禁用了 `git` 用户的密码登录，所以即便输入了正确的密码，Clone 依然会失败。

问题的根子在于：**客户端没有找到私钥。**

在中文用户名的 Windows 上，这通常是路径编码导致的。Windows 下私钥默认位于：

```text
C:\Users\张三\.ssh\id_rsa
```

SSH 客户端（无论是 Git for Windows 附带的 OpenSSH，还是 JetBrains IDE 内置的 SSH 实现）需要借助 `%USERPROFILE%` 或 `HOME` 环境变量定位这个目录。当用户名中含有中文等非 ASCII 字符时，这条路径在进程之间传递时容易出现编码不一致（UTF-8 / GBK / ANSI 之间来回转换），最终客户端解析出的 `~/.ssh` 路径与实际路径对不上——`config` 文件和私钥都读不到，也就只能退回密码认证了。

一个很典型的判断方法：**在系统终端里执行 `ssh -T git@git.example.com` 能正常返回欢迎信息，但在 IDE 里 Clone 却要密码。** 这说明私钥本身没问题，问题只出在 IDE 这一侧的路径解析上。

## 如何确认

1. 确认仓库地址用的确实是 SSH 协议（`git@host:path` 或 `ssh://git@host/path`），而不是 HTTP 地址。
2. 在终端执行 `ssh -T git@git.example.com`：
   - 终端一切正常 → 私钥与服务器配置都没问题，问题在 IDE 侧；
   - 终端也报错 → 先按常规流程排查私钥文件、`~/.ssh/config`、以及公钥是否已上传到服务端。
3. 在 IDE 中查看 Git 使用的 SSH 实现：`Settings → Version Control → Git → SSH executable`。
4. 检查 `C:\Users\张三\.ssh` 目录是否真实存在、`config` 内容是否被正确读取。

## 临时绕过方案

在动手改用户名之前，可以先尝试下面几种绕开非 ASCII 路径的做法。

### 方案一：改用 Git 自带的 ssh.exe

JetBrains IDE 默认可能使用内置的 SSH 实现。把 `Settings → Version Control → Git → SSH executable` 改为 `Native`（即使用 Git for Windows 附带的 `ssh.exe`），然后重试 Clone。切换实现后路径解析的行为不同，往往能直接绕开这个问题。

### 方案二：把密钥放到纯 ASCII 路径下并显式指定

将密钥目录从 `C:\Users\张三\.ssh` 复制到 `C:\ssh`，再让 Git 显式使用这个目录下的私钥与 known_hosts：

```shell
git config --global core.sshCommand "ssh -i C:/ssh/id_rsa -o UserKnownHostsFile=C:/ssh/known_hosts"
```

配置后，命令行 Git 以及所有调用系统 Git 的 IDE 都会走这条命令，不再依赖 `~/.ssh` 的自动推导。

### 方案三：为 IDE 单独设置 HOME 环境变量

创建一个纯 ASCII 的家目录（例如 `C:\ssh-home`），把密钥放到 `C:\ssh-home\.ssh\` 下，然后在 IDE 使用的环境变量中设置：

```text
HOME=C:\ssh-home
```

这样 SSH 就会去 `C:\ssh-home\.ssh\` 里查找配置与私钥，完全避开中文路径。

> 三种方案都能缓解问题，但本质上都是「打补丁」。只要用户名还是中文，其它的软件——Node、Python、Docker、各类 CLI 工具——仍可能因为同样的原因踩坑。**根本的解决办法是把 Windows 用户名改成英文**，具体步骤见 [将 Windows 用户名修改为英文](./rename-windows-user-profile-to-english.mdx)。
