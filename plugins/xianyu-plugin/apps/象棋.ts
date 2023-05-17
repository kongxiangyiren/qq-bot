import { join } from 'path';
import panduan from '../model/ChineseChessDecide';
import { mkdirSync, writeFileSync } from 'node:fs';

const as = new panduan();

let cwd = join(__dirname, '../resources/html/');
cwd = cwd.replace(/\\/g, '/');

// 不建议修改
var ishelp = 'off'; // 帮助菜单
var isrollback = 'off'; // 颠倒棋盘
var reg = ['車', '馬', '象', '士', '将', '炮', '兵', '卒', '仕', '相', '帅', '马', '车'];
// const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];

// 可以修改的内容
var prefix = '/'; // 设置指令前缀，可在此设置默认前缀

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 当前可以操作的队伍
 */
var metadata: Record<string, any> = {};
// var metadata = {
//   "591229486": {
//     "chessman": {
//       "0-0": "車",
//       "0-1": "馬",
//       "0-2": "象",
//       "0-3": "士",
//       "0-4": "将",
//       "0-5": "士",
//       "0-6": "象",
//       "0-7": "馬",
//       "0-8": "車",
//       "1-0": "空",
//       "1-1": "空",
//       "1-2": "空",
//       "1-3": "空",
//       "1-4": "空",
//       "1-5": "空",
//       "1-6": "空",
//       "1-7": "空",
//       "1-8": "空",
//       "2-0": "空",
//       "2-1": "炮",
//       "2-2": "空",
//       "2-3": "空",
//       "2-4": "空",
//       "2-5": "空",
//       "2-6": "空",
//       "2-7": "炮",
//       "2-8": "空",
//       "3-0": "兵",
//       "3-1": "空",
//       "3-2": "兵",
//       "3-3": "空",
//       "3-4": "兵",
//       "3-5": "空",
//       "3-6": "兵",
//       "3-7": "空",
//       "3-8": "兵",
//       "4-0": "空",
//       "4-1": "空",
//       "4-2": "空",
//       "4-3": "空",
//       "4-4": "空",
//       "4-5": "空",
//       "4-6": "空",
//       "4-7": "空",
//       "4-8": "空",
//       "5-0": "空",
//       "5-1": "空",
//       "5-2": "空",
//       "5-3": "空",
//       "5-4": "空",
//       "5-5": "空",
//       "5-6": "空",
//       "5-7": "空",
//       "5-8": "空",
//       "6-0": "兵",
//       "6-1": "空",
//       "6-2": "兵",
//       "6-3": "空",
//       "6-4": "兵",
//       "6-5": "空",
//       "6-6": "兵",
//       "6-7": "空",
//       "6-8": "兵",
//       "7-0": "空",
//       "7-1": "炮",
//       "7-2": "空",
//       "7-3": "空",
//       "7-4": "空",
//       "7-5": "空",
//       "7-6": "空",
//       "7-7": "炮",
//       "7-8": "空",
//       "8-0": "空",
//       "8-1": "空",
//       "8-2": "空",
//       "8-3": "空",
//       "8-4": "空",
//       "8-5": "空",
//       "8-6": "空",
//       "8-7": "空",
//       "8-8": "空",
//       "9-0": "車",
//       "9-1": "馬",
//       "9-2": "象",
//       "9-3": "士",
//       "9-4": "将",
//       "9-5": "士",
//       "9-6": "象",
//       "9-7": "馬",
//       "9-8": "車"
//     },
//     "archive": {
//       "0-0": "红",
//       "0-1": "红",
//       "0-2": "红",
//       "0-3": "红",
//       "0-4": "红",
//       "0-5": "红",
//       "0-6": "红",
//       "0-7": "红",
//       "0-8": "红",
//       "1-0": "0",
//       "1-1": "0",
//       "1-2": "0",
//       "1-3": "0",
//       "1-4": "0",
//       "1-5": "0",
//       "1-6": "0",
//       "1-7": "0",
//       "1-8": "0",
//       "2-0": "0",
//       "2-1": "红",
//       "2-2": "0",
//       "2-3": "0",
//       "2-4": "0",
//       "2-5": "0",
//       "2-6": "0",
//       "2-7": "红",
//       "2-8": "0",
//       "3-0": "红",
//       "3-1": "0",
//       "3-2": "红",
//       "3-3": "0",
//       "3-4": "红",
//       "3-5": "0",
//       "3-6": "红",
//       "3-7": "0",
//       "3-8": "红",
//       "4-0": "0",
//       "4-1": "0",
//       "4-2": "0",
//       "4-3": "0",
//       "4-4": "0",
//       "4-5": "0",
//       "4-6": "0",
//       "4-7": "0",
//       "4-8": "0",
//       "5-0": "0",
//       "5-1": "0",
//       "5-2": "0",
//       "5-3": "0",
//       "5-4": "0",
//       "5-5": "0",
//       "5-6": "0",
//       "5-7": "0",
//       "5-8": "0",
//       "6-0": "黑",
//       "6-1": "0",
//       "6-2": "黑",
//       "6-3": "0",
//       "6-4": "黑",
//       "6-5": "0",
//       "6-6": "黑",
//       "6-7": "0",
//       "6-8": "黑",
//       "7-0": "0",
//       "7-1": "黑",
//       "7-2": "0",
//       "7-3": "0",
//       "7-4": "0",
//       "7-5": "0",
//       "7-6": "0",
//       "7-7": "黑",
//       "7-8": "0",
//       "8-0": "0",
//       "8-1": "0",
//       "8-2": "0",
//       "8-3": "0",
//       "8-4": "0",
//       "8-5": "0",
//       "8-6": "0",
//       "8-7": "0",
//       "8-8": "0",
//       "9-0": "黑",
//       "9-1": "黑",
//       "9-2": "黑",
//       "9-3": "黑",
//       "9-4": "黑",
//       "9-5": "黑",
//       "9-6": "黑",
//       "9-7": "黑",
//       "9-8": "黑"
//     },
//     "game": true,
//     "players": {
//       "3147337792": "红",
//       "3501869534": "黑"
//     },
//     "nickname": {
//       "3147337792": "酸菜味老咸鱼",
//       "3501869534": "酸菜味小咸鱼"
//     },
//     "current": "黑"
//   }
// }

