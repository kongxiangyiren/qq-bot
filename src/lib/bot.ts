import { createOpenAPI, createWebsocket } from 'qq-guild-bot';
import check from './check';

import listen from './listen';

import QQBot from './QQBot';
import { download } from './tools/puppeteer/puppeteer';
import { yellow } from 'kolorist';
import { rmSync } from 'fs';
import { join } from 'path';
// import { ctreateRedis } from './tools/redis';

export default class Bot {
  constructor(config: { ROOT_PATH: string }) {
    QQBot.ROOT_PATH = config.ROOT_PATH;
  }

  async run() {
    // 下载
    await download();
    // // 初始化redis
    // ctreateRedis();
    // 检查配置
    QQBot.config = await check();

    if (!QQBot.config) return;

    if (!QQBot.config.master) {
      rmSync(join(process.cwd(), '/config/config.yaml'));
      QQBot.config = await check();
      if (!QQBot.config) return;
    }

    if (!QQBot.config.master.id) {
      console.log(yellow(`请尽快私聊机器人发送 /主人认证${QQBot.config.master.pass} 进行认证`));
    }

    // 创建 client
    QQBot.client = createOpenAPI(QQBot.config.config);
    // 创建 websocket 连接
    QQBot.ws = createWebsocket(QQBot.config.config);

    listen(QQBot.ws);

    global.QQBot = QQBot;
  }
}
