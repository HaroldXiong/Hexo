title: ngrok
date: 2016-09-01 21:11:11
tags: [服务器]
categories: [网络, 网站部署]
photos: 
	- https://ngrok.com/static/img/overview.png
---

	git clone https://github.com/inconshreveable/ngrok.git

	yum install golang
	
	cd ngrok
	
	NGROK_DOMAIN="shintaku.cc"

	openssl genrsa -out ngrokroot.key 2048
	openssl req -x509 -new -nodes -key ngrokroot.key -subj "/CN=$NGROK_DOMAIN" -days 65536 -out ngrokroot.crt
	
	openssl genrsa -out snakeoil.key 2048
	openssl req -new -key snakeoil.key -subj "/CN=$NGROK_DOMAIN" -out snakeoil.csr
	openssl x509 -req -in snakeoil.csr -days 65536 -CA ngrokroot.crt -CAkey ngrokroot.key -CAcreateserial -out snakeoil.crt 
	
	cp ngrokroot.crt assets/client/tls/
	cp snakeoil.crt assets/server/tls/
	cp snakeoil.key assets/server/tls/
	
	make release-server
	cp ./bin/ngrokd /usr/sbin/
	GOOS=darwin GOARCH=amd64 make release-client
	