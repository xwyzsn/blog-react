---
link: https://blog.csdn.net/xwyzsn/article/details/112338624
title: hadoop +hbase+zookeeper 伪分布安装(超级无敌详细)
description: hadoop +hbase+zookeeper 伪分布安装(超级无敌详细)hadoop 配置安装jdksudo apt update//更新安装源,为了安装快一点推荐安装阿里源sudo apt install openjdk-8-jdk -y//安装jdk查看Java的版本[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-jlXBiDU7-1610024980080)(https://raw.githubusercontent.com/xwyzsn/Picture/
keywords: hadoop +hbase+zookeeper 伪分布安装(超级无敌详细)
author: Xwyzsn Csdn认证博客专家 Csdn认证企业博客 码龄2年 暂无认证
date: 2021-01-07T13:11:00.000Z
publisher: null
stats: paragraph=117 sentences=131, words=346
catalog:blog
---
# hadoop +hbase+zookeeper 伪分布安装(超级无敌详细)

## hadoop 配置

**图片打不开的可以点击下方链接直接去图床查看,辣鸡CSDN**

### 安装jdk

```shell
sudo apt update//更新安装源,为了安装快一点推荐安装阿里源
sudo apt install openjdk-8-jdk -y//安装jdk
```

查看Java的版本

![](https://img-blog.csdnimg.cn/20210129134911512.png#pic_center)

### 安装SSH

```shell
sudo apt install openssh-server openssh-client -y
```

### 创建Hadoop用户

创建Hadoop用户.用ssh生成私钥,传给Hadoop用户,使得可以做到免密登陆。

```shell
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa //生成私钥
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys //存储
chmod 0600 ~/.ssh/authorized_keys //更改权限给用户
ssh localhost //初始化
```

### 下载Hadoop

在下载的Hadoop用户下，执行如下shell命令，实现Hadoop的下载和解压。

```
wget https://downloads.apache.org/hadoop/common/hadoop-3.2.1/hadoop-3.2.1.tar.gz

tar xzf hadoop-3.2.1.tar.gz
```

### 配置Hadoop

#### 第一步：配置相关路径

```shell
sudo vim .bashrc
```

输入如下的路径信息；

```sh
export HADOOP_HOME=/home/hdoop/hadoop-3.2.1
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
export HADOOP_OPTS="-Djava.library.path=$HADOOP_HOME/lib/native"

```

![](https://img-blog.csdnimg.cn/20210129135000596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)

```shell
source ~/.bashrc //使得路径信息生效
```

#### 第二步：配置相关文件

打开hadoop-env.sh这个文件，把我们的Java路径加入到路径中。

```shell
sudo vim $HADOOP_HOME/etc/hadoop/hadoop-env.sh
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 //把这个路径加入到hadoop-env.sh文件中

```

![](https://img-blog.csdnimg.cn/20210129135040733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)

**如何查看自己的JAVA_home路径**

```shell
which javac //会输出一个路径

readlink -f /路径
```

![](https://img-blog.csdnimg.cn/20210129135109656.png#pic_center)

配置core-site.xml文件

```shell
sudo vim $HADOOP_HOME/etc/hadoop/core-site.xml
```

配置如下

```xml
<configuration>
<property>
  <name>hadoop.tmp.dirname>
  <value>/home/hdoop/tmpdatavalue>
property>
<property>
  <name>fs.default.namename>
  <value>hdfs://127.0.0.1:9000value>
property>

configuration>

```

配置hdfs-site.xml

```shell
sudo vim $HADOOP_HOME/etc/hadoop/hdfs-site.xml
```

配置如下

```xml
<configuration>
<property>
  <name>dfs.data.dirname>
  <value>/home/hdoop/dfsdata/namenodevalue>
property>
<property>
  <name>dfs.data.dirname>
  <value>/home/hdoop/dfsdata/datanodevalue>
property>
<property>
  <name>dfs.replicationname>
  <value>1value>
property>
configuration>

```

配置mapred-site.xml

```shell
sudo vim $HADOOP_HOME/etc/hadoop/mapred-site.xml
```

配置如下

```xml
<configuration>
<property>
  <name>mapreduce.framework.namename>
  <value>yarnvalue>
property>
configuration>
```

配置yarn-site.xml

```shell
sudo vim $HADOOP_HOME/etc/hadoop/yarn-site.xml
```

配置如下

```xml
<configuration>
<property>
  <name>yarn.nodemanager.aux-servicesname>
  <value>mapreduce_shufflevalue>
property>
<property>
  <name>yarn.nodemanager.aux-services.mapreduce.shuffle.classname>
  <value>org.apache.hadoop.mapred.ShuffleHandlervalue>
property>
<property>
  <name>yarn.resourcemanager.hostnamename>
  <value>127.0.0.1value>
property>
<property>
  <name>yarn.acl.enablename>
  <value>0value>
property>
<property>
  <name>yarn.nodemanager.env-whitelistname>
  <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PERPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOMEvalue>
property>
configuration>
```

#### 格式化一下HDFS

```shell
hdfs namenode -format
```

#### 启动Hadoop

**切换到Hadoop3.2.1的sbin目录下**

```shell
cd /home/hdoop/hadoop3.2.1/sbin
./stat-all.sh
```

到这里就算启动配置成功了。

```shell
jps
```

查看运行的进程，出现如下证明Hadoop安装完毕了

![](https://img-blog.csdnimg.cn/20210129135140788.png#pic_center)

## hbase配置

同Hadoop的安装

```shell
sudo wget $这里换成你要下载的版本的网址，和Hadoop版本适配$
sudo tar zxvf {hbase-version}.tar.gz
```

#### 配置相关文件

在你的Hbase安装的conf文件目录下/HBse/conf

```shell
sudo vim hbase-site.xml
```

配置如下

```xml
 <configuration>
   <property>
      <name>hbase.rootdirname>
      <value>hdfs://localhost:9000/hbasevalue>

   property>
 <property>
      <name>hbase.rootdirname>
      <value>hdfs://localhost:9000/hbasevalue>

   property>
   <property>
        <name>hbase.zookeeper.quorumname>
        <value>127.0.0.1value>
property>
 <property>
        <name>hbase.zookeeper.property.clientPortname>
        <value>9999value>
property>
    <property>
      <name>hbase.zookeeper.property.dataDirname>
      <value>/hadoop/zookeepervalue>
   property>

   <property>
     <name>hbase.cluster.distributedname>
     <value>truevalue>
   property>
  <property>
     <name>hbase.unsafe.stream.capability.enforcename>
     <value>falsevalue>
property>
    <property>
        <name>hbase.mastername>
        <value>60000value>
    property>
configuration>

```

这里的端口我是自己改过了，因为我得电脑端口上我看了有占用，所以就换了一个

配置hbase-env.sh

```shell
sudo vim hbase-env.sh
```

加入如下两行

```sh
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
#上面是JAVA_HOME路径
export HBASE_MANAGES_ZK=false
#不适用HBse的zookeeper，因为后面我要自己安装zookeeper(若不安装把false改为true)
```

HBase启动

```shell
cd 到Hbase/bin目录下
./start-hbase-sh
```

HBase路径可以添加也可以不添加。

## zookeeper 配置

```shell
wget https://mirror-hk.koddos.net/apache/zookeeper/zookeeper-3.5.8/apache-zookeeper-3.5.8-bin.tar.gz
tar -zxvf apache-zookeeper-3.5.8-bin.tar.gz
```

版本可以自己选，这是我得版本，bin和没有bin的好像是一个编译成二进制了。

### 配置相关文件

这个文件比较好配置，因为系统提供了一个zoo_sample.cfg，所以我们只要复制过来就好了

```
cd zookeeper/conf&#x76EE;&#x5F55;&#x4E0B;
cp zoo_sample.cfg zoo.cfg
```

**复制过后，打开zoo.cfg文件**

```xml

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper
clientPort=9999 #修改成上面的hbase配置一样的端口默认是2181，其他不用改

```

配置完毕，启动zookeeper

```shell
cd 到zookeeper/bin 目录下
./zkServer.sh start
```

都启动后会像如下

![](https://img-blog.csdnimg.cn/20210129135210279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)

以上就完成了安装的全过程。

zoo_sample.cfg zoo.cfg

```

**&#x590D;&#x5236;&#x8FC7;&#x540E;&#xFF0C;&#x6253;&#x5F00;zoo.cfg&#x6587;&#x4EF6;**

```xml

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper
clientPort=9999 #&#x4FEE;&#x6539;&#x6210;&#x4E0A;&#x9762;&#x7684;hbase&#x914D;&#x7F6E;&#x4E00;&#x6837;&#x7684;&#x7AEF;&#x53E3;&#x9ED8;&#x8BA4;&#x662F;2181&#xFF0C;&#x5176;&#x4ED6;&#x4E0D;&#x7528;&#x6539;

```

配置完毕，启动zookeeper

```shell
cd 到zookeeper/bin 目录下
./zkServer.sh start
```

以上就完成了安装的全过程。

以后的启动顺序：zookeeper->hadoop->hbase
