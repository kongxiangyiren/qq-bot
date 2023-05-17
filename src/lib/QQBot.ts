import { IOpenAPI, AvailableIntentsEventsEnum, SessionEvents, Embed } from 'qq-guild-bot';
import plugin from './plugin';
import { READY, eventType, IMessage2, MessageToCreate2, WebsocketClient2 } from '../../QQBot';

export default class QQBot {
  /** 机器人信息 */
  static bot: READY;
  /**  项目根路径 */
  static ROOT_PATH: string;
  /** config.yaml配置 */
  static config: {
    /** 机器人配置 */
    config: {
      /** 机器人appID */
      appID: string;
      /** 机器人token */
      token: string;
      /** 机器人intents */
      intents: AvailableIntentsEventsEnum[];
      /** sandbox */
      sandbox: boolean;
    };
    master: {
      /** 认证密码 ，确认后删除 */
      pass?: string;
      /** 主人id */
      id: string;
    };
  };
  /** qq-guild-bot client */
  static client: IOpenAPI;
  /** qq-guild-bot ws */
  static ws: WebsocketClient2;
  /** qq-guild-bot Embed */
  static Embed: Embed;
  /**
   * 事件类型
   *
   * * `MESSAGE_CREATE`  私域  发送消息事件
   * * `MESSAGE_DELETE` 私域  删除（撤回）消息事件
   * * `DIRECT_MESSAGE_CREATE` 当收到用户发给机器人的私信消息时
   * * `DIRECT_MESSAGE_DELETE` 私信删除
   * * `AT_MESSAGE_CREATE` 公域 当收到@ 机器人的消息时
   * * `PUBLIC_MESSAGE_DELETE` 公域 撤回
   */
  static eventType: eventType;
  static plugin: typeof import('./plugin').default;
  // 消息
  static IMessage2: IMessage2;
  static MessageToCreate2: MessageToCreate2;
  static AvailableIntentsEventsEnum: typeof AvailableIntentsEventsEnum;
  static SessionEvents: { CLOSED: string; READY: string; ERROR: string; INVALID_SESSION: string; RECONNECT: string; DISCONNECT: string; EVENT_WS: string; RESUMED: string; DEAD: string };
  static kolorist: typeof import('kolorist');
}
QQBot.plugin = plugin;
QQBot.AvailableIntentsEventsEnum = AvailableIntentsEventsEnum;
QQBot.SessionEvents = SessionEvents;
QQBot.kolorist = require('kolorist'); //imoport找不到
