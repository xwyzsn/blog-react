---
link: https://blog.csdn.net/xwyzsn/article/details/114604939
title: Ubuntu 20.04 下安装 MySQL5.7
description: Ubuntu 20.04 下安装 MySQL5.7如果直接用apt安装的话自动给你装最新版的MySQL8.0 但是MySQL8.0用起来没有5.7版本的方便而且会在某些项目上报错。一下介绍了如何在Ubuntu上安装MySQL5.7 ，本文以之前从未安装MySQL的Ubuntu为例添加包的下载仓库sudo apt updatesudo apt install wget -ywget https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.de
date: 2021-03-09T14:26:00.000Z
catalog:blog
---
# Ubuntu 20.04 下安装 MySQL5.7

如果直接用apt安装的话自动给你装最新版的MySQL8.0 但是MySQL8.0用起来没有5.7版本的方便而且会在某些项目上报错。

一下介绍了如何在Ubuntu上安装MySQL5.7 ，本文以之前从未安装MySQL的Ubuntu为例

# 添加包的下载仓库

```shell
sudo apt update
sudo apt install wget -y
wget https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.deb
```

执行完上述命令后进行dpkg的安装

```shell
sudo dpkg -i mysql-apt-config_0.8.12-1_all.deb
```

出现如下界面，选择 **Ubuntu Bionic**

![](https://img-blog.csdnimg.cn/img_convert/d49510b24c57cdcd6743d0bef36b0c5f.png)

回车后出现以下的选项 **选择第一项Mysql8.0** 回车，可以在里面进行更换

![](https://img-blog.csdnimg.cn/img_convert/756f691e4f7cbfa5180c197acaa13da3.png)

![](https://img-blog.csdnimg.cn/img_convert/1cf06d57968e2a0b64894a15080e80d9.png)

选择 **mysql5.7** 回车点击OK

## 更新仓库

```shell
sudo apt-get update
sudo apt-cache policy mysql-server
```

![](https://img-blog.csdnimg.cn/img_convert/862df0a875f597d57f1d6623d6afe6e4.png)

已经有了MySQL5.7

```shell
sudo apt install -f mysql-client=5.7.31-1ubuntu18.04 mysql-community-server=5.7.31-1ubuntu18.04 mysql-server=5.7.31-1ubuntu18.04
```

之后一直输入Y进行安装，并为root创建密码

![](https://img-blog.csdnimg.cn/img_convert/5d5f7ebdbb415c12c9b7c270fa9a7398.png)

安装结束后输入以下命令

```shell
sudo mysql_secure_installation
```

可以一直输入Y即可安装成功，

最后查看MYSQL 版本

```shell
mysql ——version
```

## 修改远程权限

```shell
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

将bind-address 修改为0.0.0.0

```shell

bind-address   = 0.0.0.0
```

重启MySQL

```shell
sudo systemctl restart mysql
```

本文是转载于 [https://computingforgeeks.com/how-to-install-mysql-on-ubuntu-focal/](https://computingforgeeks.com/how-to-install-mysql-on-ubuntu-focal/) 如果看不明白的同学可以点进去自己查看
