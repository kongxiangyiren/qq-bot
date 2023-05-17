<h1 align="center">Welcome to qq-bot 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.8-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/kongxiangyiren/qq-bot/blob/main/LICENSE" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
  </a>
</p>

> 基于 node 的 qq 频道机器人

![](./docs/%E8%8F%9C%E5%8D%95.jpg)

![](./docs/547c9ead6708795d55736a2a4fe099ef.jpg)

![](./docs/Screenshot_2023-05-09-20-14-14-65_9d26c6446fd7bb8.jpg)

# 项目地址

## gitee

```sh
git clone https://gitee.com/fei-yuhao/qq-bot.git
```

## github

```sh
git clone https://github.com/kongxiangyiren/qq-bot.git
```

# 可执行文件下载

可直接下载可执行文件和插件双击启动

[gitee](https://gitee.com/fei-yuhao/qq-bot/releases/latest)
[github](https://github.com/kongxiangyiren/qq-bot/releases/latest)

注意可执行文件不支持自动更新

# 安卓手机运行

https://www.kongxiangyiren.top/posts/344e2eab599d/

# 运行项目

## 1、安装 node 和 yarn

安装 node
https://www.runoob.com/nodejs/nodejs-install-setup.html

设置 npm 镜像

```sh
npm config set registry https://registry.npmmirror.com/
```

安装 yarn

```sh
npm i yarn -g
```

## 克隆项目

```sh
git clone https://gitee.com/fei-yuhao/qq-bot.git
```

## 初始化

### linux 需要安装 puppeteer 运行环境

centos

```sh
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y && yum install libdrm libgbm libxshmfence -y && yum install nss -y && yum update nss -y;
```

其他 linux 系统请自行百度

安装中文字体

```sh
yum groupinstall fonts -y
```

### 安装依赖

```sh
cd ./qq-bot && yarn
```

### 启动项目

```sh
yarn start
```

请根据要求填写信息

## pm2 持久化运行

【ctrl+c】退出运行

### 全局安装 pm2

```sh
npm i pm2 -g
```

### 安装 pm2 日志管理插件

```sh
pm2 install pm2-logrotate
```

### 修改日志管理插件时区

```sh
pm2 set pm2-logrotate:TZ Asia/Shanghai
```

### pm2 启动

```sh
yarn pm2:start && yarn pm2:save
```

## 开机启动

### windows

安装开机启动包

```sh
npm i -g pm2-windows-startup
```

创建开机启动脚本文件

```
pm2-startup install
```

如果要取消开机启动

```sh
pm2-startup uninstall
```

### 其他系统 (非手机)

开机启动

```sh
pm2 startup
```

禁止开机启动

```sh
pm2 unstartup
```

# 其他说明

1、如果想打包成 js 项目

```
yarn build
```

2、打包成可执行文件

```sh
yarn pkg
```

注意这两种方式并不支持自动更新

# 关于

## Author

👤 **空巷一人**

- Github: [@kongxiangyiren](https://github.com/kongxiangyiren)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/kongxiangyiren/qq-bot/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2023 [空巷一人](https://github.com/kongxiangyiren).<br />
This project is [Apache--2.0](https://github.com/kongxiangyiren/qq-bot/blob/main/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
