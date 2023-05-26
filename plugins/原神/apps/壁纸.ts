import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/原神壁纸$',
        fnc: 'index',
        priority: 5000,
        describe: '随机获取一张原神壁纸'
      }
    ]);
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType !== 'DIRECT_MESSAGE_CREATE' && e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }

    // arraybuffer 获取文件流 这里图片太大可能会很慢
    const res = await this.axios.get('https://api.dujin.org/pic/yuanshen/', { responseType: 'arraybuffer' }).catch(err => err);

    if (!res) {
      return;
    }
    // // 原图地址
    // const img = res.request.protocol + '//' + res.request.host + res.request.path;
    // console.log('[原神壁纸]: ' + img);
    // 获取图片类型
    const type = res.headers['content-type'];
    // 生成图片位置
    let imgPath = join(process.cwd(), '/runtime/plugins/yuanshen/bz/bz');
    // 判断图片类型添加后缀名
    if (type === 'image/png') {
      imgPath += '.png';
    } else if (type === 'image/gif') {
      // 不支持压缩gif
      await this.send(e, {
        msg_id: e.msg.id,
        image: res.request.protocol + '//' + res.request.host + res.request.path
      });
      return true;
    } else {
      imgPath += '.jpg';
    }
    // 创建文件夹
    mkdirSync(dirname(imgPath), { recursive: true });
    // 下载图片
    writeFileSync(imgPath, res.data);

    // 获取图片大小
    const contentLength = res.headers['content-length'];
    // 图片超过1mb压缩
    if (contentLength / 1024 > 1024) {
      const out = await this.imageSize(imgPath, imgPath);
      if (!out) {
        return false;
      }
    }

    await this.send(e, {
      msg_id: e.msg.id,
      file_image: imgPath
    });

    return true;
  }
}
