---
layout: post
title:  MAC下使用 curl+nghttp2 测试APNs
author: Albert
date:   2016-08-08 23:30:35
categories: tech
permalink: /tech/2016/08/08/mac-curl-apns-test.html
display_date: 2016-08-08
---

> 备注: 用于后续调试，最后更新 2017-01-09 备注 curl version 差异

## 上干货

1. p12证书转换为pem
2. curl 是否支持http2
~~3. 参考[APNs Provider API](https://developer.apple.com/library/prerelease/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/APNsProviderAPI.html#//apple_ref/doc/uid/TP40008194-CH101-SW1)~~
3. (正式)参考[APNs Provider API](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW1)

```bash
./curl -i --http2 \
-E /tmp/aps_demo.pem \
-d '{"aps":{"alert":"Test message","badge":1,"sound":"push.caf"}}' \
-H 'Content-Type: application/json; charset=UTF-8' \
-H 'apns-topic:com.example.app' \
"https://api.development.push.apple.com/3/device/DEVICE_TOKEN_PLACEHOLDER_64_HEX_CHARACTERS_HERE_REDACTED_FOR_SECURITY" 
```

**注意** `apns-topic ` 需要根据证书情况来：

* If your certificate includes multiple topics, you must specify a value for this header.
* If you omit this header and your APNs certificate does not specify multiple topics, the APNs server uses the certificate’s Subject as the default topic.

## 细节看这里

### mac 上升级 curl 启用支持 http2

```bash
brew install curl --with-nghttp2
```

注意：因`OS X 10.11.6 (15G1212)`自带 curl 执行以上命令会出现以下情况：	

```bash
==> Caveats
This formula is keg-only, which means it was not symlinked into /usr/local.

OS X already provides this software and installing another version in
parallel can cause all kinds of trouble.

Generally there are no consequences of this for you. If you build your
own software and it requires this formula, you'll need to add to your
build variables:

    LDFLAGS:  -L/usr/local/opt/curl/lib
    CPPFLAGS: -I/usr/local/opt/curl/include

==> Summary
🍺  /usr/local/Cellar/curl/7.50.1: 366 files, 2.6M, built in 1 minute 54 seconds
```

既然是警告性提示，所以不需要太在意。通过查看各自的curl的版本信息，会发现 Features 略有不同，这取决于编译curl时启用的参数信息。

```sh
➜  ~ curl --version
curl 7.43.0 (x86_64-apple-darwin15.0) libcurl/7.43.0 SecureTransport zlib/1.2.5
Protocols: dict file ftp ftps gopher http https imap imaps ldap ldaps pop3 pop3s rtsp smb smbs smtp smtps telnet tftp
Features: AsynchDNS IPv6 Largefile GSS-API Kerberos SPNEGO NTLM NTLM_WB SSL libz UnixSockets
```

```sh
➜  ~ /usr/local/opt/curl/bin/curl --version
curl 7.50.1 (x86_64-apple-darwin15.5.0) libcurl/7.50.1 OpenSSL/1.0.2h zlib/1.2.5 nghttp2/1.13.0
Protocols: dict file ftp ftps gopher http https imap imaps ldap ldaps pop3 pop3s rtsp smb smbs smtp smtps telnet tftp
Features: IPv6 Largefile NTLM NTLM_WB SSL libz TLS-SRP HTTP2 UnixSockets
```

### p12证书转为pem

```sh
openssl pkcs12 -in aps_demo.p12 -out aps_demo.pem -nodes -clcerts
```

