import { GetWsParam, IMessage, MessageToCreate, SessionRecord } from 'qq-guild-bot';
import { EventEmitter } from 'ws';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var QQBot: typeof import('./src/lib/QQBot').default;
}

// 登录
interface READY {
  /** 机器人id */
  id: string;
  /** 机器人名称 */
  username: string;
  /** 是否为机器人 */
  bot: boolean;
  /** 状态 */
  status: number;
}

/**
 * 事件类型
 *
 * * `MESSAGE_CREATE`  私域  发送消息事件
 * * `MESSAGE_DELETE` 私域  删除（撤回）消息事件
 * * `DIRECT_MESSAGE_CREATE` 当收到用户发给机器人的私信消息时
 * * `DIRECT_MESSAGE_DELETE` 私信删除
 * * `AT_MESSAGE_CREATE` 公域 当收到@ 机器人的消息时
 * * `PUBLIC_MESSAGE_DELETE` 公域 撤回
 * * `GUILD_MEMBER_REMOVE` 退出频道事件
 * * `GUILD_MEMBER_ADD` 加入频道事件
 */
type eventType =
  /** 私域  发送消息事件 */
  | 'MESSAGE_CREATE'
  /** 私域  删除（撤回）消息事件 */
  | 'MESSAGE_DELETE'
  /** 当收到用户发给机器人的私信消息时 */
  | 'DIRECT_MESSAGE_CREATE'
  /** 私信删除 */
  | 'DIRECT_MESSAGE_DELETE'
  /** 公域 当收到@ 机器人的消息时 */
  | 'AT_MESSAGE_CREATE'
  /** 公域 撤回 */
  | 'PUBLIC_MESSAGE_DELETE'
  /** 退出频道事件 */
  | 'GUILD_MEMBER_REMOVE'
  /** 加入频道事件 */
  | 'GUILD_MEMBER_ADD';

interface IMessage2 extends IMessage {
  /** 为回复信息时 */
  message_reference?: {
    message_id: string;
  };
  /** 成员信息变更时 */
  user?: {
    avatar: string;
    bot: boolean;
    id: string;
    username: string;
  };
  /** 撤回时 */
  message?: {
    author: {
      bot: boolean;
      id: string;
      username: string;
    };
    channel_id: string;
    guild_id: string;
    id: string;
  };
  op_user: {
    id: string;
  };
}

/** 添加本地图片方法 */
interface MessageToCreate2 extends MessageToCreate {
  /** 本地图片完整路径 */
  file_image?: string;
}

declare class WebsocketClient2 extends EventEmitter {
  retry: number;
  connect(config: GetWsParam, sessionRecord?: SessionRecord): any;
}
