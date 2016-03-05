title: SoftEther VPN的搭建与连接
date: 2016-01-24 23:33:33
tags: [SoftEther, VPN, 科学上网, 服务器, 代理]
categories: [网络, 科学上网]
photos:
	- /img/vpnbanner.png
---
虚拟专用网（**VPN**），是一种常用于连接中、大型企业或团体与团体间的私人网络的通讯方法。虚拟私人网络的讯息透过公用的网络架构来传送内联网的网络讯息。它利用已加密的通道协议来达到保密、发送端认证、消息准确性等私人消息安全效果。这种技术可以用不安全的网络来发送可靠、安全的消息。可以用通俗的例子来解释这件事情：

> FFF国的小张和小王是*异地双性恋*，他们之间经常互通情书。但是FFF国有一个规定，就是异性青少年不能互通信件，否则就要被双双烧死。于是这对情侣就拜托他们的父亲老张和~~隔壁~~老王代为收发信件：小张和小王写完信后各自放在信封中封好，信封上分别写上`小王亲启`和`小张亲启`，然后分别交给他们的父亲，老张和老王把信封又装进一个大信封中，上面分别写上`老王收`和`老张收`再寄出。自然之后老张和老王会收到信件，拆开大信封后发现不是给自己的就转交给自己的孩子，这对情侣就这样达到了通信目的。

看了VPN的原理，我们很容易想到可以用这种方式来科学上网。我们虽然不能直接和被墙的网站通讯，但我们可以通过VPN的方式躲过GFW的追杀。

