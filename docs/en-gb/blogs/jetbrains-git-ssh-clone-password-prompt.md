---
title: JetBrains IDE Prompting for the Git User's Password When Cloning over SSH
tags:
  - jetbrains
  - git
  - ssh
  - windows
author:
  name: Zihlu Wang
  email: real@zihluwang.me
---

When you develop on Windows with a JetBrains IDE — IntelliJ IDEA, PyCharm, WebStorm, GoLand and friends — and your local Windows username contains non-ASCII characters such as Chinese, cloning a repository over SSH can behave rather oddly:

> The remote is configured as an SSH URL, yet you are repeatedly prompted for the Git user's password.

Take a repository address such as:

```text
git@git.example.com:project/demo.git
```

Normally Git authenticates over SSH with a key pair and should never ask for the Git user's own login password.

The problem may be invisible in command-line Git, but it can surface in a JetBrains IDE when you clone, pull or push.

## Symptoms

Suppose the Windows username is:

```text
张三
```

Its home directory will be:

```text
C:\Users\张三
```

In the IDE, choose:

```text
Git → Clone → Repository URL
```

and enter:

```text
git@git.example.com:project/demo.git
```

After you click Clone, you may see something like:

```text
git@git.example.com's password:
```

or the IDE may pop up a password dialog asking for the Git user's password. Even entering the correct password may fail to complete the clone.

## Why does an SSH URL ask for a password?

To make sense of this, you first need to understand how SSH falls back between authentication methods.

SSH tries authentication methods in order:

1. **Public key authentication** — the client presents a local private key, and the server checks whether the matching public key appears in `~/.ssh/authorized_keys` (on a Git server, among the SSH keys you have uploaded);
2. **Password / keyboard-interactive authentication** — if public key authentication does not succeed, the server carries on and asks for a password.

So when `git@git.example.com's password:` appears in the IDE, **the problem is not that SSH was bypassed — it is that public key authentication failed**: the SSH client could not produce the right private key, so the server fell back to password authentication and is now asking for the password of the `git` account on the server — the `git` account, note, not your own. And because mainstream Git servers (GitLab, Gitea and the like) disable password login for `git` by default, supplying the correct password still gets you nowhere.

The root of the problem is that **the client cannot find the private key**.

On Windows with a Chinese username, this is usually down to path encoding. By default the private key lives at:

```text
C:\Users\张三\.ssh\id_rsa
```

The SSH client — whether it is the OpenSSH bundled with Git for Windows or the SSH implementation built into the JetBrains IDE — locates this directory through the `%USERPROFILE%` or `HOME` environment variable. When the username contains non-ASCII characters, that path is liable to be mangled as it crosses process boundaries (shuttled back and forth between UTF-8, GBK and ANSI), so the `~/.ssh` path the client resolves no longer matches the real one — neither `config` nor the private key can be read, and password authentication is all that is left.

A handy way to tell: **run `ssh -T git@git.example.com` in a terminal and it greets you normally, yet the IDE still demands a password when cloning.** That tells you the key itself is fine, and the fault lies purely in the IDE's path resolution.

## How to confirm

1. Check that the remote really is an SSH URL (`git@host:path` or `ssh://git@host/path`) and not an HTTP one.
2. Run `ssh -T git@git.example.com` in a terminal:
   - Everything works → the key and the server configuration are fine, and the problem lies with the IDE;
   - It fails too → work through the usual suspects first: the private key file, `~/.ssh/config`, and whether the public key has been uploaded to the server.
3. In the IDE, check which SSH implementation Git is using: `Settings → Version Control → Git → SSH executable`.
4. Check that `C:\Users\张三\.ssh` really exists, and that whatever is in `config` is being read.

## Temporary workarounds

Before you rearrange your username, try one of the following to sidestep the non-ASCII path.

### Option 1: use the ssh.exe bundled with Git

A JetBrains IDE may default to its own built-in SSH implementation. Change `Settings → Version Control → Git → SSH executable` to `Native`, which makes it use the `ssh.exe` shipped with Git for Windows, then retry the clone. The two implementations resolve paths differently, and switching is often enough to sidestep the issue entirely.

### Option 2: move the keys to a pure-ASCII path and point at them explicitly

Copy the key directory from `C:\Users\张三\.ssh` to `C:\ssh`, then tell Git explicitly which private key and known_hosts file to use:

```shell
git config --global core.sshCommand "ssh -i C:/ssh/id_rsa -o UserKnownHostsFile=C:/ssh/known_hosts"
```

Once configured, command-line Git — and any IDE that shells out to the system Git — will use this command, and nothing depends on guessing `~/.ssh` any more.

### Option 3: give the IDE its own HOME

Create a pure-ASCII home directory (say `C:\ssh-home`), place your keys in `C:\ssh-home\.ssh\`, and set the following in the environment the IDE runs with:

```text
HOME=C:\ssh-home
```

SSH will then look for its configuration and private keys under `C:\ssh-home\.ssh\`, avoiding the Chinese path altogether.

> All three options relieve the symptom, but they are patches, not cures. As long as the username remains Chinese, other tools — Node, Python, Docker and any number of CLI utilities — can still trip over exactly the same problem. **The proper fix is to change the Windows username to English**, and the steps are in [Renaming a Windows User Account and Profile Folder to English](./rename-windows-user-profile-to-english.mdx).
