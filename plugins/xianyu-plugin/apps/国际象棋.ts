import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import panduan from '../model/ChessDecides';

// 可以修改的内容
const prefix = '/'; // 设置指令前缀，可在此设置默认前缀

const as = new panduan();
/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 参与游戏的玩家昵称
 */
const metadata: Record<string, any> = {};

let cwd = join(__dirname, '../resources/html/');
cwd = cwd.replace(/\\/g, '/');
// 不建议修改
var ishelp = 'off'; // 帮助菜单

// 初始地图，不可修改
var map = [
  '车',
  '马',
  '象',
  '王',
  '后',
  '象',
  '马',
  '车',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '空',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '兵',
  '车',
  '马',
  '象',
  '王',
  '后',
  '象',
  '马',
  '车'
];

const rows = 8; // 棋盘宽度
const cols = 8; // 棋盘高度

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?(发起|加入)国际象棋[黑白]?$`,
        /** 执行方法 */
        fnc: 'LaunchGame',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?移动.*$`,
        /** 执行方法 */
        fnc: 'game',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?国际象棋帮助$`,
        /** 执行方法 */
        fnc: 'help',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?结束国际象棋$`,
        /** 执行方法 */
        fnc: 'ov',
        priority: 5000,
        describe: '描述'
      }
    ]);
  }

  /**
   * 帮助
   */
  async help(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }

    if (!metadata[e.msg.channel_id]) {
      await this.over(e);
    }
    ishelp = 'open';
    this.generate(e);
  }
  /**
   * 认输
   */
  async ov(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    if (metadata[e.msg.channel_id] && metadata[e.msg.channel_id].nickname[e.msg.author.id] === e.msg.author.username) {
      // 判断玩家是否在游戏中
      const team = metadata[e.msg.channel_id].players[e.msg.author.id];
      console.log('player：' + team);
      // 对方组
      let isAB = '黑白';
      isAB = isAB.replace(new RegExp(team), '');
      await this.send(e, {
        msg_id: e.msg.id,
        content: `恭喜${isAB}队获得胜利`
      });

      this.over(e);
      return true;
    } else {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `你还没加入游戏，不能主动结束游戏`
      });
      return true;
    }
  }

  /**
   * 发起游戏
   */
  async LaunchGame(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    if (!metadata[e.msg.channel_id]) {
      await this.over(e);
    }

    const emsg = e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()
      .match(/[黑白]/);
    const players = Object.values(metadata[e.msg.channel_id].players).length;
    // console.log(players);

    // 判断是否在游戏内
    if (metadata[e.msg.channel_id].players[e.msg.author.id]) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你已加入游戏，队伍：' + metadata[e.msg.channel_id].players[e.msg.author.id]
      });

      return true;
    }

    // 判断是玩家几
    if (players == 0) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = '黑';
      await this.send(e, {
        msg_id: e.msg.id,
        content: `玩家${e.msg.author.username}发起了国际象棋，其他成员可发送“${prefix}加入国际象棋”加入游戏`
      });
      return true;
    }
    if (players == 1) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = '白';

      const players_nickname = Object.keys(metadata[e.msg.channel_id].players);

      const A = metadata[e.msg.channel_id].players[players_nickname[0]];
      const B = metadata[e.msg.channel_id].players[players_nickname[1]];

      await this.send(e, {
        msg_id: e.msg.id,
        content:
          `本群游戏开始\n` +
          `${A}棋:${metadata[e.msg.channel_id].nickname[players_nickname[0]]}\n` +
          `${B}棋:${metadata[e.msg.channel_id].nickname[players_nickname[1]]}\n` +
          `黑棋先手\n` +
          `其他成员发送“${prefix}加入国际象棋黑/白”加入队伍中`
      });

      metadata[e.msg.channel_id].current = '黑';
      await this.newgame(e);
    }
    if (players >= 2 && emsg[0]) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = emsg[0];

      await this.send(e, {
        msg_id: e.msg.id,
        content: `玩家${e.msg.author.username}加入队伍“${emsg[0]}”`
      });
      return true;
    }
  }

  /**
   * 游戏指令
   */
  async game(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    if (!metadata[e.msg.channel_id] || !metadata[e.msg.channel_id].game) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `国际象棋未开始，发送：“${prefix}国际象棋”发起游戏`
      });
      return false;
    }

    // 判断玩家是否在游戏中
    const team = metadata[e.msg.channel_id].players[e.msg.author.id];
    if (!team) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `你还没加入游戏，可发送”${prefix}加入国际象棋黑/白“加入队伍中`
      });

      return false;
    }
    // console.log("player：" + team)

    // 备份当前布局
    // repent[e.msg.channel_id] = {}
    // repent[e.msg.channel_id] = metadata[e.msg.channel_id]

    // 对方组
    let isAB = '黑白';
    isAB = isAB.replace(new RegExp(team), '');

    // 判断是否可操作
    if (team != metadata[e.msg.channel_id].current) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `当前不是你的回合`
      });

      return false;
    }

    // 0：选择，1：目的地
    let emsg: string | RegExpMatchArray = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim().toUpperCase(); // 大写字母

    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/);

    if (emsg === null) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '指令错误'
      });
      return true;
    }

    // 选择
    const letter1 = emsg[1].charCodeAt(0) - 65; // 转数字 A = 0
    const num1 = emsg[2];
    const tp1 = `${letter1}-${num1}`;

    // 目的地
    const letter2 = emsg[3].charCodeAt(0) - 65; // 转数字 A = 0
    const num2 = emsg[4];
    const tp2 = `${letter2}-${num2}`;
    // console.log(tp1,tp2);

    // 判断移动是否正确
    const iscorrect = await as.Audit(e, [letter1, num1, letter2, num2], tp1, tp2, team, metadata);
    // console.log(iscorrect)
    if (!iscorrect || iscorrect[0] !== true) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `移动不正确`
      });
      return;
    }

    const target = metadata[e.msg.channel_id].chessman[letter1 + '-' + num1];

    // 移动自己的棋子
    if (metadata[e.msg.channel_id].archive[tp1] == team) {
      if (metadata[e.msg.channel_id].chessman[tp2] && metadata[e.msg.channel_id].chessman[tp2] != team) {
        // 清空原本位置，添加新的位置
        metadata[e.msg.channel_id].chessman[tp1] = '空';
        metadata[e.msg.channel_id].chessman[tp2] = target;
        metadata[e.msg.channel_id].archive[tp1] = '0';
        metadata[e.msg.channel_id].archive[tp2] = team;
        metadata[e.msg.channel_id].current = isAB; // 设置组
      }
      // 传入两个tp点
      await this.generate(e, tp1, tp2);
      // 胜利提示
      if (iscorrect[1] === true) {
        await this.send(e, {
          msg_id: e.msg.id,
          content: `恭喜${team}队获得胜利`
        });

        this.over(e);
      }
    } else if (metadata[e.msg.channel_id].archive[tp1] == '0') {
      // 移动空气
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你不能操作棋盘中的空气：' + emsg[1] + emsg[2]
      });
    } else {
      // 移动对方棋子
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你不能操作对方的棋子'
      });
    }
  }

  /**
   * 初始化游戏
   */
  async over(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    metadata[e.msg.channel_id] = {};
    metadata[e.msg.channel_id].chessman = {};
    metadata[e.msg.channel_id].archive = {}; // 双方棋子位置标记
    metadata[e.msg.channel_id].game = false; // 游戏是否正在运行
    metadata[e.msg.channel_id].players = {}; // 参与游戏的玩家
    metadata[e.msg.channel_id].nickname = {}; // 参与游戏的玩家
    metadata[e.msg.channel_id].current = {}; // 当前可操作的玩家
    // metadata[e.msg.channel_id].repent = [] // 当前可操作的玩家
  }

  /**
   * 新游戏
   */
  async newgame(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const data_map1 = [];
    // 遍历numbers，每x个数换一行
    for (var i = 0; i < map.length; i += rows) {
      data_map1.push(map.slice(i, i + rows));
    }

    // 初始化双方棋子
    for (const i in data_map1) {
      for (const j in data_map1[i]) {
        // 前排
        if (i == 0 + '' || i == 1 + '') {
          metadata[e.msg.channel_id].archive[i + '-' + j] = '白';
        } else if (i == 6 + '' || i == 7 + '') {
          // 后排
          metadata[e.msg.channel_id].archive[i + '-' + j] = '黑';
        } else {
          // 空位
          metadata[e.msg.channel_id].archive[i + '-' + j] = '0';
        }
        metadata[e.msg.channel_id].chessman[i + '-' + j] = data_map1[i][j];
      }
    }
    metadata[e.msg.channel_id].game = true;
    this.generate(e);
  }

  /**
   * 发送图片
   */
  async generate(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }, tp1?: string, tp2?: string) {
    let data_map = metadata[e.msg.channel_id].chessman; // 拉取地图数据
    const biaoji = String(Object.values(metadata[e.msg.channel_id].archive)); // 获取双方棋子标记
    let ss: Record<string, any> | string = {}; // 标记框
    let isAB;
    if (metadata[e.msg.channel_id].current === '白') {
      isAB = '黑box';
    } else {
      isAB = '白box';
    }
    // 设置标记框
    if (tp1 && tp2) {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (tp1 == `${i}-${j}` || tp2 == `${i}-${j}`) {
            ss[`${i}-${j}`] = isAB;
          } else {
            ss[`${i}-${j}`] = '0';
          }
        }
      }
    }
    data_map = String(Object.values(data_map)); // 格式化地图
    ss = String(Object.values(ss)); // 格式化标记地图

    /**
     * map 地图
     */
    const data = {
      map: data_map,
      archive: biaoji,
      ishelp: ishelp,
      prefix: prefix,
      鸡鸡地址: cwd,
      ss: ss
    };

    // 使用模板
    const res = this.nunjucks.render(join(__dirname, '../resources/html/国际象棋.html'), data);
    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/国际象棋.html`), res);

    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/国际象棋.html`), 'body', join(process.cwd(), '/runtime/plugins/xiayu-plugin/img/国际象棋.jpg'));
    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), `/runtime/plugins/xiayu-plugin/img/国际象棋.jpg`),
        msg_id: e.msg.id
      });
    }

    ishelp = 'off';
    return true;
  }
}
