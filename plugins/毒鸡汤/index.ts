// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/毒鸡汤$',
        fnc: 'jdt',
        priority: 5000,
        describe: '毒鸡汤'
      }
    ]);
  }

  async jdt(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const url = 'http://www.nows.fun/api.php';
    /** 调用接口获取数据 */
    const res = await this.axios.get(url).catch(err => err);
    /** 判断接口是否请求成功 */
    let message = {};
    if (!res || !res.data || res.data.code !== 1) {
      console.error('[毒鸡汤] 接口请求失败');

      message = {
        content: '毒鸡汤接口请求失败',
        msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
      };
    } else {
      message = {
        content: res.data.data,
        msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
      };
    }

    // 发送消息
    await this.send(e, message);
    return true;
  }
}
