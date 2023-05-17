// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/原神黄历$',
        fnc: 'index',
        priority: 5000,
        describe: '原神黄历'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    await this.send(e, {
      msg_id: e.msg.id,
      image: 'https://api.xingzhige.com/API/yshl/'
    });

    return true;
  }
}
