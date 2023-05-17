import { existsSync } from 'fs';
import cityList from './assets/最新_city.json';
import { join } from 'path';

// ghproxy.com 为github加速
// 相同网站还有
// https://gh.api.99988866.xyz/
// https://gh.con.sh/
// https://ghdl.feizhuqwq.cf/
// https://ghps.cc/
// https://git.xfj0.cn/

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/查询天气(.*)$',
        fnc: 'index',
        priority: 5000,
        describe: '查询天气'
      }
    ]);
  }
  // 参考文档 https://www.sojson.com/blog/305.html
  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }
    const city = e.msg.content
      .replace(`<@!${QQBot.bot.id}>`, '')
      .replace('/查询天气', '')
      .replace(/(市|区|县|省)$/, '')
      .trim();

    if ((city ?? '') === '') {
      return await this.send(e, {
        msg_id: e.msg.id,
        content: '查询城市不能为空'
      });
    }
    this.lodash;
    // 查询城市city_code
    const cityData = this.lodash.filter(cityList, item => {
      return this.lodash.includes(item.city_name, city);
    });

    if (cityData.length !== 0 && cityData[0].city_code !== '') {
      // 读取缓存
      const data: string = this.cache.getCache(`wea:${cityData[0].city_code}`);

      if (data) {
        await this.send(e, {
          msg_id: e.msg.id,
          embed: JSON.parse(data)
        });
        return true;
      }

      const { data: wea } = await this.axios.get(`http://t.weather.itboy.net/api/weather/city/${cityData[0].city_code}`).catch(err => err);
      if (!wea || wea.status !== 200) {
        return await this.send(e, {
          msg_id: e.msg.id,
          content: '天气查询失败'
        });
      }

      let weather_icon;
      if (wea.data.forecast[0].type === '晴') {
        const now = this.dayjs(); // 获取当前时间
        const start = this.dayjs().hour(18).minute(0).second(0); // 晚上6点
        const end = this.dayjs().add(1, 'day').hour(6).minute(0).second(0); // 第二天早上6点

        if (now.isBetween(start, end)) {
          //   console.log('当前时间在晚上6点到早上6点之间');
          weather_icon = 'https://ghproxy.com/https://raw.githubusercontent.com/kongxiangyiren/305-wea-ico/master/天气/夜晴.png';
        } else {
          //   console.log('当前时间不在晚上6点到早上6点之间');
          weather_icon = 'https://ghproxy.com/https://raw.githubusercontent.com/kongxiangyiren/305-wea-ico/master/天气/日晴.png';
        }
      } else {
        if (existsSync(join(__dirname, `./assets/天气/${wea.data.forecast[0].type}.png`))) {
          weather_icon = `https://ghproxy.com/https://raw.githubusercontent.com/kongxiangyiren/305-wea-ico/master/天气/${wea.data.forecast[0].type}.png`;
        } else {
          weather_icon = 'https://ghproxy.com/https://raw.githubusercontent.com/kongxiangyiren/305-wea-ico/master/天气/无.png';
        }
      }

      const embedContent = createEmbedMessage(`${wea.cityInfo.city} ${wea.data.forecast[0].type}`, weather_icon, [
        `${wea.data.forecast[0].ymd} ${wea.data.forecast[0].week}`,
        `当前温度区间：${wea.data.forecast[0].high}/${wea.data.forecast[0].low}`,
        `最高温度：${wea.data.forecast[0].high}`,
        `最低温度：${wea.data.forecast[0].low}`,
        `当前湿度：${wea.data.shidu}`
      ]);
      // 缓存10分钟
      this.cache.setCache(`wea:${cityData[0].city_code}`, JSON.stringify(embedContent), 10 * 60 * 1000); // 设置key的过期时间为10分钟
      await this.send(e, {
        msg_id: e.msg.id,
        embed: embedContent
      });
      return true;
    } else {
      return await this.send(e, {
        msg_id: e.msg.id,
        content: '没有对应城市的天气信息'
      });
    }
  }
}

// 创建embed消息
function createEmbedMessage(title: string, thumbnail: string, items: string[]) {
  const message: typeof QQBot.Embed = { title, thumbnail: { url: thumbnail }, fields: [] };
  items.forEach(item => {
    message.fields!.push({ name: item });
  });
  return message;
}
