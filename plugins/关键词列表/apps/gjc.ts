import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        fnc: 'index',
        reg: 'noCheck',
        priority: 10000,
        describe: '发送内容'
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
    if ((gjc ?? '') === '' || typeof gjc === 'string') {
      return;
    }

    const list = Object.keys(gjc);
    for (const item of list) {
      // 只有网址
      if (
        item === e.msg.content &&
        Object.keys(gjc[item]).length === 1 &&
        Object.keys(gjc[item]).includes('content') &&
        /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/.test(gjc[item].content)
      ) {
        const jpg = gjc[item].content.replace(/(:|\.|\/)/g, '-');
        const qrPath = join(process.cwd(), `/runtime/plugins/关键词列表/img/${jpg}.jpg`);

        if (existsSync(qrPath)) {
          await this.send(e, {
            msg_id: e.msg.id,
            file_image: qrPath
          });
        } else {
          // console.time('qr');
          const qrcode = await this.qr(gjc[item].content, qrPath).catch(err => err);
          // console.timeEnd('qr');
          if (qrcode && existsSync(qrPath)) {
            await this.send(e, {
              msg_id: e.msg.id,
              file_image: qrPath
            });
          }
        }

        return true;
      }

      if (item === e.msg.content) {
        const message = {
          image: gjc[item].image ? 'https://' + gjc[item].image : undefined,
          content: gjc[item].content ? gjc[item].content : undefined,
          msg_id: e.msg.id
        };
        await this.send(e, message);

        return true;
      }
    }
  }
}
