import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/关键词列表',
        fnc: 'index',
        priority: 502,
        describe: '关键词列表'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 只允许私域消息
    if (e.eventType !== 'MESSAGE_CREATE') {
      return;
    }

    const gjcPath = join(process.cwd(), '/data/plugins/关键词列表/关键词.yaml');
    const gjc = existsSync(gjcPath) ? this.yaml.parse(readFileSync(gjcPath, 'utf-8')) : '';
    if ((gjc ?? '') === '' || typeof gjc === 'string' || Object.keys(gjc).length === 0) {
      const message = {
        content: `<@!${e.msg.author.id}> 暂时没有关键词!`,
        msg_id: e.msg.id
      };
      await this.send(e, message);
    } else {
      const list = Object.keys(gjc);

      let msg = '';
      let i = 1;
      for (const item of list) {
        msg += i + '、' + item + '\n';
        i++;
      }
      const message = {
        content: msg,
        msg_id: e.msg.id
      };
      await this.send(e, message);
    }

    return true;
  }
}
