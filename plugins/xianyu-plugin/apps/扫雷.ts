import { mkdirSync, writeFileSync } from 'fs';

import { join } from 'path';

const prefix = '/'; // 设置指令前缀，可在此设置默认前缀
const gamemap: Record<string, any> = {};

/* gamemap中存储的数据
  mines = {} // 标记雷：{1-1：true}
  isopen = {} // 标记翻开：{1-1：true}
  archive = {} // 标记值：{1-1：1}
  game = false // 游戏是否正在运行
  z = 10 // 雷数量
  rows = 9 // 横
  cols = 9 // 竖
  mun = [] // 左上角显示雷数量
  data_map1 = [] // 添加数字后的地图数据
  mark = {} // 标记样式
  player = QQ // 游戏发起人
*/

const c = 768; // 总宽度760px多一点点
let ishelp = 'off'; // 帮助菜单
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 显示的字母
// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: `^(${prefix})?扫雷(帮助|菜单|说明)$`,
        fnc: 'help',
        priority: 5000,
        describe: 'help'
      },
      {
        reg: `^(${prefix})?扫雷$`,
        fnc: 'goo',
        priority: 5000,
        describe: 'goo'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?扫雷难度(:|：)?.+$`,
        /** 执行方法 */
        fnc: 'goolevel',
        priority: 5000,
        describe: 'goolevel'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?结束扫雷$`,
        /** 执行方法 */
        fnc: 'ov',
        priority: 5000,
        describe: 'ov'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?翻开([a-zA-Z]{1}[0-9]+){1,}$`,
        /** 执行方法 */
        fnc: 'gooplye',
        priority: 5000,
        describe: 'gooplye'
      },
      {
        /** 命令正则匹配 */
        reg: `^(${prefix})?标记([a-zA-Z]{1}[0-9]+){1,}$`,
        /** 执行方法 */
        fnc: 'mark',
        priority: 5000,
        describe: 'mark'
      },
      {
        /** 命令正则匹配 */
        reg: `^/(${prefix})?取消标记([a-zA-Z]{1}[0-9]+){1,}$`,
        /** 执行方法 */
        fnc: 'removemark',
        priority: 5000,
        describe: 'removemark'
      },

      {
        /** 命令正则匹配 */
        reg: `^/扫雷设置(地?雷数量?|布局|初始化).*$`,
        /** 执行方法 */
        fnc: 'setup',
        priority: 5000,
        describe: 'setup'
      }
    ]);
  }

  /**
   * 游戏设置
   */
  async setup(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    if (gamemap[e.msg.channel_id].game)
      return this.send(e, {
        msg_id: e.msg.id,
        content: `游戏已开始，不可设置`
      });
    if (/^\/扫雷设置地?雷数量?\d+/.test(e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim())) {
      const emsg = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim().match(/\d+/);
      if (+emsg[0] > +gamemap[e.msg.channel_id].rows * +gamemap[e.msg.channel_id].cols)
        return this.send(e, {
          msg_id: e.msg.id,
          content: `设置超出阈值`
        });
      gamemap[e.msg.channel_id].z = emsg[0] ? emsg[0] : 10;
      await this.send(e, {
        msg_id: e.msg.id,
        content: '修改雷数：' + gamemap[e.msg.channel_id].z
      });
    }

    if (/^\/扫雷设置布局 ?\d+\s\d+(\s\d+)?/.test(e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim())) {
      const emsg = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim().match(/\d+/g);
      if (+emsg[0] > 1000 || +emsg[1] > 26 || +emsg[2] > +emsg[0] * +emsg[1])
        return this.send(e, {
          msg_id: e.msg.id,
          content: `设置超出阈值`
        });
      gamemap[e.msg.channel_id].z = emsg[2] ? emsg[2] : 10;
      gamemap[e.msg.channel_id].rows = emsg[0] ? emsg[0] : 9;
      gamemap[e.msg.channel_id].cols = emsg[1] ? emsg[1] : 9;
      await this.send(e, {
        msg_id: e.msg.id,
        content: `修改布局\n宽：${gamemap[e.msg.channel_id].rows}\n高：${gamemap[e.msg.channel_id].cols}\n雷：${gamemap[e.msg.channel_id].z}`
      });
    }
    if (/^\/扫雷设置布局初始化/.test(e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim())) {
      gamemap[e.msg.channel_id].z = 10;
      gamemap[e.msg.channel_id].rows = 9;
      gamemap[e.msg.channel_id].cols = 9;
      await this.send(e, {
        msg_id: e.msg.id,
        content: `初始化布局\n宽：${gamemap[e.msg.channel_id].rows}\n高：${gamemap[e.msg.channel_id].cols}\n雷：${gamemap[e.msg.channel_id].z}`
      });
    }

    return true;
  }

  async help(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();
    ishelp = 'open';
    await this.generate(e);
    return true;
  }

  /**
   * 开始游戏
   */
  goo(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();
    this.goo2(e);
    return true;
  }

  /**
   * 设置难度
   */
  async goolevel(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    if (gamemap[e.msg.channel_id].game) return this.send(e, { msg_id: e.msg.id, content: `游戏已开始，发送“${prefix}扫雷”查看当前状态` });
    const emsg = e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()

      .replace(new RegExp(`^(${prefix})?扫雷难度(:|：)?`), '');
    switch (emsg) {
      case '简单':
        gamemap[e.msg.channel_id].z = 10;
        gamemap[e.msg.channel_id].rows = 10;
        gamemap[e.msg.channel_id].rows = 9;
        gamemap[e.msg.channel_id].cols = 9;
        break;
      case '困难':
        gamemap[e.msg.channel_id].z = 60;
        gamemap[e.msg.channel_id].rows = 26;
        gamemap[e.msg.channel_id].cols = 26;
        break;
      case '中等':
        gamemap[e.msg.channel_id].z = 40;
        gamemap[e.msg.channel_id].rows = 16;
        gamemap[e.msg.channel_id].cols = 16;
        break;
      default:
        break;
    }
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();
    this.goo2(e);

    return true;
  }

  /**
   * 结束游戏
   */
  async ov(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);

    // 1	全体成员
    // 2	管理员
    // 4	群主/创建者
    // 5	子频道管理员
    // 没有权限
    if (gamemap[e.msg.channel_id].player == e.msg.author.id || e.msg.member.roles.includes('4')) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '已结束扫雷游戏'
      });

      this.over(e);
    } else {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '你不是游戏发起人，不能主动结束游戏'
      });

      return true;
    }
    return true;
  }

  /**
   * 标记
   */
  async mark(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    if (!gamemap[e.msg.channel_id].game) return false;
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();

    e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()
      .match(/([a-zA-Z])(\d+)/g)
      .forEach(v => {
        // 获取坐标
        // emsg[1]为字母，emsg[2]为数字
        const emsg = v.match(/([a-zA-Z])(\d+)/);
        let letter = emsg[1].toUpperCase(); // 大写字母
        letter = letter.charCodeAt(0) - 65 + ''; // 转数字 A = 0

        const axis = `${letter}-${emsg[2]}`;

        // 判断坐标是否存在
        if (gamemap[e.msg.channel_id].archive[axis]) {
          // 判断坐标是否显示
          if (!gamemap[e.msg.channel_id].isopen[axis]) {
            gamemap[e.msg.channel_id].mark[axis] = true;
            console.log('标记了：' + axis, emsg[1] + emsg[2], gamemap[e.msg.channel_id].mark[axis]);
          }
        }
      });
    this.generate(e);
    return true;
  }

  /**
   * 游戏指令
   */
  async gooplye(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    if (!gamemap[e.msg.channel_id].game) return false;
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();

    /**
     * 玩家点击 A1 获得坐标 01
     * 判断 ‘标记雷’ 点击的是否为雷 -> 结束游戏
     * 判断 ‘标记翻开’ 得到剩余数量与雷数量是否一致，一致则胜利 -> 结束游戏
     * 判断 ‘添加数字后的地图数据’ 是否为‘-’，扩散显示，遇到数字停下
     */

    let gameover = false;
    let outcome = '';
    let kk = 0;

    // 获取坐标
    // emsg[1]为字母，emsg[2]为数字
    e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()
      .match(/([a-zA-Z])(\d+)/g)
      .forEach(v => {
        const emsg = v.match(/([a-zA-Z])(\d+)/);
        let letter = emsg[1].toUpperCase(); // 大写字母
        letter = letter.charCodeAt(0) - 65 + ''; // 转数字 A = 0

        const axis = `${letter}-${emsg[2]}`;
        console.log('获取坐标' + axis);

        // 判断坐标是否存在
        if (gamemap[e.msg.channel_id].archive[axis]) {
          // 判断雷
          if (gamemap[e.msg.channel_id].mines[axis]) {
            gamemap[e.msg.channel_id].archive[axis] = 'x';
            gamemap[e.msg.channel_id].isopen[axis] = true;
            gameover = true;
            outcome = 'fail';
            return;
          }

          // 扩散显示
          // 当前位置
          const indexs = axis.split('-');

          if (gamemap[e.msg.channel_id].archive[axis] === '0') {
            const loop = (indexs: (string | number)[]) => {
              [
                [+indexs[0] - 1, +indexs[1] - 1],
                [+indexs[0] - 1, +indexs[1]],
                [+indexs[0] - 1, +indexs[1] + 1],
                [+indexs[0], +indexs[1] - 1],
                [+indexs[0], +indexs[1] + 1],
                [+indexs[0] + 1, +indexs[1] - 1],
                [+indexs[0] + 1, +indexs[1]],
                [+indexs[0] + 1, +indexs[1] + 1]
              ].forEach(subIndexs => {
                // console.log('subIndexs:',subIndexs);
                const el = gamemap[e.msg.channel_id].archive[subIndexs.join('-')];
                // console.log('el:',el);
                if (el) {
                  const thisel = gamemap[e.msg.channel_id].mark[subIndexs.join('-')];

                  // 值为’-‘开始扩散
                  if (el === '0' && gamemap[e.msg.channel_id].isopen[subIndexs.join('-')] === false) {
                    if (thisel !== true) {
                      // 没被标记显示
                      gamemap[e.msg.channel_id].isopen[subIndexs.join('-')] = true;
                      ++kk;
                      loop(subIndexs);
                    }
                  } else {
                    if (thisel !== true) {
                      // 没被标记显示
                      gamemap[e.msg.channel_id].isopen[subIndexs.join('-')] = true;
                    }
                  }
                }
              });
            };
            loop(indexs);
          }
          // 显示指定坐标块
          gamemap[e.msg.channel_id].isopen[axis] = true;
        }
      });
    console.log('本次循环' + kk + '次');
    if (outcome == 'fail') {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '踩雷，游戏结束'
      });
    }
    // 判断胜利
    if (+gamemap[e.msg.channel_id].rows * +gamemap[e.msg.channel_id].cols - Object.values(gamemap[e.msg.channel_id].isopen).filter(v => v).length == gamemap[e.msg.channel_id].z) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '恭喜您成功了'
      });

      gameover = true;
    }
    this.generate(e);
    if (gameover) {
      this.over(e);
    }

    return true;
  }

  /**
   * 取消标记
   */
  async removemark(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 私聊禁用
    if (e.eventType === 'DIRECT_MESSAGE_CREATE') {
      return;
    }
    this.newgame(e);
    if (!gamemap[e.msg.channel_id].game) return false;
    gamemap[e.msg.channel_id].command = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').trim();

    e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .trim()
      .match(/([a-zA-Z])(\d+)/g)
      .forEach(v => {
        // 获取坐标
        // emsg[1]为字母，emsg[2]为数字
        const emsg = v.match(/([a-zA-Z])(\d+)/);
        let letter = emsg[1].toUpperCase(); // 大写字母
        letter = letter.charCodeAt(0) - 65 + ''; // 转数字 A = 0

        const axis = `${letter}-${emsg[2]}`;
        // console.log('获取坐标' + axis);

        // 判断坐标是否存在
        if (gamemap[e.msg.channel_id].archive[axis]) {
          // 判断坐标是否显示
          if (!gamemap[e.msg.channel_id].isopen[axis]) {
            gamemap[e.msg.channel_id].mark[axis] = false;
          }
        }
      });
    this.generate(e);
    return true;
  }

  /**
   * 初始化游戏
   */
  newgame(e: { eventType: typeof QQBot.eventType; msg?: typeof QQBot.IMessage2 }) {
    if (!gamemap[e.msg.channel_id]) {
      gamemap[e.msg.channel_id] = {};
      gamemap[e.msg.channel_id].mines = {}; // 标记雷：{1-1：true}
      gamemap[e.msg.channel_id].isopen = {}; // 标记翻开：{1-1：true}
      gamemap[e.msg.channel_id].archive = {}; // 标记值：{1-1：1}
      gamemap[e.msg.channel_id].game = false; // 游戏是否正在运行
      gamemap[e.msg.channel_id].z = 10; // 雷数量
      gamemap[e.msg.channel_id].rows = 9; // 横
      gamemap[e.msg.channel_id].cols = 9; // 竖
      gamemap[e.msg.channel_id].mun = []; // 左上角显示雷数量
      gamemap[e.msg.channel_id].data_map1 = []; // 添加数字后的地图数据
      gamemap[e.msg.channel_id].mark = {}; // 标记样式
      gamemap[e.msg.channel_id].player = e.msg.author.id; // 游戏发起人
      gamemap[e.msg.channel_id].command = ''; // 当前指令
    }
  }

  /**
   * 重置游戏
   */
  async over(e: { eventType: typeof QQBot.eventType; msg?: typeof QQBot.IMessage2 }) {
    gamemap[e.msg.channel_id].mines = {}; // 标记雷：{1-1：true}
    gamemap[e.msg.channel_id].isopen = {}; // 标记翻开：{1-1：true}
    gamemap[e.msg.channel_id].archive = {}; // 标记值：{1-1：1}
    gamemap[e.msg.channel_id].game = false; // 游戏是否正在运行
    gamemap[e.msg.channel_id].mun = []; // 左上角显示雷数量
    gamemap[e.msg.channel_id].data_map1 = []; // 添加数字后的地图数据
  }

  /**
   * 发送图片
   */
  async generate(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // console.log('地图' + data_map1)
    // console.log('雷' + mun)
    // console.log('值' , archive)
    // console.log('标记' ,isopen)

    /**
     * 0：翻开空
     * 1-8：雷数量
     * 9：雷
     * -：未翻开
     * +：标记
     * x：踩中的雷
     */

    const data_map: unknown[] = []; // 输出的地图
    const val = Object.values(gamemap[e.msg.channel_id].archive);
    // console.log(val)
    let a = +gamemap[e.msg.channel_id].z; // 输出的地雷数量

    const mark1 = Object.values(gamemap[e.msg.channel_id].mark); // 标记的坐标
    // console.log(gamemap[e.msg.channel_id].archive);
    // console.log(gamemap[e.msg.channel_id].mark);
    // console.log(gamemap[e.msg.channel_id].isopen);

    // 遍历翻开
    Object.values(gamemap[e.msg.channel_id].isopen).forEach((el, index) => {
      if (el) {
        // 显示翻开
        data_map.push(val[index]);
      } else if (mark1[index]) {
        a = a - 1;
        data_map.push('+');
      } else {
        data_map.push('-');
      }
    });

    // 创建地图数组
    const map = String(data_map);
    // console.log(map);

    /**
     * map 地图
     * headurl 右上角头像
     * l 左上角雷数量
     * x 宽度
     * c 画布尺寸
     * muns 地图中显示的数字
     * ishelp 是否为帮助
     * prefix 前缀，帮助中使用
     * command 当前指令
     */
    const data = {
      map: map,
      headurl: e.msg.author.avatar,
      l: a,
      x: gamemap[e.msg.channel_id].rows,
      c: c,
      muns: gamemap[e.msg.channel_id].mun,
      ishelp: ishelp,
      prefix: prefix,
      command: gamemap[e.msg.channel_id].command
    };
    // 使用模板
    const res = this.nunjucks.render(join(__dirname, '../resources/html/扫雷.html'), data);
    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/扫雷.html`), res);

    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/xiayu-plugin/html/扫雷.html`), 'body', join(process.cwd(), '/runtime/plugins/xiayu-plugin/img/扫雷.jpg'));
    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), `/runtime/plugins/xiayu-plugin/img/扫雷.jpg`),
        msg_id: e.msg.id
      });
    }

    ishelp = 'off';

    return true;
  }

  async goo2(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    /**
     * 开始游戏
     * 生成随机地图
     * 生成各类坐标
     *
     * 输出
     * 标记雷：{1-1：true}
     * 标记翻开：{1-1：true}
     * 标记样式：{1-1：true}
     * 标记值：{1-1：1}
     *
     * 输出无误设置游戏状态
     * game = true
     */

    if (gamemap[e.msg.channel_id].game) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '扫雷游戏已经开始'
      });

      this.generate(e);
      return true;
    }

    var data_map = []; // 雷数据

    // 生成x*y个字符，值为'-'，表示未翻开
    var numbers = Array.from({ length: +gamemap[e.msg.channel_id].rows * +gamemap[e.msg.channel_id].cols }, () => '0');

    // 随机替换z个数字为9，表示雷
    const indexes: number[] = [];
    while (indexes.length < gamemap[e.msg.channel_id].z) {
      var index = Math.floor(Math.random() * +gamemap[e.msg.channel_id].rows * +gamemap[e.msg.channel_id].cols);
      if (!indexes.includes(index)) {
        indexes.push(index);
        numbers[index] = 9 + '';
      }
    }
    // 遍历numbers，每rows个数换一行
    for (var i = 0; i < numbers.length; i += +gamemap[e.msg.channel_id].rows) {
      data_map.push(numbers.slice(i, i + +gamemap[e.msg.channel_id].rows));
    }

    /**
     * 添加坐标，标记雷
     * 设置玩家看到的样式，是否翻开
     * 设置标记
     * 设置显示的坐标
     */
    for (let i = 0; i < +gamemap[e.msg.channel_id].cols; i++) {
      for (let j = 0; j < +gamemap[e.msg.channel_id].rows; j++) {
        // 标记雷
        if (data_map[i][j] == 9 + '') {
          gamemap[e.msg.channel_id].mines[i + '-' + j] = true;
        } else {
          gamemap[e.msg.channel_id].mines[i + '-' + j] = false;
        }

        // 设置样式是否翻开
        gamemap[e.msg.channel_id].isopen[i + '-' + j] = false;

        // 设置标记
        gamemap[e.msg.channel_id].mark[i + '-' + j] = false;

        // 设置显示的坐标
        gamemap[e.msg.channel_id].mun.push(ABC[i] + j);
      }
    }
    // 实际雷数量
    console.log(Object.values(gamemap[e.msg.channel_id].mines).filter(v => v).length);

    for (let i = 0; i < gamemap[e.msg.channel_id].cols; i++) {
      for (let j = 0; j < gamemap[e.msg.channel_id].rows; j++) {
        const isMines = gamemap[e.msg.channel_id].mines[i + '-' + j];
        const number = Object.values({
          0: gamemap[e.msg.channel_id].mines[`${i - 1}-${j - 1}`],
          1: gamemap[e.msg.channel_id].mines[`${i - 1}-${j}`],
          2: gamemap[e.msg.channel_id].mines[`${i - 1}-${j + 1}`],
          3: gamemap[e.msg.channel_id].mines[`${i}-${j - 1}`],
          4: gamemap[e.msg.channel_id].mines[`${i}-${j + 1}`],
          5: gamemap[e.msg.channel_id].mines[`${i + 1}-${j - 1}`],
          6: gamemap[e.msg.channel_id].mines[`${i + 1}-${j}`],
          7: gamemap[e.msg.channel_id].mines[`${i + 1}-${j + 1}`]
        }).filter(v => v).length;
        if (isMines) {
          gamemap[e.msg.channel_id].archive[i + '-' + j] = 9;
          gamemap[e.msg.channel_id].data_map1.push(9);
        } else {
          gamemap[e.msg.channel_id].archive[i + '-' + j] = number ? number : '0';
          gamemap[e.msg.channel_id].data_map1.push(number ? number : '-');
        }
      }
    }
    // 上帝地图
    console.log(gamemap[e.msg.channel_id].archive);
    gamemap[e.msg.channel_id].mun = String(gamemap[e.msg.channel_id].mun);
    this.generate(e);
    gamemap[e.msg.channel_id].game = true;
  }
}