[SoftEther VPN](https://www.softether.org/)是由日本筑波大学的[登 大遊](http://dnobori.cs.tsukuba.ac.jp/en/)在硕士论文中提出的开源、跨平台、多重协议的虚拟专用网方案，是专门为穿过防火墙而设计的。我们可以用它在自己的VPS上搭建一个简单的VPN来使用。

#服务器端
##下载解压
首先要在服务器上下载并解压安装文件，一定注意是32位还是64位。
32位系统：
	
	wget http://jp.softether-download.com/files/softether/v4.19-9599-beta-2015.10.19-tree/Linux/SoftEther_VPN_Server/32bit_-_Intel_x86/softether-vpnserver-v4.19-9599-beta-2015.10.19-linux-x86-32bit.tar.gz
	tar -zxvf softether-vpnserver-v4.19-9599-beta-2015.10.19-linux-x86-32bit.tar.gz
	
64位系统：

	wget http://jp.softether-download.com/files/softether/v4.19-9599-beta-2015.10.19-tree/Linux/SoftEther_VPN_Server/64bit_-_Intel_x64_or_AMD64/softether-vpnserver-v4.19-9599-beta-2015.10.19-linux-x64-64bit.tar.gz
	tar -zxvf softether-vpnserver-v4.19-9599-beta-2015.10.19-linux-x64-64bit.tar.gz
	
以上为截止发布本文时的最新版本，建议从[SoftEther官方网站](http://www.softether-download.com/en.aspx?product=softether)获取最新版本。

##安装启动
`cd vpnserver`进入到解压目录下并启动安装脚本`./.install.sh`：

	--------------------------------------------------------------------

	SoftEther VPN Server (Ver 4.19, Build 9599, Intel x86) for Linux Install Utility
	Copyright (c) SoftEther Project at University of Tsukuba, Japan. All Rights Reserved.

	--------------------------------------------------------------------


	Do you want to read the License Agreement for this software ?

	 1. Yes
	 2. No

	Please choose one of above number:
	
认识不认识字至少读一读，之后会出现一堆License，然后问你看懂了没：

	Did you read and understand the License Agreement ?
	(If you couldn't read above text, Please read 'ReadMeFirst_License.txt' file with any text editor.)

	 1. Yes
	 2. No

	Please choose one of above number:

当然没看懂也要说看懂了，然后又问你同不同意：

	Did you agree the License Agreement ?

	1. Agree
	2. Do Not Agree

	Please choose one of above number:

不同意就不要用了。如果提示不识别某些命令比如`gcc`，另行安装即可。如果没有异常则说明安装成功，执行`./vpnserver start`启动服务。同理`./vpnserver stop`停止服务。

##设置密码
启动成功后我们需要设置远程登录密码以便本地管理服务。运行`./vpncmd`进入VPN的命令行：
	
	vpncmd command - SoftEther VPN Command Line Management Utility
	SoftEther VPN Command Line Management Utility (vpncmd command)
	Version 4.19 Build 9599   (English)
	Compiled 2015/10/19 20:28:20 by yagi at pc30
	Copyright (c) SoftEther VPN Project. All Rights Reserved.

	By using vpncmd program, the following can be achieved.

	1. Management of VPN Server or VPN Bridge
	2. Management of VPN Client
	3. Use of VPN Tools (certificate creation and Network Traffic Speed Test Tool)

	Select 1, 2 or 3:

这里我们选择1，然后出现：

	Specify the host name or IP address of the computer that the destination VPN Server or VPN Bridge is operating on.
	By specifying according to the format 'host name:port number', you can also specify the port number.
	(When the port number is unspecified, 443 is used.)
	If nothing is input and the Enter key is pressed, the connection will be made to the port number 8888 of localhost (this computer).
	Hostname of IP Address of Destination:
	
这里需要选择地址和端口。由于这台VPS我搭了一个网站，用了SSL占用了443端口，所以默认的443端口是用不了了，所以一定要改。我改用了5555端口，所以在这里输入`localhost:5555`，然后出现：

	If connecting to the server by Virtual Hub Admin Mode, please input the Virtual Hub name.
	If connecting by server admin mode, please press Enter without inputting anything.
	Specify Virtual Hub Name:
	
这里就是指定一个虚拟HUB名字，用默认的直接回车就行。

	Connection has been established with VPN Server "localhost" (port 5555).

	You have administrator privileges for the entire VPN Server.

	VPN Server>
	
这时我们需要输入`ServerPasswordSet`命令设置远程管理密码，确认密码后就可以通过Windows版的`SoftEther VPN Server Manager`远程管理了。

#VPN管理
首先下载并安装[SoftEther VPN Server Manager](http://jp.softether-download.com/files/softether/v4.19-9599-beta-2015.10.19-tree/Windows/SoftEther_VPN_Server_and_VPN_Bridge/softether-vpnserver_vpnbridge-v4.19-9599-beta-2015.10.19-windows-x86_x64-intel.exe)，其实只用到了管理工具：

![Setup Wizard](/img/vpnsetup.png)

安装之后运行它：

![Server Manager](/img/vpnnew.png)

在这里点`新建`：

![New Connection Setting](/img/vpnset.png)

`Host Name`填服务器的地址或域名，端口如果之前改过了在这也记得改过来，右下角的密码填之前设置过的密码。新建完成后`Connect`就会弹出`Easy Setup`窗口：

![Easy Setup](/img/vpneasy.png)

这里在第一个`远程连接`挑钩然后下一步即可，虚拟HUB名像之前一样默认就好。

然后会弹出一个`动态DNS功能`的窗口，由于不能确定它给的域名是不是被墙了，我们就不去用它，把这个窗口关了就行了。

之后会有一个协议设置的窗口：

![IPsec/L2TP/EtherIP/L2TPv3 Server Settings](/img/vpnl2tp.png)

这里把`启用L2TP`挑上钩，下面设置一个`IPsec预共享密钥`就行了。

之后又会弹出一个`VPN Azure Cloud`服务的窗口，感觉没什么用，禁用了就行了。即使有用以后也可以再启用。

接下来要新建用户：

![Create New User](/img/vpnuser.png)

其中用户名是必填的，验证类型选密码验证就行，然后在右侧设置用户密码。

![Server Manager](/img/vpnmanager.png)

之后回到管理界面，点`管理虚拟HUB`：

![Virtual Hub](/img/vpnhub.png)

这里也可以继续添加新用户。点`虚拟NAT和虚拟DHCP服务器`，弹出窗口：

![Virtual NAT & Virtual DHCP](/img/vpnvirtual.png)

在里面`启用SecureNAT`并点`SecureNAT配置`：

![SecureNAT Configration](/img/vpnnat.png)

注意DNS要改为`8.8.8.8`和`8.8.4.4`。这里就算配置完毕。

#本地连接
##Windows
首先到`网络和共享中心`里新建一个网络连接：

![Set Up a Connection or Network](/img/vpnwin1.png)

选择`连接到工作区`	。

![Connect to a Workplace](/img/vpnwin2.png)

这里当然要选VPN咯。

![Connect to a Workplace](/img/vpnwin3.png)

然后在地址栏里填上服务器地址或域名。配置完成后打开`更改适配器设置`：

![Network Connections](/img/vpnwin4.png)

打开VPN连接的属性：

![Properties](/img/vpnwin5.png)

在`安全`选项卡里将`VPN类型`改为`L2TP`，然后点高级设置：

![Advanced Properties](/img/vpnwin6.png)

在里面选上使用预共享密钥并把之前设置的密钥填进去。

![Sign in](/img/vpnwin7.png)

之后在VPN连接里把用户名和密码填进去就可以连上了。

##Mac OS X
在网络配置里新建网络连接：

![Network Preferences](/img/vpnmac1.png)

接口选`VPN`，VPN类型选`L2TP over IPSec`，创建即可。

![Network Preferences](/img/vpnmac2.png)

然后在地址栏填服务器地址或域名，下面的账户名称填之前新建的用户名，然后点下面的`认证设置`：

![Network Preferences](/img/vpnmac3.png)

密码中填上面用户的密码，共享密钥填之前设置的预共享密钥，保存并连接即可。