// 上一步的地图存档
// var repent = {};

// 初始地图，不可修改
const board = [
  ['車', '馬', '象', '士', '将', '士', '象', '馬', '車'],
  ['空', '空', '空', '空', '空', '空', '空', '空', '空'],
  ['空', '炮', '空', '空', '空', '空', '空', '炮', '空'],
  ['兵', '空', '兵', '空', '兵', '空', '兵', '空', '兵'],
  ['空', '空', '空', '空', '空', '空', '空', '空', '空'],
  ['空', '空', '空', '空', '空', '空', '空', '空', '空'],
  ['兵', '空', '兵', '空', '兵', '空', '兵', '空', '兵'],
  ['空', '炮', '空', '空', '空', '空', '空', '炮', '空'],
  ['空', '空', '空', '空', '空', '空', '空', '空', '空'],
  ['車', '馬', '象', '士', '将', '士', '象', '馬', '車']
];

const rows = 9; // 棋盘宽度
const cols = 10; // 棋盘高度
// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?(发起|加入)中国象棋[黑红]?$`,
        /** 执行方法 */
        fnc: 'LaunchGame',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?结束中国象棋$`,
        /** 执行方法 */
        fnc: 'ov',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?移子.*$`,
        /** 执行方法 */
        fnc: 'game',
        priority: 5000,
        describe: '描述'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${reg.join('|')}).*[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]$`,
        /** 执行方法 */
        fnc: 'game',
        priority: 5000,
        describe: '描述'
      }
    ]);
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
        content: `中国象棋未开始，发送：“${prefix}发起中国象棋”发起游戏`
      });
      return false;
    }
    // await beifen(e)
    // 判断玩家是否在游戏中
    const team = metadata[e.msg.channel_id].players[e.msg.author.id];
    if (!team) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `你还没加入游戏，可发送”${prefix}加入中国象棋黑/白“加入队伍中`
      });

      return;
    }
    // console.log("player：" + team)

    // 对方组
    let isAB = '黑红';
    isAB = isAB.replace(new RegExp(team), '');

    // 判断是否可操作
    if (team != metadata[e.msg.channel_id].current) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `当前不是你的回合`
      });

      return;
    }

    let tp1, tp2;

    // 0：选择，1：目的地
    let emsg: string | RegExpMatchArray = e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()

      .toUpperCase(); // 大写字母
    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/);
    if (!emsg) {
      const iszh_cn = await as.Chineseinstructions(e, e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim(), metadata);
      if (!iszh_cn) {
        return await this.send(e, {
          msg_id: e.msg.id,
          content: '指令不正确'
        });
      } else {
        // console.log(iszh_cn)

        var [letter1, num1, letter2, num2] = iszh_cn;
        // 选择
        tp1 = `${letter1}-${num1}`;
        // 目的地
        tp2 = `${letter2}-${num2}`;
      }
    } else {
      // 选择
      var letter1 = emsg[1].charCodeAt(0) - 65 + ''; // 转数字 A = 0
      var num1 = emsg[2];
      tp1 = `${letter1}-${num1}`;

      // 目的地
      var letter2 = emsg[3].charCodeAt(0) - 65 + ''; // 转数字 A = 0
      var num2 = emsg[4];
      tp2 = `${letter2}-${num2}`;
    }

    // console.log('+++++',letter1,num1,letter2,num2,'+++++',tp1,tp2,team)

    // 判断移动是否正确
    const iscorrect = await as.Audit(e, [letter1, num1, letter2, num2], tp1, tp2, team, metadata);
    // console.log(iscorrect)
    if (!iscorrect || iscorrect[0] !== true) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: `移动不正确`
      });

      return true;
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
      return true;
    } else {
      // 移动对方棋子
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你不能操作对方的棋子'
      });
      return true;
    }
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
      let isAB = '黑红';
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
      .match(/[黑红]/);
    const players = Object.values(metadata[e.msg.channel_id].players).length;
    // console.log(players);

    // 判断是否在游戏内
    if (metadata[e.msg.channel_id].players[e.msg.author.id]) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你已加入游戏，队伍：' + metadata[e.msg.channel_id].players[e.msg.author.id]
      });

      return;
    }

    // 判断是玩家几
    if (players == 0) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = '红';
      await this.send(e, {
        msg_id: e.msg.id,
        content: `玩家${e.msg.author.username}发起了中国象棋，其他成员可发送“${prefix}加入中国象棋”加入游戏`
      });
    }
    if (players == 1) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = '黑';

      const players_nickname = Object.keys(metadata[e.msg.channel_id].players);

      const A = metadata[e.msg.channel_id].players[players_nickname[0]];
      const B = metadata[e.msg.channel_id].players[players_nickname[1]];

      await this.send(e, {
        msg_id: e.msg.id,
        content:
          `本群游戏开始\n` +
          `${A}棋:${metadata[e.msg.channel_id].nickname[players_nickname[0]]}\n` +
          `${B}棋:${metadata[e.msg.channel_id].nickname[players_nickname[1]]}\n` +
          `红棋先手\n` +
          `其他成员发送“${prefix}加入中国象棋黑/红”加入队伍中`
      });

      metadata[e.msg.channel_id].current = '红';
      await this.newgame(e);
    }
    if (players >= 2 && emsg[0]) {
      metadata[e.msg.channel_id].nickname[e.msg.author.id] = e.msg.author.username;
      metadata[e.msg.channel_id].players[e.msg.author.id] = emsg[0];

      await this.send(e, {
        msg_id: e.msg.id,
        content: `玩家${e.msg.author.username}加入队伍“${emsg[0]}”`
      });
    }
  }

  /**
   * 新游戏
   */
  async newgame(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 初始化双方棋子
    for (const i in board) {
      for (const j in board[i]) {
        if (Number(i) < 4 && board[i][j] !== '空') {
          // 前排
          metadata[e.msg.channel_id].archive[i + '-' + j] = '红';
        } else if (Number(i) > 5 && board[i][j] !== '空') {
          // 后排
          metadata[e.msg.channel_id].archive[i + '-' + j] = '黑';
        } else {
          // 空位
          metadata[e.msg.channel_id].archive[i + '-' + j] = '0';
        }
        // 地图
        metadata[e.msg.channel_id].chessman[i + '-' + j] = board[i][j];
      }
    }
    // 开始游戏
    metadata[e.msg.channel_id].game = true;
    this.generate(e);
  }

  /**
   * 发送图片
   */
  async generate(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }, tp1?: string, tp2?: string) {
    let data_map = metadata[e.msg.channel_id].chessman; // 拉取地图数据
    let biaoji: string | unknown[] = Object.values(metadata[e.msg.channel_id].archive); // 获取双方棋子标记
    let ss: Record<string, any> | string = {}; // 标记框
    let isAB;

    if (metadata[e.msg.channel_id].current === '红') {
      isAB = '黑box';
    } else {
      isAB = '红box';
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
    ss = Object.values(ss);
    biaoji = Object.values(biaoji);
    data_map = Object.values(data_map);
    // 颠倒棋盘
    if (metadata[e.msg.channel_id].current === '红') {
      data_map = data_map.reverse();
      biaoji = biaoji.reverse();
      ss = ss.reverse();

      isrollback = 'on';
    }

    data_map = String(data_map); // 格式化地图
    // console.log(data_map);
    biaoji = String(biaoji);
    // console.log(biaoji);
    ss = String(ss); // 格式化地图

    /**
     * map 地图
     */
    const data = {
      map: data_map,
      ishelp: ishelp,
      archive: biaoji,
      prefix: prefix,
      isrollback: isrollback,
      鸡鸡地址: cwd,
      ss: ss
    };
    // 使用模板
    const res = this.nunjucks.render(join(__dirname, '../resources/html/象棋.html'), data);
    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/象棋.html`), res);

    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/象棋.html`), 'body', join(process.cwd(), '/runtime/plugins/xiayu-plugin/img/象棋.jpg'));

    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), `/runtime/plugins/xiayu-plugin/img/象棋.jpg`),
        msg_id: e.msg.id
      });
    }

    ishelp = 'off';
    isrollback = 'off';
    return true;
  }

  /**
   * 初始化游戏
   */
  async over(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    metadata[e.msg.channel_id] = {}; // 创建群数据
    metadata[e.msg.channel_id].chessman = {}; // 渲染后地图
    metadata[e.msg.channel_id].archive = {}; // 双方棋子位置标记
    metadata[e.msg.channel_id].game = false; // 游戏是否正在运行
    metadata[e.msg.channel_id].players = {}; // 参与游戏的玩家
    metadata[e.msg.channel_id].nickname = {}; // 参与游戏的玩家昵称
    metadata[e.msg.channel_id].current = {}; // 当前可操作的玩家
  }
}
