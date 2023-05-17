// 使用jsdoc代码提示
/**
 * @type {import("../../QQBot.d.ts")}
 */
module.exports = class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/test$',
        fnc: 'index',
        priority: 5000,
        describe: 'test'
      }
    ]);
  }

  /**
   * @param {{ eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }} e
   */
  async index(e) {
    if (e.eventType !== 'DIRECT_MESSAGE_CREATE' && e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }

    await this.send(e, {
      msg_id: e.msg.id,
      content: 'test'
    });

    return true;
  }
};
