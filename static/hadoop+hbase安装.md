# 实验步骤

## 实现步骤

先看**注意点**和**参考**。

1. 安装Linux系统
2. 安装Hadoop
3. 安装hbase
4. 安装zookeeper
5. 启动集群

## 安装Linux系统

有如下几种方式

- 安装虚拟机
- 安装双系统
- 使用服务器
- docker容器

这里介绍一下虚拟机方式

预先下载vware软件

[Ubuntu20.04](https://releases.ubuntu.com/20.04/ubuntu-20.04.3-desktop-amd64.iso)镜像文件,

1. 文件->新建虚拟机->自定义->下一步

   ![](https://gitee.com/xwyzsn/Picture/raw/master/image-20211014233218358.png)

2. 选择Linux 和Ubuntu,选择好要安装的位置,配置自己设置,然后一直下一步如下,点击`自定义硬件`

   ![image-20211014234012180](https://gitee.com/xwyzsn/Picture/raw/master/image-20211014234012180.png)

   ​				选择刚刚下载的映像文件

   ![image-20211014234052148](https://gitee.com/xwyzsn/Picture/raw/master/image-20211014234052148.png)

   

   ![image-20211014233537655](https://gitee.com/xwyzsn/Picture/raw/master/image-20211014233537655.png)

   ![image-20211016122208316](https://gitee.com/xwyzsn/Picture/raw/master/image-20211016122208316.png)
   
   按照提示界面自主安装



## 下载一些必要的软件

- vim或者其他编辑器软件

  ```shell
  sudo apt install vim
  ```

- apt换源

  ```shell
  cd /etc/
  ```

- 安装jdk

  ```shell
  sudo apt install update
  sudo apt install openjdk-8-jdk -y
  ```

- ssh

  ```shell
  su hadoop
  ssh-keygen -t rsa 
  cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys 
  chmod 640 ~/.ssh/authorized_keys 
  ssh localhost 
  ```

  



## 安装Hadoop

Hadoop有三种安装方式

- 单机:下载就可以用了,用于测试mp等等..
- 伪分布:用一台机器模拟集群
- 分布式:顾名思义



### 下载Hadoop

```shell
wget https://mirrors.cnnic.cn/apache/hadoop/common/hadoop-3.2.2/hadoop-3.2.2.tar.gz 

#解压
tar -zxf hadoop-3.2.2.tar.gz -C /usr/local/

#重命名
mv /usr/local/hadoop-3.2.2/ /usr/local/hadoop
# 添加权限,
chown -R 777 /usr/local/hadoop/
```

下载后会得到一个压缩文件



## 配置伪分布

### 配置路径

```shell
vim ~/.bashrc
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export HADOOP_YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin

# 退出后保存
#生效
source ~/.bashrc
```

### 修改配置信息

```shell
cd /usr/local/hadoop/etc/hadoop
vim core-site.xml
vim hdfs.xml
```

```xml
<configuration>
        <property>
                <name>hadoop.tmp.dir</name>
                <value>file:/usr/local/hadoop/tmp</value>
        </property>
        <property>
                <name>fs.defaultFS></name>
                <value>hdfs://localhost:9000</value>
        </property>
</configuration>
<!--hdfs.xml -->
<configuration>
	<property>
		<name>dfs.replication</name>
		<value>1</value>
	</property>
	<property>
		<name>dfs.namenode.name.dir</name>
		<value>file:/usr/local/hadoop/tmp/dfs/name</value>
	</property>
	<property>
		<name>dfs.datanode.data.dir</name>
		<value>file:/usr/local/hadoop/tmp/dfs/data</value>
	</property>
</configuration>

```



### 启动Hadoop

- 格式namenode 会生成一些基本的信息

  ```shell
  cd /usr/local/hadoop/bin
  hdfs namenode -format
  ```

- 启动Hadoop

  ```shell
  cd /usr/local/hadoop/sbin
  ./start-dfs.sh
  ```

  启动成功后应该看到如下的图

  ![image-20211016141308016](https://gitee.com/xwyzsn/Picture/raw/master/image-20211016141308016.png)





## hbase安装

### 下载解压hbase

```shell
wget https://mirrors.cnnic.cn/apache/hbase/2.3.6/hbase-2.3.6-bin.tar.gz
tar -zxf hbase-2.3.6-bin.tar.gz -C /usr/local
mv /usr/local/hbase-2.3.6/ hbase
```

### 配置hbase

```shell
#在bashrc中添加bin的路径，也可以不加
export path=....<:/usr/local/hbase/bin>

# 修改权限,为了简单起见
chmod -R 777 /usr/local/hbase


```

配置**hbase-env.sh**.

```shell
cd /usr/local/hbase/conf
vim hbase-env.sh
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HBASE_CLASSPATH=/usr/local/hbase/conf
export HBASE_MANAGES_ZK=false #这里和书上不同设置为false我们自己下载zookeeper进行守护 
```

配置**hbase-site.xml**

```xml
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value> //这里设置分布
  </property>
  <property>
    <name>hbase.tmp.dir</name>
    <value>./tmp</value>
  </property>
  <property>
    <name>hbase.unsafe.stream.capability.enforce</name>
    <value>false</value>
  </property>
  <property>
          <name>hbase.rootdir</name>
          <value>hdfs://localhost:9000/hbase</value>
  </property>

```



##　下载zookeeper

```shell
wget https://mirrors.cnnic.cn/apache/zookeeper/stable/apache-zookeeper-3.6.3-bin.tar.gz

tar -zxf apache-zookeeper-3.6.3-bin.tar.gz -C /usr/local

mv /usr/local/apache-zookeeper-3.6.3-bin.tar.gz/ /usr/local/zookeeper


```

### 配置zookeeper

```shell
cp zoo_sample.cfg zoo.cfg

tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper
clientPort=2181#默认端口,如果有冲突可以改,但是hbase也得修改

cd zookeeper/bin #目录下
./zkServer.sh start 

                    

```

全部启动后如下所示



![image-20211016151448227](https://gitee.com/xwyzsn/Picture/raw/master/image-20211016151448227.png)



## 注意点

上述描述了大致的操作过程，可以参考书也可以参考这篇文章，没有全部描述过程但是殊途同归，在安装的时候或多或少会出现一些错误需要**注意**

- 善于使用`log`查看错误

  ```shell
  cat ../logs/hadoop-hadoop-namenode-VM-4-6-ubuntu.log
  ```

- 善于使用**搜索引擎 Google=bing > 百度** 有助于提高效率，同时，**StackOverflow>csdn**

- 需要虚拟机配**置分配的稍微大一点**，我的虚拟机配置内存6G，处理器2核。我在腾讯的1核内存2G的轻量服务器上配置，启动就几乎占满了空间。

  ![image-20211016151709099](https://gitee.com/xwyzsn/Picture/raw/master/image-20211016151709099.png)

  

##  参考

- 书本

- [Hadoop安装Ubuntu20.04](https://tecadmin.net/install-hadoop-on-ubuntu-20-04/)

- [Hadoop+hbase+zookeeper伪分布安装](https://blog.csdn.net/xwyzsn/article/details/112338624?spm=1001.2014.3001.5501)（这篇文章是我之前写的，或许会有点出入）

