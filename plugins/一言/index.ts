// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/一言$',
        fnc: 'hitokoto',
        priority: 5000,
        describe: '一言'
      }
    ]);
  }

  async hitokoto(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const url = 'https://v1.hitokoto.cn/';
    /** 调用接口获取数据 */
    let res = await this.axios.get(url).catch(err => err);
    /** 判断接口是否请求成功 */
    let message = {};
    if (!res) {
      console.error('[一言] 接口请求失败');

      message = {
        content: '一言接口请求失败',
        msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
      };
    } else {
      /** 接口结果，json字符串转对象 */
      res = res.data;

      message = {
        content: res.hitokoto,
        msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
      };
    }

    // 发送消息
    await this.send(e, message);
    return true;
  }
}
