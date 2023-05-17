import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import lodash from 'lodash';
import { IMessage } from 'qq-guild-bot';
import { green, red } from 'kolorist';

const Apps: { [key: string]: any } = {};
let command: any[] = [];
export default class Init {
  // 加载
  async load() {
    // 获取插件位置
    const plugins = join(process.cwd(), '/plugins');
    // 加载插件
    await this.loadPlugin([plugins]);

    console.log(green(`共成功加载${this.appn}个插件`));
  }
  // 插件数
  appn = 0;
  // 加载插件方法
  async loadPlugin(dir: string[]) {
    for (const val of dir) {
      // 判断插件文件夹是否存在
      if (!existsSync(val)) {
        mkdirSync(val, { recursive: true });
      }

      // 读取插件文件夹文件
      const readDir = readdirSync(val, { withFileTypes: true });

      // 遍历文件夹
      for (const v of readDir) {
        // 如果是文件就跳过
        if (v.isFile()) {
          continue;
        }
        const filepath = join(val, v.name);

        // 判断是否存在index.js 或 index.ts 文件
        if (existsSync(join(filepath, 'index.js')) || existsSync(join(filepath, 'index.ts'))) {
          //  引入
          let plugin;
          try {
            plugin = await import(join(filepath, 'index'));
          } catch (error) {
            console.error(red(`报错：${v.name}`));
            console.error(error);
          }
          this.appn++;
          if (!plugin || !plugin.default || (JSON.stringify(plugin.default) === '{}' && Object.keys(plugin.default).length === 0)) {
            continue;
          }

          let tmp;

          const cons = isConstructor(plugin.default);

          if (!cons) {
            const pls = await plugin.default;
            const keys = Object.keys(pls);
            for (const key of keys) {
              const cons = isConstructor(pls[key]);
              try {
                tmp = cons;
              } catch (error) {
                console.error(red(`报错：${v.name}`));
                console.error(error);
              }

              if (!tmp || !tmp.rules) {
                continue;
              }

              Apps[v.name + '/' + key] = tmp;

              for (const i in tmp.rules) {
                tmp.rules[i].type = v.name + '/' + key;
                command.push(tmp.rules[i]);
              }
            }
          } else {
            try {
              tmp = cons;
            } catch (error) {
              console.error(red(`报错：${v.name}`));
              console.error(error);
            }

            if (!tmp || !tmp.rules) {
              continue;
            }

            Apps[v.name] = tmp;

            for (const i in tmp.rules) {
              tmp.rules[i].type = v.name;
              command.push(tmp.rules[i]);
            }
          }
        }
      }
    }

    // 插件规则排序
    command = lodash.orderBy(command, ['priority'], ['asc']);

    this.saveCommand(command);
  }

  // 判断是不是第一次生成command.json
  comm = false;

  // 生成command.json命令总览
  saveCommand(command: any[]) {
    const data: any = {
      dec: '命令总览json，只是查看，修改不起作用，需要到具体文件修改'
    };

    for (const val of command) {
      if (!data[val.type]) {
        data[val.type] = {};
      }

      data[val.type][val.fnc] = {
        reg: val.reg,
        priority: val.priority,
        describe: val.describe,
        fnc: val.fnc
      };
    }

    const commandP = join(process.cwd(), '/runtime/config/command.json');
    // 创建命令总览
    mkdirSync(dirname(commandP), { recursive: true });
    writeFileSync(commandP, JSON.stringify(data, null, '\t'));
    if (!this.comm) {
      console.info(green('生成command.json命令总览成功,具体请看' + commandP));
      this.comm = true;
    }
  }

  // 消息处理(不处理撤回的消息)
  async dealMsg(e: { eventType: typeof QQBot.eventType; msg: IMessage }) {
    for (const val of command) {
      let msg = e.msg.content;
      // 去掉@机器人
      if (msg) {
        msg = msg.replace(`<@!${QQBot.bot.id}>`, '').trim();
      }

      // 匹配规则
      if (new RegExp(val.reg).test(msg) || val.reg === 'noCheck') {
        const { type, fnc } = val;

        if (!Apps[type] || !Apps[type][fnc]) {
          console.error(red(`请先检查该方法是否存在：${type} ${fnc}`));
          return;
        }

        try {
          const res = await Apps[type][fnc](e);
          if (res) {
            break;
          }
        } catch (error) {
          console.error(red(`错误：${type} ${fnc}`));
          const err = JSON.stringify(error, null, 2);
          if (err + '' === '{}') {
            console.error(error);
          } else {
            console.error(err);
          }
          return;
        }
      }
    }
  }
}

// 判断是不是构造函数
function isConstructor(f: new () => any) {
  let def;
  try {
    def = new f();
  } catch (err) {
    // verify err is the expected error and then
    return false;
  }
  return def;
}
