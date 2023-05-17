// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '(.*)?/点赞$',
        fnc: 'index',
        priority: 5000,
        describe: '点赞'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    //    需要私域或公域事件
    if (e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }
    const msg = e.msg.content.replace(/<@!(\d+)>/g, '').trim(); //去除所有@
    if (!/^\/点赞$/g.test(msg)) {
      return false;
    }

    // 点赞 e.msg.message_reference.message_id :回复消息id,  e.msg.id 消息id
    await QQBot.client.reactionApi.postReaction(e.msg.channel_id, {
      message_id: e.msg.message_reference && e.msg.message_reference.message_id ? e.msg.message_reference.message_id : e.msg.id,
      // 表情类型
      emoji_type: 1,
      // 表情 ID
      // https://bot.q.qq.com/wiki/develop/nodesdk/model/emoji.html#Emoji-%E5%88%97%E8%A1%A8
      emoji_id: '201'
    });

    // //  回复
    // await this.send(e, {
    //   msg_id: e.msg.id,
    //   content: '已赞'
    // });
    return true;
  }
}
