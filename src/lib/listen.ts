import QQBot from './QQBot';
import { AvailableIntentsEventsEnum, SessionEvents, WebsocketCloseReason } from 'qq-guild-bot';
import { green } from 'kolorist';
import Init from './init';
import { join } from 'path';
import { WebsocketClient2 } from '../../QQBot';

export default function listen(ws: WebsocketClient2) {
  let init = false;
  // 消息监听
  ws.on(SessionEvents.READY, async (wsdata: { msg: { user: typeof QQBot.bot } }) => {
    // 保存机器人信息
    QQBot.bot = wsdata.msg.user;
    // 第一次时加载插件
    if (!init) {
      console.info(green(`[登录] :机器人[${wsdata.msg.user.username}]已经准备就绪，可以开始使用`));
      console.info(green(`[HELLO]欢迎使用qq-bot ~`));
      console.info(green(`[API]https://bot.q.qq.com/wiki/develop/api/`));
      console.info(green(`[SDK]https://bot.q.qq.com/wiki/develop/nodesdk/`));

      // 加载插件配置
      new Init().load();
      init = true;
    }
  });

  // 私域
  ws.on(AvailableIntentsEventsEnum.GUILD_MESSAGES, async (e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) => {
    // console.log('[GUILD_MESSAGES] 事件接收 :', e);

    // 当收到消息时
    if (e.eventType === 'MESSAGE_CREATE') {
      const { data } = await QQBot.client.guildApi.guild(e.msg.guild_id);
      console.info(
        green(
          `[私域][收到][${data.id}][${data.name}][${e.msg.author.id}][${e.msg.author.username}]: ${e.msg.content ? e.msg.content : ''} ${
            e.msg.attachments ? '\n' + JSON.stringify(e.msg.attachments, null, 2) : ''
          }`
        )
      );
      // 消息处理
      new Init().dealMsg(e);
    }

    // 当频道的消息被删除时
    else if (e.eventType === 'MESSAGE_DELETE') {
      // 获取频道消息
      const { data } = await QQBot.client.guildApi.guild(e.msg.message.guild_id);
      // 获取成员信息
      const { data: data2 } = await QQBot.client.guildApi.guildMember(e.msg.message.guild_id, e.msg.op_user.id);
      console.info(
        green(`[私域][撤回][${data.id}][${data.name}][${e.msg.op_user.id}][${data2.user.username}]撤回[${e.msg.message.author.id}][${e.msg.message.author.username}]:[${e.msg.message.id}]`)
      );
    }
  });

  // 私信
  ws.on(AvailableIntentsEventsEnum.DIRECT_MESSAGE, (data: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) => {
    if (data.eventType === 'DIRECT_MESSAGE_CREATE') {
      console.info(
        green(
          `[私聊][收到][${data.msg.author.id}][${data.msg.author.username}]: ${data.msg.content ? data.msg.content : ''}${
            data.msg.attachments ? '\n' + JSON.stringify(data.msg.attachments, null, 2) : ''
          }`
        )
      );
      // 消息处理
      new Init().dealMsg(data);
    } else if (data.eventType === 'DIRECT_MESSAGE_DELETE') {
      console.info(green(`[私聊][撤回][${data.msg.message.author.id}]: [${data.msg.message.id}]`));
    }
  });

  // 公域
  ws.on(AvailableIntentsEventsEnum.PUBLIC_GUILD_MESSAGES, async (e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) => {
    // console.log('[PUBLIC_GUILD_MESSAGES] 事件接收 :', e);

    // 当收到@机器人的消息时
    if (e.eventType === 'AT_MESSAGE_CREATE') {
      const { data } = await QQBot.client.guildApi.guild(e.msg.guild_id);
      console.info(
        green(
          `[公域][收到][${data.id}][${data.name}][${e.msg.author.id}][${e.msg.author.username}]: ${e.msg.content ? e.msg.content : ''} ${
            e.msg.attachments ? '\n' + JSON.stringify(e.msg.attachments, null, 2) : ''
          }`
        )
      );
      // 消息处理
      new Init().dealMsg(e);
    }

    // 当频道的消息被删除时
    else if (e.eventType === 'PUBLIC_MESSAGE_DELETE') {
      // 获取频道消息
      const { data } = await QQBot.client.guildApi.guild(e.msg.message.guild_id);
      // 获取成员信息
      const { data: data2 } = await QQBot.client.guildApi.guildMember(e.msg.message.guild_id, e.msg.op_user.id);
      console.info(
        green(`[公域][撤回][${data.id}][${data.name}][${e.msg.op_user.id}][${data2.user.username}]撤回[${e.msg.message.author.id}][${e.msg.message.author.username}]:[${e.msg.message.id}]`)
      );
    }
  });

  // 有人加入频道或退出频道
  ws.on(AvailableIntentsEventsEnum.GUILD_MEMBERS, (e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) => {
    // console.log('[GUILD_MEMBERS] 事件接收 :', e);
    if (e.eventType === 'GUILD_MEMBER_ADD') {
      console.info(green(`[加入] :成员[${e.msg.user.id}][${e.msg.user.username}]已经加入频道[${e.msg.guild_id}]`));
    } else if (e.eventType === 'GUILD_MEMBER_REMOVE') {
      console.info(green(`[退出] :成员[${e.msg.user.id}][${e.msg.user.username}]已经退出频道[${e.msg.guild_id}]`));
    } else {
      console.info(green(`[成员资料变更] :成员[${e.msg.user.id}][${e.msg.user.username}]`));
    }
  });

  // ws.on(AvailableIntentsEventsEnum.INTERACTION, (data: { msg: any }) => {
  //   console.log('[INTERACTION] 事件接收 :', data);
  // });

  // ws.on(AvailableIntentsEventsEnum.MESSAGE_AUDIT, (data: { msg: any }) => {
  //   console.log('[MESSAGE_AUDIT] 事件接收 :', data);
  // });

  // ws.on(AvailableIntentsEventsEnum.FORUMS_EVENT, (data: { msg: any }) => {
  //   console.log('[FORUMS_EVENT] 事件接收 :', data);
  // });

  // ws.on(AvailableIntentsEventsEnum.AUDIO_ACTION, (data: { msg: any }) => {
  //   console.log('[AUDIO_ACTION] 事件接收 :', data);
  // });

  // [ERROR] 事件接收
  ws.on(SessionEvents.ERROR, data => {
    console.error('[ERROR] 事件接收 :', data);
  });
  //  断线重连
  let s: string | number | NodeJS.Timer;
  ws.on(SessionEvents.EVENT_WS, data => {
    //  断线重连 超过10次时

    if (ws.retry >= 10 && data.eventType === SessionEvents.DISCONNECT && !s) {
      console.error('请查看' + join(process.cwd(), '/config/config.yaml') + '配置是否正确');
      s = setInterval(() => {
        if (ws.retry >= 20) {
          clearInterval(s);
          console.log('关闭链接');
        }

        console.info('[CLIENT] 重新连接中，尝试次数：', ws.retry + 1);

        ws.connect(QQBot.client.config, WebsocketCloseReason.find(v => v.code === data.code)?.resume ? data.eventMsg : null);

        ws.retry += 1;
      }, 60 * 1000);
    } else if (data.eventType === SessionEvents.READY) {
      if (s) clearInterval(s);
    }
  });
}
