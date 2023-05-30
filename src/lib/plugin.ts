import axios, { AxiosStatic } from 'axios';
import { IMessage } from 'qq-guild-bot';
import { createReadStream, existsSync } from 'fs';
import FormData from 'form-data'; // 安装axios就有
import YAML from 'yaml';
import QQBot from './QQBot';
import day from './tools/day';
import lodash from 'lodash';
import schedule from 'node-schedule';
import { getPu } from './tools/puppeteer/puppeteer';
import nunjucks from 'nunjucks';
import qr from './tools/qrcode';
import imageSize from './tools/imageSize';
import cache from './tools/cache';
// import { Redis } from 'ioredis';
export default class plugin {
  axios: AxiosStatic;

  yaml: typeof YAML;
  dayjs: typeof day;
  rules: {
    /** 插件规则触发的正则表达式 没有为 noCheck */
    reg: string;
    /** 插件规则调用的方法 */
    fnc: string;
    /** 优先级，数字越小等级越高 */
    priority: number;
    /** 插件规则描述 */
    describe: string;
  }[];
  lodash: lodash.LoDashStatic;
  /** 定时 */
  schedule: typeof schedule;
  /**
   * @description:
   * @param {import('fs').PathLike} htmlPath html完整路径
   * @param {string} tab html tab标签
   * @param {string} imgPath 生成的图片完整路径
   * @return {Promise<boolean>}
   */
  getPu: (htmlPath: import('fs').PathLike, tab: string, imgPath: string) => Promise<boolean>;
  nunjucks: typeof nunjucks;
  /** 二维码生成 */
  qr: (text: string, out: string) => Promise<unknown>;
  /**
   * @description: 修改图片尺寸
   * @param {string} imgPath 原来的图片路径
   * @param {string} outPath 输出的图片路径
   */
  imageSize: (imgPath: string, outPath: string) => Promise<unknown>;
  cache: typeof cache;

  // redis: Redis;
  // static redis: Redis;

  constructor(
    /** 插件触发规则 */
    rules?: Array<{
      /** 插件规则触发的正则表达式 没有为 noCheck */
      reg: string;
      /** 插件规则调用的方法 */
      fnc: string;
      /** 优先级，数字越小等级越高 */
      priority: number;
      /** 插件规则描述 */
      describe: string;
    }>
  ) {
    this.axios = axios;

    // 插件规则
    this.rules = rules;

    this.yaml = YAML;
    this.dayjs = day;

    this.lodash = lodash;

    this.schedule = schedule;

    this.getPu = getPu;
    this.nunjucks = nunjucks;
    this.qr = qr;

    this.imageSize = imageSize;
    // this.redis = plugin.redis;
    this.cache = cache;
  }

  /** 发送消息 */
  async send(
    e: {
      eventType: typeof QQBot.eventType;
      msg:
        | IMessage
        | {
            guild_id: string;
            channel_id: string;
          };
    },
    msg: typeof QQBot.MessageToCreate2
  ) {
    // 私信
    const privateMessage = ['DIRECT_MESSAGE_CREATE', 'DIRECT_MESSAGE_DELETE'];
    // 子频道
    const channel = ['MESSAGE_CREATE', 'MESSAGE_DELETE', 'AT_MESSAGE_CREATE', 'PUBLIC_MESSAGE_DELETE'];
    // 人员变更
    const personnel = ['GUILD_MEMBER_REMOVE', 'GUILD_MEMBER_ADD'];
    // 私信
    if (privateMessage.includes(e.eventType)) {
      if ((msg.file_image ?? '') !== '') {
        let url = '';
        //判断是不是沙箱环境
        if (QQBot.client.config.sandbox) {
          url = 'https://sandbox.api.sgroup.qq.com';
        } else {
          url = 'https://api.sgroup.qq.com';
        }

        // 判断图片是否存在
        if (!existsSync(msg.file_image)) {
          console.error(`${msg.file_image} 不存在`);
          return { data: `${msg.file_image} 不存在` };
        }

        const picData = createReadStream(msg.file_image);
        const formdata = new FormData();

        for (const item in msg) {
          if (item !== 'file_image') {
            // @ts-ignore
            formdata.append(item, msg[item]);
          } else {
            formdata.append('file_image', picData);
          }
        }

        return this.axios({
          method: 'post',
          url: `${url}/dms/${e.msg.guild_id}/messages`,
          headers: {
            'Content-Type': formdata.getHeaders()['content-type'],
            'Authorization': `Bot ${QQBot.client.config.appID}.${QQBot.client.config.token}`
          },
          data: formdata
        });
      } else {
        return QQBot.client.directMessageApi.postDirectMessage(e.msg.guild_id, msg);
      }
    }
    // 子频道消息
    else if (channel.includes(e.eventType) || personnel.includes(e.eventType)) {
      if ((msg.file_image ?? '') !== '') {
        let url = '';
        //判断是不是沙箱环境
        if (QQBot.client.config.sandbox) {
          url = 'https://sandbox.api.sgroup.qq.com';
        } else {
          url = 'https://api.sgroup.qq.com';
        }

        // 判断图片是否存在
        if (!existsSync(msg.file_image)) {
          console.error(`${msg.file_image} 不存在`);
          return { data: `${msg.file_image} 不存在` };
        }

        const picData = createReadStream(msg.file_image);
        const formdata = new FormData();

        for (const item in msg) {
          if (item !== 'file_image') {
            // @ts-ignore
            formdata.append(item, msg[item]);
          } else {
            formdata.append('file_image', picData);
          }
        }

        return this.axios({
          method: 'post',
          url: `${url}/channels/${e.msg.channel_id}/messages`,
          headers: {
            'Content-Type': formdata.getHeaders()['content-type'],
            'Authorization': `Bot ${QQBot.client.config.appID}.${QQBot.client.config.token}`
          },
          data: formdata
        });
      } else {
        return QQBot.client.messageApi.postMessage(e.msg.channel_id, msg);
      }
    }
  }
}
