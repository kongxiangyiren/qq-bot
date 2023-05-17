// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super();

    QQBot.ws.on(QQBot.AvailableIntentsEventsEnum.GUILD_MEMBERS, async (data: { eventType: 'GUILD_MEMBER_REMOVE' | 'GUILD_MEMBER_ADD'; msg: typeof QQBot.IMessage2 }) => {
      //   console.log(data.eventType);
      // 加入频道
      if (data.eventType === 'GUILD_MEMBER_ADD') {
        const { data: res } = await QQBot.client.channelApi.channels(data.msg.guild_id);

        const channel = res.find(item => item.type === 0);
        await this.examples({
          eventType: data.eventType,
          msg: {
            channel_id: channel.id,
            ...data.msg
          }
        });
        // 退出
      } else if (data.eventType === 'GUILD_MEMBER_REMOVE') {
        const { data: res } = await QQBot.client.channelApi.channels(data.msg.guild_id);
        const channel = res.find(item => item.type === 0);
        await this.examples2({
          eventType: data.eventType,
          msg: {
            channel_id: channel.id,
            ...data.msg
          }
        });
      }
    });
  }

  async examples(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // console.log(e.msg);

    const message = {
      content: `<@!${e.msg.user.id}> 欢迎新人!`,
      //   file_image: join(__dirname, './欢迎.jpeg') //本地上传
      image: 'http://tva1.sinaimg.cn/bmiddle/6af89bc8gw1f8ub7pm00oj202k022t8i.jpg'
    };
    await this.send(e, message);

    return true;
  }
  async examples2(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const message = {
      content: `${e.msg.user.id} ${e.msg.user.username} 离开了我们`
    };
    await this.send(e, message);

    return true;
  }
}
