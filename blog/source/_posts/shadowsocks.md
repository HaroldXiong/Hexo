title: Digital Ocean+ShadowSocks实现校园网免流量上网
date: 2015-11-11 23:33:33
tags: [ShadowSocks, VPS, 科学上网, 服务器, 代理, Linux]
categories: [网络, 科学上网]
photos:
	- /img/ssbanner.png
---
由于校园网的资费坑得一逼，况且有流量限制，这种感觉甚是让人不爽。之前曾看到郑老湿和陈老湿在VPS搭上VPN免流量上网，后来又在开源课上受到[杜老师](http://www.pufengdu.org/)的启发，决定通过ShadowSocks代理后的IPv6教育网实现**免流量上网**。

#开通VPS服务器
目前使用体验较好的VPS服务商大概有Linode、Sakura、Digital Ocean等等，由于GitHub的[Student Developer Pack](https://education.github.com/pack)有DO家的50美刀优惠~~直到三个月后才申请下来，由于注册时已经输过优惠码所以就坑了~~，于是本文使用的是DO的服务。

##注册DO帐号
通过我的邀请 [注册地址](https://www.digitalocean.com/?refcode=bbb0bdba1c4e) 注册的新账户将获得$10的优惠。

按照步骤填完个人信息后，需要绑定支付方式并往新账户里充5美元来激活DO账户。个人建议先绑定PayPal账户，至于PayPal如果没有信用卡的话，绑定储蓄卡也是可以的，个人亲测学校发的交行卡可用。

激活账户后，如果你有GitHub教育优惠就使用它给的优惠码，如果没有可以搜一个最近的10美元或20美元优惠码，注意这样的优惠码**只能输一次**。

![输入优惠码](/img/sspromo.png)

账户余额基本就有15美元了，这足够使用最便宜的套餐3个月了。

##新建服务器
首先要给服务器取一个Hostname，按个人喜好随意命名。

然后选择套餐，我选择的是最便宜的$5套餐，包含**512M的内存、20G的SSD和1000G流量**每个月。

![选择配置](/img/ssch1.png)

数据中心任意选择，考虑到国际光缆的走向，建议选择位于美国西海岸或者亚太地区的，我选择的是旧金山机房。

选择镜像的时候选一个自己熟悉的系统就可以了，也可以选择带一键安装应用的，按需选择即可。

![选择配置](/img/ssch2.png)

附加选项里**记得选上IPv6**，因为在本文的需求中这是必不可少的。

SSH公钥可以现在添加，也可以以后再添加。之后点创建就可以等着创建完成了。~~DO宣传最少只用55秒就可以创建完成，但是我好像用了几分钟的样子？~~

创建成功后，就会进入到这个VPS的管理界面，从设置中可以看到你的公网地址。同时DO会发送首次登录的密码到你的邮箱中，请注意查收。姑且将这台服务器的地址记作`IP`，然后就可以在DO提供的网页版控制台或本地终端SSH登录了：

	ssh root@IP

成功登录后，首先要求更改root密码。如果希望以后本机登录不再输入密码，可以将本地的公钥上传到服务器端：

	cat ~/.ssh/id_rsa.pub | ssh root@IP 'cat >> .ssh/authorized_keys'

如果本地`~/.ssh`目录下没有`id_rsa`这样的文件，可以使用`ssh-keygen`命令在该目录下生成。这样以后每次ssh连接时就不用再输密码了。

#配置ShadowSocks
ShadowSocks是一个安全的socks5代理，它通过客户端以指定的密码、加密方式和端口连接服务器，成功连接到服务器后，客户端在用户的电脑上构建一个本地socks5代理。使用时将流量分到本地socks5代理，客户端将自动加密并转发流量到服务器，服务器以同样的加密方式将流量回传给客户端，以此实现代理上网。

##服务器端
###搭建服务
SSH登录到VPS服务器后要使用pip安装ShadowSocks，所以先装`pip`。

如果服务器是基于Red Hat的系统（CentOS等等），使用命令：

	yum install python-setuptools && easy_install pip
	
如果是基于Debian的系统（Ubuntu等等），使用命令：

	apt-get install python-pip

之后通过pip安装ShadowSocks：
	
	pip install shadowsocks

安装完成后，在`/etc/`下新建一个叫`shadowsocks.json`的配置文件，内容如下：

```bash
{
	"server" : "::",
	"server_port" : 8388,
	"local_address" : "127.0.0.1",
	"local_port" : 1080,
	"password" : "PASSWORD",
	"timeout" : 300,
	"method" : "rc4-md5"
}
```
其中`"server"`一栏之所以填`"::"`是为了同时监听IPv4/v6两个端口，因为本文的需求中我们需要双栈连接，如果VPS没有IPv6功能或仅是为了搭梯子用，这里面填写一个IPv4的地址就可以了。`"password"`栏填写自己要设置的密码。至于`"method"`加密方式一栏，主流的有`rc4-md5`和`aes-256-cfb`等等，据说前者速度快，后者更安全，可以根据个人喜好自行权衡。

如果有多个用户需要使用而不想都使用一套端口和密码，可以如下写成多端口配置文件：

```bash
{
	"server" : "::",
	"local_address" : "127.0.0.1",
	"local_port" : 1080,
	"port_password":
	{
		"8388":"PASSWORD0",
		"8389":"PASSWORD1",
		"8340":"PASSWORD2"
	},
   	"timeout" : 300,
	"method" : "rc4-md5"
}
```

保存后就可以通过以下命令启动和停止ShadowSocks服务了：

	ssserver -c /etc/shadowsocks.json --fast-open -d start
	ssserver -d stop
	
如果发现开启服务后连接不上，可以**停用防火墙**试一下。
	
要是觉得以上命令太长难于记忆，可以在`~/.bashrc`里加入alias：

```bash
alias ssstart='ssserver -c /etc/shadowsocks.json --fast-open -d start'
alias ssstop='ssserver -d stop'
```

保存后记得使用`source ~/.bashrc`命令应用配置，这样就可以每次通过`ssstart`和`ssstop`命令启动或停止服务了。

在CentOS7以后可以用systemd启动Shadowsocks，先新建启动脚本`/etc/systemd/system/shadowsocks.service`：

```bash
[Unit]
Description=Shadowsocks

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/ssserver -c /etc/shadowsocks.json
ExecStop=/usr/bin/ssserver -d stop

[Install]
WantedBy=multi-user.target
```

然后就可以通过`systemctl start shadowsocks`启动了，并通过`systemctl enable shadowsocks`设置开机自启。

###性能优化
现在我们要祭出TCP加速神器——**锐速**了。

~~锐速是一款免费的TCP底层加速软件~~，可以便捷地完成服务器网络的优化，配合ShadowSocks效果甚好。

首先要去[锐速官网](http://www.serverspeeder.com/)注册。然后在服务器上通过以下命令下载安装：

	wget http://my.serverspeeder.com/d/ls/serverSpeederInstaller.tar.gz
	tar xzvf serverSpeederInstaller.tar.gz
	bash serverSpeederInstaller.sh
	
安装过程中需要填写刚注册的账号密码等，一路回车安装结束。

之后还要编辑配置文件`/serverspeeder/etc/config`，修改以下参数:

```bash
advinacc="1"
maxmode="1"
rsc="1"
gso="1"
```

保存后重启服务就可以了：

	service serverSpeeder restart
	
目前锐速不再开放使用，想用的朋友可以到[91云](https://www.91yun.org/en/serverspeeder91yun)寻找新途径。

##本地客户端
首先确定你可以获取到IPv6地址，最简便的方法就是打开[六维空间](http://bt.neu.edu.cn/)测试一下，如果可以打开就说明没问题。

###Windows
[Shadowsocks for Windows](https://github.com/shadowsocks/shadowsocks-windows/releases)

###Mac OS X
[ShadowsocksX](https://github.com/shadowsocks/shadowsocks-iOS/releases)

###Linux
Linux的客户端安装方式同服务器端，只不过启动命令变成了：

	sudo sslocal -c /etc/shadowsocks.json -d start

同理将`start`改成`stop`就是停止服务。

也可以参考[shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)安装图形化界面版本。

各种平台上的服务器配置按照之前服务器端的设置填写即可，但是server地址记得**填写IPv6的**，然后设成全局代理。

这时Google一下自己的[IP](https://www.google.com/#newwindow=1&safe=active&q=ip)，如果地址确实是VPS的地址，就可以开始愉快的上网了。
