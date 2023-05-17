// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '(.*)?/撤回$',
        fnc: 'index',
        priority: 5000,
        describe: '描述'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    //   回复信息撤回
    //    需要私域或公域事件
    if (e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }

    const msg = e.msg.content.replace(/<@!(\d+)>/g, '').trim(); //去除所有@
    if (!/^\/撤回$/g.test(msg)) {
      return false;
    }
    if (e.msg.message_reference && e.msg.message_reference.message_id) {
      // // 1	全体成员
      // // 2	管理员
      // // 4	群主/创建者
      // // 5	子频道管理员
      // // 没有权限
      // if (
      //   !e.msg.member.roles.includes('4')
      //   // && !e.msg.member.roles.includes('5')
      // ) {
      //   return;
      // }

      await QQBot.client.messageApi.deleteMessage(e.msg.channel_id, e.msg.message_reference.message_id, true).catch(async err => {
        await this.send(e, {
          msg_id: e.msg.id,
          content: err.message
        });
      });
    } else {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你要我撤回什么啊'
      });
    }

    return true;
  }
}
