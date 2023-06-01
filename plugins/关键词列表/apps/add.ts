import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const context: Record<string, any> = {}; //添加图片上下文
const contextTimer: Record<string, any> = {}; //记时
// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/添加(.*)$',
        fnc: 'add',
        priority: 500,
        describe: '添加关键词'
      },
      {
        reg: 'noCheck',
        fnc: 'addContent',
        priority: 600,
        describe: '关键词内容'
      }
    ]);
  }

  async add(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
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
      !e.msg.member.roles.includes('4') ||
      // && !e.msg.member.roles.includes('5')

      e.msg.author.id !== QQBot.config.master.id
    ) {
      const message = {
        content: `<@!${e.msg.author.id}> 无权限`,
        msg_id: e.msg.id
      };
      await this.send(e, message);

      return true;
    }

    const msg = e.msg.content.replace('/添加', '').replace(`<@!${QQBot.bot.id}>`, '').trim();

    if (msg === '') {
      const message = {
        content: `<@!${e.msg.author.id}> 内容不能为空!`,
        msg_id: e.msg.id
      };
      await this.send(e, message);
      return true;
    }
    const message = {
      content: `<@!${e.msg.author.id}> 请发送内容! 如果内容有网址就只能发网址，不可以加多余内容`,
      msg_id: e.msg.id
    };

    //上下文添加
    context[e.msg.author.id] = {
      text: msg
    };
    await this.send(e, message);

    contextTimer[e.msg.author.id] = setTimeout(async () => {
      if (context[e.msg.author.id]) {
        delete context[e.msg.author.id];
        const message = {
          content: `<@!${e.msg.author.id}> 添加已取消!`,
          msg_id: e.msg.id
        };
        await this.send(e, message);
      }
    }, 120 * 1000);
    return true;
  }

  async addContent(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType === 'MESSAGE_CREATE') {
      if (!context[e.msg.author.id]) {
        return;
      }

      if (e.msg.attachments && e.msg.attachments.length > 1) {
        const message = {
          content: `<@!${e.msg.author.id}> 只能用一张图片哦!`,
          msg_id: e.msg.id
        };

        await this.send(e, message);
        clearTimeout(contextTimer[e.msg.author.id]);
        delete contextTimer[e.msg.author.id];
        delete context[e.msg.author.id];
        return true;
      }
      const gjcPath = join(process.cwd(), '/data/plugins/关键词列表/关键词.yaml');

      if (!existsSync(gjcPath)) {
        mkdirSync(dirname(gjcPath), { recursive: true });
      }

      let gjc = existsSync(gjcPath) ? this.yaml.parse(readFileSync(gjcPath, 'utf-8')) : '';

      if ((gjc ?? '') === '' || typeof gjc === 'string') {
        gjc = {};
      }

      gjc[context[e.msg.author.id].text] = {
        content: e.msg.content ? e.msg.content : undefined,
        image: e.msg.attachments ? e.msg.attachments[0].url : undefined
      };

      writeFileSync(gjcPath, this.yaml.stringify(gjc));

      const message = {
        content: `<@!${e.msg.author.id}> 添加成功!`,
        msg_id: e.msg.id
      };
      await this.send(e, message);

      clearTimeout(contextTimer[e.msg.author.id]);
      delete contextTimer[e.msg.author.id];
      delete context[e.msg.author.id];
      return true;
    }
  }
}
