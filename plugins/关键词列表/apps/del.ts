import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/删除(.*)$', //匹配消息正则，命令正则
        fnc: 'index',
        priority: 500, //优先级，越小优先度越高
        describe: '删除关键词' //【命令】功能说明
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 只允许私域消息
    if (e.eventType !== 'MESSAGE_CREATE') {
      return;
    }
    // 1	全体成员
    // 2	管理员
    // 4	群主/创建者
    // 5	子频道管理员
    // 没有权限
    if (
      !e.msg.member.roles.includes('4')
      // && !e.msg.member.roles.includes('5')
    ) {
      const message = {
        content: `<@!${e.msg.author.id}> 无权限`,
        msg_id: e.msg.id
      };
      await this.send(e, message);

      return true;
    }

    const msg = e.msg.content.replace('/删除', '').replace(`<@!${QQBot.bot.id}>`, '').trim();
    if (msg === '') {
      const message = {
        content: `<@!${e.msg.author.id}> 内容不能为空!`,
        msg_id: e.msg.id
      };
      await this.send(e, message);
      return true;
    }
    const gjcPath = join(process.cwd(), '/data/plugins/关键词列表/关键词.yaml');
    const gjc = existsSync(gjcPath) ? this.yaml.parse(readFileSync(gjcPath, 'utf-8')) : '';

    if ((gjc ?? '') === '' || typeof gjc === 'string' || Object.keys(gjc).length === 0) {
      return;
    }
    const newList: Record<string, any> = {};

    const list = Object.keys(gjc);
    for (const item of list) {
      if (msg !== item) {
        newList[item] = gjc[item];
      }
    }

    writeFileSync(gjcPath, this.yaml.stringify(newList));

    const message = {
      content: `<@!${e.msg.author.id}> 删除成功!`,
      msg_id: e.msg.id
    };
    await this.send(e, message);
    return true;
  }
}
