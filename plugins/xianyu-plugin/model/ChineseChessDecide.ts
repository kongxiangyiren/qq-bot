// const rows = 9; // 棋盘宽度
const cols = 10; // 棋盘高度

export default class panduan {
  /**
   * @param {Object} e 机器人参数
   * @param {Array} emsg 所有的坐标
   * @param {String} tp1 选择坐标
   * @param {String} tp2 目的地坐标
   * @param {String} team 玩家组
   * @param {Object} metadata 游戏全部内容
   * @returns 判断棋子移动是否正确和是否胜利，返回数组[true,true]
   */
  async Audit(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }, emsg: any[], tp1: string, tp2: string, team: string | RegExp, metadata: Record<string, any>) {
    try {
      // 目的地是否为自己棋子
      if (metadata[e.msg.channel_id].archive[tp2] == team) return false;

      // 获取选择的棋子信息
      const A = metadata[e.msg.channel_id].chessman[tp1];
      console.log(emsg, tp1, tp2, team, A);
      // console.log(A)

      // 对方组
      let isAB = '黑红';
      isAB = isAB.replace(new RegExp(team), '');

      // 重定义坐标
      const x1 = parseInt(emsg[1]) || 0;
      const x2 = parseInt(emsg[3]) || 0;
      const y1 = parseInt(emsg[0]) || 0;
      const y2 = parseInt(emsg[2]) || 0;
      console.log('x:', x1, x2, y1, y2);

      // 胜利判断
      let isok = false;

      // 棋子判断部分
      if (A == '車') {
        let tp; // 坐标
        // 判断目的地方向
        if (y2 == y1 && x2 < x1) {
          console.log('往左');
          tp = 0;
        }
        if (y2 == y1 && x2 > x1) {
          console.log('往右');
          tp = 1;
        }
        if (y2 < y1 && x2 == x1) {
          console.log('往上');
          tp = 2;
        }
        if (y2 > y1 && x2 == x1) {
          console.log('往下');
          tp = 3;
        }

        for (let i = 1; i < cols + 1; i++) {
          const tps = [`${y1}-${x1 - i}`, `${y1}-${x1 + i}`, `${y1 - i}-${x1}`, `${y1 + i}-${x1}`];
          const ev = tps[tp];
          // console.log(tp)
          // 此块存在
          if (metadata[e.msg.channel_id].chessman[ev]) {
            // 目的地判断
            if (ev == tp2) {
              // 是目的地
              // 目的地不为自己
              if (metadata[e.msg.channel_id].archive[ev] !== team) {
                isok = true;
                break;
              } else {
                break;
              }
            } else {
              // 不是目的地
              if (metadata[e.msg.channel_id].chessman[ev] !== '空') {
                break;
              }
            }
          }
        }
      }

      if (A == '馬') {
        // 可移动位置
        const tps = [
          `${+y1 + 2}-${+x1 - 1}`,
          `${+y1 + 2}-${+x1 + 1}`,
          `${+y1 + 1}-${+x1 - 2}`,
          `${+y1 + 1}-${+x1 + 2}`,
          `${+y1 - 1}-${+x1 - 2}`,
          `${+y1 - 1}-${+x1 + 2}`,
          `${+y1 - 2}-${+x1 - 1}`,
          `${+y1 - 2}-${+x1 + 1}`
        ];
        // 绊脚棋子
        const p = [`${+y1 + 1}-${x1}`, `${+y1 + 1}-${x1}`, `${+y1}-${+x1 - 1}`, `${+y1}-${+x1 + 1}`, `${+y1}-${+x1 - 1}`, `${+y1}-${+x1 + 1}`, `${+y1 - 1}-${+x1}`, `${+y1 - 1}-${+x1}`];
        tps.forEach((ev, index) => {
          if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
            if (metadata[e.msg.channel_id].chessman[p[index]] && metadata[e.msg.channel_id].chessman[p[index]] === '空') {
              console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
              isok = true;
            }
          }
        });
      }

      if (A == '象') {
        const tps = [`${+y1 - 2}-${+x1 - 2}`, `${+y1 - 2}-${+x1 + 2}`, `${+y1 + 2}-${+x1 - 2}`, `${+y1 + 2}-${+x1 + 2}`];
        // 绊脚棋子
        const p = [`${+y1 - 1}-${+x1 - 1}`, `${+y1 - 1}-${+x1 + 1}`, `${+y1 + 1}-${+x1 - 1}`, `${+y1 + 1}-${+x1 + 1}`];

        tps.forEach((ev, index) => {
          if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
            if (metadata[e.msg.channel_id].chessman[p[index]] && metadata[e.msg.channel_id].chessman[p[index]] === '空') {
              console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
              isok = true;
            }
          }
        });
      }

      if (A == '士') {
        const tps = [`${+y1 - 1}-${+x1 - 1}`, `${+y1 - 1}-${+x1 + 1}`, `${+y1 + 1}-${+x1 - 1}`, `${+y1 + 1}-${+x1 + 1}`];
        tps.forEach(ev => {
          if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
            let p;
            if (team === '红') {
              p = ['0-3', '0-5', '1-4', '2-3', '2-5'];
            } else {
              p = ['7-3', '7-5', '8-4', '9-3', '9-5'];
            }
            p.forEach(ev1 => {
              if (tp2 === ev1) {
                console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
                isok = true;
              }
            });
          }
        });
      }

      if (A == '将') {
        const tps = [`${+y1 - 1}-${x1}`, `${+y1 + 1}-${x1}`, `${y1}-${+x1 - 1}`, `${y1}-${+x1 + 1}`];
        // 定义活动区域
        let p;

        tps.forEach(ev => {
          if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
            if (team === '红') {
              p = ['0-3', '0-4', '0-5', '1-3', '1-4', '1-5', '2-3', '2-4', '2-5'];
            } else {
              p = ['7-3', '7-4', '7-5', '8-3', '8-4', '8-5', '9-3', '9-4', '9-5'];
            }
            p.forEach(ev1 => {
              if (tp2 === ev1) {
                console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
                isok = true;
              }
            });
          }
        });

        // 循环完之后依旧是false，可能是飞将
        if (isok == false && metadata[e.msg.channel_id].chessman[tp2] === '将' && x1 == x2) {
          let t = 0;
          if (team === '红') {
            for (let i = +y1 + 1; i < cols; i++) {
              if (metadata[e.msg.channel_id].chessman[`${i}-${x1}`] !== '空') {
                ++t;
              }
            }
          } else {
            for (let i = +y1 - 1; i < cols; i = i - 1) {
              if (metadata[e.msg.channel_id].chessman[`${i}-${x1}`] !== '空') {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ++t;
              }
            }
          }
          // if (t == 0) isok == true
        }
      }

      if (A == '兵') {
        // 先判断是否过河
        if (team === '红' && +y1 < 5 && +y1 + 1 == y2 && x1 == x2 && metadata[e.msg.channel_id].archive[tp2] != team) {
          isok = true;
        }
        if (team === '黑' && +y1 > 4 && +y1 - 1 == y2 && x1 == x2 && metadata[e.msg.channel_id].archive[tp2] != team) {
          isok = true;
        }

        let tps;
        // 过河后不能倒退
        if (team == '红' && +y1 > 4) {
          tps = [`${+y1 + 1}-${x1}`, `${y1}-${+x1 - 1}`, `${y1}-${+x1 + 1}`];
        } else if (team === '黑' && +y1 < 5) {
          tps = [`${+y1 - 1}-${x1}`, `${y1}-${+x1 - 1}`, `${y1}-${+x1 + 1}`];
        }
        if (tps) {
          tps.forEach(ev => {
            if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
              console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
              isok = true;
            }
          });
        }
      }

      if (A == '炮') {
        let tp; // 坐标
        // 判断目的地方向
        if (y2 == y1 && x2 < x1) {
          console.log('往左');
          tp = 0;
        }
        if (y2 == y1 && x2 > x1) {
          console.log('往右');
          tp = 1;
        }
        if (y2 < y1 && x2 == x1) {
          console.log('往上');
          tp = 2;
        }
        if (y2 > y1 && x2 == x1) {
          console.log('往下');
          tp = 3;
        }

        // 跨过的棋子
        let p = 0;

        for (let i = 1; i < cols + 1; i++) {
          const tps = [`${y1}-${x1 - i}`, `${y1}-${x1 + i}`, `${y1 - i}-${x1}`, `${y1 + i}-${x1}`];
          const ev = tps[tp];
          // 此块存在
          if (metadata[e.msg.channel_id].chessman[ev]) {
            // 目的地判断
            if (ev == tp2) {
              // 是目的地
              // 目的地不为自己
              if (metadata[e.msg.channel_id].archive[ev] !== team) {
                isok = true;
                break;
              } else {
                break;
              }
            } else {
              // 不是目的地
              if (metadata[e.msg.channel_id].chessman[ev] !== '空') {
                // 炮可以跳棋，记录中途有多少棋子
                p += 1;
              }
            }
          }
        }
        // console.log(p)
        // 判断越过的棋子
        if (p < 2) {
          if (p == 1 && metadata[e.msg.channel_id].chessman[tp2] !== '空') {
            isok = true;
          } else if (p == 0 && metadata[e.msg.channel_id].chessman[tp2] === '空') {
            isok = true;
          } else {
            isok = false;
          }
        } else {
          isok = false;
        }
      }

      if (isok && metadata[e.msg.channel_id].chessman[tp2] === '将' && metadata[e.msg.channel_id].archive[tp2] == isAB) {
        return [true, true];
      } else if (isok) {
        return [true, false];
      }
    } catch (error) {
      return [false, false];
    }
  }

  /**
   *
   * @param {Object} e 机器人参数
   * @param {Object} msg 消息参数
   * @param {Object} metadata 游戏全部内容
   * @returns 中文指令解析
   */
  async Chineseinstructions(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }, msg: string, metadata: Record<string, any>) {
    const chessman = ['車', '馬', '象', '士', '将', '炮', '兵'];
    // 替换msg中的文本，卒改兵，马改馬，相改象，帅改将，车改車
    // let msg = "兵二进一" // msg值示例
    msg = msg.replace(/卒/g, '兵').replace(/马/g, '馬').replace(/相/g, '象').replace(/帅/g, '将').replace(/车/g, '車');
    let A; // 棋子名称
    let num; // 行数
    const B = msg.charAt(msg.length - 2); // 移动方向
    let num2; // 移动位置
    const C = msg.charAt(0); // 第一个字

    chessman.some(piece => {
      if (msg.startsWith(piece)) {
        A = piece;
        return true;
      }
    });

    if (A) {
      const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
      // 第一个数字
      const secondChar = msg.charAt(msg.length - 3);
      if (chineseNumbers.includes(secondChar)) {
        num = chineseNumbers.indexOf(secondChar);
        if (num >= 10) {
          num -= 10;
        }
        if (metadata[e.msg.channel_id].players[e.msg.author.id] === '黑') {
          num = 8 - num;
        }
      } else {
        num = msg.charAt(msg.length - 3);
      }
      // 第二个数字
      const lastChar = msg.charAt(msg.length - 1);
      if (chineseNumbers.includes(lastChar)) {
        num2 = chineseNumbers.indexOf(lastChar);
        if (num2 >= 10) {
          num2 -= 10;
        }
      } else {
        num = msg.charAt(msg.length - 1);
      }

      console.log('提取中文：', A, num, B, num2, C);
      return await parse(e, A, num, B, num2, C, metadata);
    } else {
      return false;
    }
  }
}

