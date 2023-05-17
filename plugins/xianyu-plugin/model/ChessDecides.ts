const rows = 8; // 棋盘宽度
// const cols = 8; // 棋盘高度

export default class panduan {
  /**
   * @param {Object} e 机器人参数
   * @param {Array} emsg 所有的坐标
   * @param {String} tp1 选择坐标
   * @param {String} tp2 目的地坐标
   * @param {String} team 玩家组
   * @param {Object} metadata 游戏所有数据
   */
  async Audit(e: { eventType?: typeof QQBot.eventType; msg?: typeof QQBot.IMessage2 }, emsg: (string | number)[], tp1: string, tp2: string, team: string | RegExp, metadata: Record<string, any>) {
    try {
      console.log(emsg, tp1, tp2, team);
      // 目的地是否为自己棋子
      if (metadata[e.msg.channel_id].archive[tp2] === team) return false;

      // 获取选择的棋子信息
      const A = metadata[e.msg.channel_id].chessman[tp1];

      // 对方组
      let isAB = '黑白';
      isAB = isAB.replace(new RegExp(team), '');

      // 重定义坐标
      const x1 = +emsg[1];
      const x2 = +emsg[3];
      const y1 = +emsg[0];
      const y2 = +emsg[2];
      console.log(x1, y1, x2, y2);

      // 胜利判断
      let isok = false;

      // 兵的移动
      if (A == '兵') {
        if (x1 == x2 && metadata[e.msg.channel_id].chessman[tp2] === '空') {
          // 垂直移动，前方不能有棋子
          if (team == '白') {
            if (y1 + 1 == y2) {
              isok = true;
              console.log('走1格');
            } // 等于1格
            if (y1 + 2 == y2 && y1 == 1) isok = true; // 等于2格
          }
          if (team == '黑') {
            if (y1 - 1 == y2) {
              isok = true;
              console.log('走1格');
            } // 等于1格
            if (y1 - 2 == y2 && y1 == 6) isok = true; // 等于2格
          }
        }
        if (x1 + 1 == x2 || (x1 - 1 == x2 && metadata[e.msg.channel_id].archive[tp2] && metadata[e.msg.channel_id].archive[tp2] == isAB)) {
          // 吃棋
          if (team == '白' && y1 + 1 == y2) isok = true;
          if (team == '黑' && y1 - 1 == y2) isok = true;
        }
      }

      if (A == '马') {
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
        tps.forEach(ev => {
          if (metadata[e.msg.channel_id].chessman[ev] && ev == tp2 && metadata[e.msg.channel_id].archive[tp2] != team) {
            console.log('条件符合', metadata[e.msg.channel_id].archive[ev], tp2);
            isok = true;
          }
        });
      }

      if (A == '象') {
        let tp; // 坐标
        // 判断目的地方向
        if (y2 < y1 && x2 < x1) {
          console.log('左上角');
          tp = 0;
        }
        if (y2 < y1 && x2 > x1) {
          console.log('右上角');
          tp = 1;
        }
        if (y2 > y1 && x2 < x1) {
          console.log('左下角');
          tp = 2;
        }
        if (y2 > y1 && x2 > x1) {
          console.log('右下角');
          tp = 3;
        }

        for (let i = 1; i < rows + 1; i++) {
          const tps = [`${y1 - i}-${x1 - i}`, `${y1 - i}-${x1 + i}`, `${y1 + i}-${x1 - i}`, `${y1 + i}-${x1 + i}`];
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

      if (A == '车') {
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

        for (let i = 1; i < rows + 1; i++) {
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

      if (A == '后') {
        let tp; // 坐标
        // 判断目的地方向
        if (y2 < y1 && x2 < x1) {
          console.log('左上角');
          tp = 0;
        }
        if (y2 < y1 && x2 > x1) {
          console.log('右上角');
          tp = 1;
        }
        if (y2 > y1 && x2 < x1) {
          console.log('左下角');
          tp = 2;
        }
        if (y2 > y1 && x2 > x1) {
          console.log('右下角');
          tp = 3;
        }
        if (y2 == y1 && x2 < x1) {
          console.log('往左');
          tp = 4;
        }
        if (y2 == y1 && x2 > x1) {
          console.log('往右');
          tp = 5;
        }
        if (y2 < y1 && x2 == x1) {
          console.log('往上');
          tp = 6;
        }
        if (y2 > y1 && x2 == x1) {
          console.log('往下');
          tp = 7;
        }

        for (let i = 1; i < rows + 1; i++) {
          const tps = [`${y1 - i}-${x1 - i}`, `${y1 - i}-${x1 + i}`, `${y1 + i}-${x1 - i}`, `${y1 + i}-${x1 + i}`, `${y1}-${x1 - i}`, `${y1}-${x1 + i}`, `${y1 - i}-${x1}`, `${y1 + i}-${x1}`];
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

      if (A == '王') {
        // 定义出周围8个格子
        try {
          [`${y1 - 1}-${x1 - 1}`, `${y1 - 1}-${x1}`, `${y1 - 1}-${x1 + 1}`, `${y1}-${x1 - 1}`, `${y1}-${x1 + 1}`, `${y1 + 1}-${x1 - 1}`, `${y1 + 1}-${x1}`, `${y1 + 1}-${x1 + 1}`].forEach(ev => {
            // 遍历格子是否为目的地
            if (ev == tp2 && metadata[e.msg.channel_id].chessman[ev] && metadata[e.msg.channel_id].archive[ev] !== team) {
              throw new Error();
            }
          });
        } catch (error) {
          isok = true;
        }
      }

      if (isok && metadata[e.msg.channel_id].chessman[tp2] === '王' && metadata[e.msg.channel_id].archive[tp2] == isAB) {
        return [true, true];
      } else if (isok) {
        return [true, false];
      }
    } catch (err) {
      console.log(err);
      return [false, false];
    }
  }
}
