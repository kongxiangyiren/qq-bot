import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/?(咸鱼|xianyu|xy)(插件)?(帮助|help)',
        fnc: 'help',
        priority: 5000,
        describe: '描述'
      }
    ]);
  }

  async help(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }

    let cwd = join(__dirname, '../resources/');
    cwd = cwd.replace(/\\/g, '/');

    const data = {
      鸡鸡地址: cwd,
      global: join(process.cwd(), '/global/').replace(/\\/g, '/')
    };
    // 使用模板
    const res = this.nunjucks.render(join(__dirname, '../resources/html/help.html'), data);
    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/help.html`), res);

    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/help.html`), 'body', join(process.cwd(), '/runtime/plugins/xiayu-plugin/img/help.jpg'));

    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), '/runtime/plugins/xiayu-plugin/img/help.jpg'),
        msg_id: e.msg.id
      });
      return true;
    }
  }
}