/**
 * @param {String} A 棋子名称
 * @param {Number} num 列数
 * @param {String} B 移动方向
 * @param {Number} num2 移动位置
 * @param {String} C 前后棋子
 * @param {Object} metadata 游戏数据
 */
async function parse(
  e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 },
  A: string,
  num: string | number,
  B: string | number,
  num2: number,
  C: string,
  metadata: Record<string, any>
) {
  let tp1; // 棋子具体位置
  let tp2; // 移动后具体位置
  const qizi = []; // 此列所有棋子
  // 查找棋子
  for (let i = 0; i < cols; i++) {
    // 遍历x=num那一行的棋子
    if (metadata[e.msg.channel_id].chessman[`${i}-${num}`] == A && metadata[e.msg.channel_id].archive[`${i}-${num}`] === metadata[e.msg.channel_id].players[e.msg.author.id]) {
      // 记录自己的棋子
      qizi.push(`${i}-${num}`);
    }
  }

  // console.log(qizi)

  // 判断棋子是否超过两个
  if (qizi.length > 1) {
    // console.log('大于1');
    // 红棋顺序
    if (C == '前' && metadata[e.msg.channel_id].current === '红') {
      tp1 = qizi[0];
    }
    if (C == '后' && metadata[e.msg.channel_id].current === '红') {
      tp1 = qizi[qizi.length - 1];
    }
    // 黑棋逆序
    if (C == '前' && metadata[e.msg.channel_id].current === '黑') {
      tp1 = qizi[qizi.length - 1];
    }
    if (C == '后' && metadata[e.msg.channel_id].current === '黑') {
      tp1 = qizi[0];
    }
  } else {
    // console.log('不大于1');
    tp1 = qizi[0];
  }
  // console.log(tp1)

  // 当前棋子的具体位置
  const y1 = tp1.split('-')[0];
  const x1 = tp1.split('-')[1];

  // 棋子前进方向，可移动的位置
  if (A == '兵' || A == '炮' || A == '車' || A == '将') {
    // 红棋顺序
    if (metadata[e.msg.channel_id].current === '红' && tp1) {
      // 进
      if (B == '进') {
        tp2 = `${+y1 + num2 + 1}-${x1}`;
      }
      // 平
      if (B == '平') {
        tp2 = `${y1}-${num2}`;
      }
      // 退
      if (B == '退') {
        tp2 = `${+y1 - num2 + 1}-${x1}`;
      }
    }

    // 黑棋逆序
    if (metadata[e.msg.channel_id].current === '黑' && tp1) {
      // 进
      if (B == '进') {
        tp2 = `${+y1 - +num2 - 1}-${x1}`;
      }
      // 平
      if (B == '平') {
        tp2 = `${y1}-${8 - num2}`;
      }
      // 退
      if (B == '退') {
        tp2 = `${+y1 + +num2 + 1}-${x1}`;
      }
    }
  } else {
    // 其他棋子判定
    // 将移动方向转为数字
    // 定义出棋子可走的部分，分为进 平 退 三个部分
    // 使用第二个数字判断是否有相符 取出这个坐标
    // 收工

    // 将移动方向转为数字
    switch (B) {
      case '进':
        if (metadata[e.msg.channel_id].current === '黑') {
          B = 2;
        } else {
          B = 0;
        }
        break;
      case '平':
        B = 1;
        break;
      case '退':
        if (metadata[e.msg.channel_id].current === '黑') {
          B = 0;
        } else {
          B = 2;
        }
        break;

      default:
        break;
    }

    // console.log('B的值' + B)

    // 设置num2的值
    if (metadata[e.msg.channel_id].current === '黑') {
      num2 = 8 - num2;
    }

    let tps: string[][] = [];

    if (A == '馬') {
      tps = [
        [`${+y1 + 2}-${+x1 - 1}`, `${+y1 + 2}-${+x1 + 1}`, `${+y1 + 1}-${+x1 - 2}`, `${+y1 + 1}-${+x1 + 2}`],
        [],
        [`${+y1 - 1}-${+x1 - 2}`, `${+y1 - 1}-${+x1 + 2}`, `${+y1 - 2}-${+x1 - 1}`, `${+y1 - 2}-${+x1 + 1}`]
      ];
    }

    if (A == '士') {
      tps = [[`${+y1 + 1}-${+x1 - 1}`, `${+y1 + 1}-${+x1 + 1}`], [], [`${+y1 - 1}-${+x1 - 1}`, `${+y1 - 1}-${+x1 + 1}`]];
    }

    if (A == '象') {
      tps = [[`${+y1 + 2}-${+x1 - 2}`, `${+y1 + 2}-${+x1 + 2}`], [], [`${+y1 - 2}-${+x1 - 2}`, `${+y1 - 2}-${+x1 + 2}`]];
    }

    for (let i = 0; i < tps[Number(B)].length; i++) {
      const pos = tps[Number(B)][i];
      console.log(pos);
      const num = parseInt(pos.split('-')[1]);
      if (num === num2) {
        console.log('匹配', num, num2, B, i);
        tp2 = pos;
        break;
      }
    }
  }

  const y2 = tp2.split('-')[0];
  const x2 = tp2.split('-')[1];

  return [y1, x1, y2, x2];
}
