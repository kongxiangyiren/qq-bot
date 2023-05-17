// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: 'noCheck',
        fnc: 'index',
        priority: 29999,
        describe: '青云客机器人'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }
    // 需要文字
    if (!e.msg.content) {
      return;
    }

    //   需要@机器人
    if (e.msg.content.indexOf(`<@!${QQBot.bot.id}>`) === -1) {
      return;
    }

    const msg = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();

    const url = `https://api.qingyunke.com/api.php?key=free&appid=0&msg=${msg}`;

    const res = await this.axios.get(url).catch(err => console.error(err));

    if (res) {
      if (res.data.result == 0) {
        //发送消息
        const reg = new RegExp('{br}', 'g');
        const reg2 = new RegExp('菲菲', 'g');
        const content = res.data.content.replace(reg, '\n').replace(reg2, QQBot.bot.username);

        const message = {
          content: this.getFace(content),
          msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
        };

        // const { data } = await this.send(e, message);
        // this.logger.log(data);
        await this.send(e, message);
      }
    }
    return true;
  }

  getFace(code: string) {
    const reg = new RegExp('{face:(\\d+)}', 'g');

    const content = code.replace(reg, (match: any, p1: any) => {
      return `<emoji:${p1}>`;
    });

    return content;
  }
}
