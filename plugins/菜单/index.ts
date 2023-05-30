import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'path';
import menu from './assets/menu';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/(菜单|帮助|help)$',
        fnc: 'index',
        priority: 5000,
        describe: '菜单'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 使用模板
    const res = this.nunjucks.render(join(__dirname, './assets/index.html'), {
      version: (await import(join(QQBot.ROOT_PATH, '/package.json'))).version,
      menu,
      floor: Math.floor,
      path: __dirname.replace(/\\/g, '/'),
      global: join(process.cwd(), '/global/').replace(/\\/g, '/')
    });
    //   递归创建文件夹
    mkdirSync(join(process.cwd(), `/runtime/plugins/菜单/html`), { recursive: true });
    mkdirSync(join(process.cwd(), `/runtime/plugins/菜单/img`), { recursive: true });
    // 创建模板html
    writeFileSync(join(process.cwd(), `/runtime/plugins/菜单/html/菜单.html`), res);
    //   截图
    const img = await this.getPu(join(process.cwd(), `/runtime/plugins/菜单/html/菜单.html`), '.menu', join(process.cwd(), `/runtime/plugins/菜单/img/菜单.jpg`));
    //   发送本地图片
    if (img) {
      await this.send(e, {
        file_image: join(process.cwd(), `/runtime/plugins/菜单/img/菜单.jpg`),
        msg_id: e.msg.id
      });
    }
    return true;
  }
}
