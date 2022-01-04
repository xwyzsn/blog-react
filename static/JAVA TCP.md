---
link: https://blog.csdn.net/xwyzsn/article/details/109228411
title: Java Sokect编程实现通信
description: 这几天刚学习Java学到了关于TCP编程的内容,于是想着能不能做一个类似与QQ一样的聊天软件.简易版本。先放效果实现的图片。这是客户端的实现界面，因为懒所以只做了客户端的界面，服务端原理类似，用户可以在输入框内输入消息，点击send那么客户端就会收到消息，并且给予回复，并且实时的在消息栏中显示出来。OK那么让我们来说一下这个程序怎么实现。这个程序涉及到了3个部分的知识。1.java 的TCP编程。2.Java多线程并发编程。3.UI设计1.Java的TCP编程原理其实很简单，这里将两个用户一个成为
keywords: java设备通讯指令
author: Xwyzsn Csdn认证博客专家 Csdn认证企业博客 码龄2年 暂无认证
date: 2020-10-22T12:46:00.000Z
publisher: null
stats: paragraph=44 sentences=58, words=311
catalog:blog
---
这几天刚学习Java学到了关于TCP编程的内容,于是想着能不能做一个类似与QQ一样的聊天软件.简易版本。先放效果实现的图片。
![](https://img-blog.csdnimg.cn/20201022190921210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
这是客户端的实现界面，因为懒所以只做了客户端的界面，服务端原理类似，用户可以在输入框内输入消息，点击send那么客户端就会收到消息，并且给予回复，并且实时的在消息栏中显示出来。OK那么让我们来说一下这个程序怎么实现。
**这个程序涉及到了3个部分的知识。1.java 的TCP编程。2.Java多线程并发编程。3.UI设计**

##  1.Java的TCP编程

原理其实很简单，这里将两个用户一个成为服务端，一个称为客户端。服务器端首先要开放一个端口来接受消息，我们所有的软件要交互的话都是要通过端口的。如何查看我们电脑里的可用端口
在cmd窗口输入一下的命令指令，可以查看可用端口。

```bash
netstat -na
```

我们打开服务器的端口，这个时候服务器开始监听是否有消息传到这个窗口来，于是我们在客户端上将消息发送到服务器的IP地址的这个端口上，那么我们就可以实现通信了。这个就是原理，那么实现的话需要用到Java的一个自带的Sokect包。
先上服务器端的代码

```java
ServerSocket ss;
		try {
			ss = new ServerSocket(8001);
			Socket s = ss.accept();
			System.out.println("connected\n");

			InputStream ips = s.getInputStream();
			OutputStream os = s.getOutputStream();

			DataOutputStream dos = new DataOutputStream(os);
			BufferedReader brKey = new BufferedReader(new InputStreamReader(System.in));
			while (true) {
				String str = brKey.readLine();
				if (str.equalsIgnoreCase("quit")) {
					break;
				} else {
					dos.writeBytes(str + System.getProperty("line.separator"));

				}

			}

			ips.close();
			os.close();
			s.close();
			ss.close();
		} catch (IOException e) {

			e.printStackTrace();
		}
	}
}

```

这里写完了服务器端的代码后，客户端的代码也是大同小异。这里直接给出客户端的代码。

```java
public class TcpClient {

	public static void main(String[] args) {

		try {
		Socket  s = new Socket(InetAddress.getByName("127.0.0.1"),8001);

		InputStream ips = s.getInputStream();

		OutputStream op = s.getOutputStream();

		DataOutputStream dos = new DataOutputStream(op);

		BufferedReader brKey = new BufferedReader(new InputStreamReader(System.in));

		while(true) {
			String str=brKey.readLine();
			if(str.equalsIgnoreCase("quit")) {
				break;
			}
			else {
				dos.writeBytes(str+System.getProperty("line.separator"));
			}}

```

这里我们完成了客户端和服务器端的编写测试效果如下![](https://img-blog.csdnimg.cn/20201022194954324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
这里是在cmd窗口下运行两个class文件，首先运行TCP Server使得服务器开始监听代码。然后运行Tcp Client这个时候显示connect 两个进程就可以开始交互通信了。

## 2.并发编程

上面我们实现了一个简单的通信，但是有局限性就是我们没法实现获取消息和输入同步（大家可以试试看）。这里就用到了Java的并发编程。
原理就是我们创建一个线程实时的获取流中的数据这样就可以实现并发操作了。于是我们这里按照道理就要实现客户端和服务端两个个线程。Java线程实现方式有几种

```java

public class MyThreadServer implements Runnable {
	private InputStream ips;
	private OutputStream os;

	public MyThreadServer(InputStream ips, OutputStream os) {
		this.ips = ips;
		this.os = os;
	}

	@Override
	public void run() {

		try {
			while (true) {
				BufferedReader br = new BufferedReader(new InputStreamReader(ips));

				String str = br.readLine();
				if (str != "") {
					System.out.printf("\n");
					System.out.println("client_said : " + str);
				}
			}
		} catch (IOException e) {

			e.printStackTrace();
		}
	}

}
```

Client的线程类似就不给出了。
之后我们在主程序中加入对于线程的调用即可。

```java
			new Thread(new MyThreadServer(ips, os)).start();

```

我们在Client同理加入。

## 3.UI设计

这个就是最无聊的一个时候了，我用的是eclipse，要先下载一个WindowBUilder，创建一个jframe文件，然后开始慢慢的设计你的界面就好了。。
![](https://img-blog.csdnimg.cn/20201022200226800.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
像这个样子。然后在这这个程序代码中添加我们上述功能的片段就好了。因为我是分开两次写的，所以上面代码肯定不能直接拷贝进来使用，需要结合控件进行一些删减。这里不赘述了，大致就是，线程的获得的输出打印在消息框中，发送消息写在send控件中，并从输入框中获得输入，发送。。

## 4.和别人通信

写到这里之后是可以在我们自己的电脑上运行的，因为我们上面设置的IP地址是127.0.0.1，这个就是自己的电脑地址。那么要和别人聊天咋办呢，其实也很简单，我们在自己的电脑上运行服务端，让别人运行客户端那么客户端获取到我们的IP地址就可以通信了。
然而比较烦的一件事儿是，我用的是校园网，就是内网。。。这个时候别人用你内网的的IP地址肯定没有办法和你通信的。这个时候就需要用到一个软件能够穿透你的内网，把你这个网址映射成一个外网的IP地址，这样就可以和别人通信了。这里有个程序就是花生壳，可以做到上述的功能，个人是有免费的映射端口的功能的。
![](https://img-blog.csdnimg.cn/20201022201102736.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
我们填完这个之后，就可以获得到一个公网的IP地址和端口号，它就映射到了你这个内网的端口，这样我们就可以实现通信啦。我们只要把它给你的外网IP地址替换掉我们的上述的127.0.0.1这个地址就可以（如何查看这个外网IP地址，你只需要点击诊断，他就会出来了）。。然后就好像做完了。。。

## 5.总结

刚学习Java可能会有一些错误是难免的，希望大家的指正，学习是参考了mooc中陈良育老师的慕课，在中国慕课大学上有需要的可以看看讲的很好。
做这个大概花了1.5天的样子。没什么特别的作用就是玩玩。。。可以尝试一下和不同的地区的小伙伴联系，我测试过了。不过这里需要生成可执行文件.exe再发给别人。简单讲一下我创建的是一个maven工程，所以直接maven install （不用添加依赖，因为使用的包都是Java自带的）打成jar包，然后用exe4j这个软件把jar包转成.exe就好了。可以发给别的同学测试一下！还是很有成就感的！！
那么就这样了~~有问题可以欢迎留言或者私信。
把没有UI界面（有UI的太乱了，你可以根据个人需要进行修改）的代码放在了github上有需要的可以自行下载 [github地址](https://github.com/xwyzsn/xwyzsn)（btw这是第一次用这个hhhhhh）
有错误希望指正。
