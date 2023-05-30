import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/签到$',
        fnc: 'index',
        priority: 5000,
        describe: '签到'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const qd = join(process.cwd(), '/data/plugins/签到/yaml/qiandao.yaml');

    let qdjson = existsSync(qd) ? this.yaml.parse(readFileSync(qd, 'utf-8')) : '';
    // console.log(qdjson);
    const now = this.dayjs().format('YYYY-MM-DD HH:mm:ss');
    if ((qdjson ?? '') !== '' && (qdjson[e.msg.author.id] ?? '') !== '') {
      // 签到那天结束的时间
      const start = this.dayjs(qdjson[e.msg.author.id], 'YYYY-MM-DD HH:mm:ss').endOf('day');
      //  当前时间
      const end = this.dayjs(now, 'YYYY-MM-DD HH:mm:ss');

      if (this.dayjs.duration(end.diff(start)).asDays() < 0) {
        const message = {
          content: `<@!${e.msg.author.id}> 您已签到请明天再来`,
          msg_id: e.msg.id // 可选，消息id，如果指定则会回复该消息
        };

        await this.send(e, message);
        return true;
      }
    }

    // 使用模板
    const res = this.nunjucks.render(join(__dirname, './html/index.html'), {
      img: e.msg.author.avatar,
      name: e.msg.author.username,
      time: now,
      path: __dirname.replace(/\\/g, '/')
    });

    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/签到/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/签到/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/签到/html/签到.html`), res);
    //   截图
    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/签到/html/签到.html`), '.bj', join(process.cwd(), `/runtime/plugins/签到/img/签到.jpg`));
    //   发送本地图片
    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), `/runtime/plugins/签到/img/签到.jpg`),
        msg_id: e.msg.id
      });
    }

    mkdirSync(dirname(qd), { recursive: true });
    if ((qdjson ?? '') === '' || typeof qdjson === 'string') {
      qdjson = {};
    }
    qdjson[e.msg.author.id] = now;
    writeFileSync(qd, this.yaml.stringify(qdjson));

    return true;
  }
}
