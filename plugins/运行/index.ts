import { exec, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'os';
import { join, parse } from 'path';
let update = false;

// @ts-ignore
export default class extends QQBot.plugin {
  constructor() {
    super([
      {
        reg: '^/运行状态$',
        fnc: 'index',
        priority: 5000,
        describe: '运行状态'
      },

      {
        reg: '^/主人认证(.*)$',
        fnc: 'master',
        priority: 1,
        describe: '主人认证'
      },
      {
        reg: '^/重启$',
        fnc: 'restart',
        priority: 1,
        describe: '重启'
      },
      {
        reg: '^/(强制)*更新$',
        fnc: 'update',
        priority: 1,
        describe: '更新'
      }
    ]);

    const data = this.cache.getCache('重启');
    if (data) {
      const { e, time } = data as Record<string, any>;
      this.send(e, {
        msg_id: e.msg.id,
        content: '重启成功, 耗时：' + this.dayjs().subtract(time).format('s') + 's'
      }).catch(err => err);
      this.cache.setCache('重启', null);
    }
  }

  async index(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType !== 'DIRECT_MESSAGE_CREATE' && e.eventType !== 'MESSAGE_CREATE' && e.eventType !== 'AT_MESSAGE_CREATE') {
      return;
    }
    let msg = '';
    //cpu架构
    // const arch = os.arch();
    // console.log("cpu架构：" + arch);

    // //操作系统内核
    // const kernel = os.type();
    // console.log("操作系统内核：" + kernel);

    // //操作系统平台
    const pf = os.platform();
    msg += '平台：' + pf;

    //系统开机时间

    const uptime = os.uptime();
    const formattedUptime = this.dayjs().subtract(uptime, 'second').format('YYYY-MM-DD HH:mm:ss');
    msg += '\n开机时间：' + formattedUptime;

    // //主机名
    // const hn = os.hostname();
    // console.log("主机名：" + hn);

    // //主目录
    // const hdir = os.homedir();
    // console.log("主目录：" + hdir);

    //内存
    const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);

    msg += '\n内存大小：' + totalMem + 'GB\n 空闲内存：' + freeMem + 'GB';

    // 程序占用内存
    const used = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    msg += '\n程序占用内存：' + used + 'MB';

    // //cpu
    // const cpus = os.cpus();
    // console.log('*****cpu信息*******');
    // cpus.forEach((cpu, idx, arr) => {
    //     let times = cpu.times;
    //     console.log(`cpu${idx}：`);
    //     console.log(`型号：${cpu.model}`);
    //     console.log(`频率：${cpu.speed}MHz`);
    //     console.log(`使用率：${((1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100).toFixed(2)}%`);
    // });

    //网卡
    // console.log('*****网卡信息*******');
    // const networksObj = os.networkInterfaces();
    // for (let nw in networksObj) {
    //     let objArr = networksObj[nw];
    //     console.log(`\r\n${nw}：`);
    //     objArr.forEach((obj, idx, arr) => {
    //         console.log(`地址：${obj.address}`);
    //         console.log(`掩码：${obj.netmask}`);
    //         console.log(`物理地址：${obj.mac}`);
    //         console.log(`协议族：${obj.family}`);
    //     });
    // }
    await this.send(e, {
      msg_id: e.msg.id,
      content: msg + ''
    });

    return true;
  }
  async master(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (e.eventType !== 'DIRECT_MESSAGE_CREATE') {
      return;
    }

    if (QQBot.config.master && QQBot.config.master.id) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '已经进行过主人认证'
      });
      return true;
    }

    const msg = e.msg.content.replace(`<@!${QQBot.bot.id}>`, '').replace('/主人认证', '').trim();
    if (msg !== QQBot.config.master.pass) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '密码错误'
      });
      return true;
    } else {
      const file = join(process.cwd(), '/config/config.yaml');
      const config: typeof QQBot.config = this.yaml.parse(readFileSync(file, 'utf-8'));
      config.master = {
        id: e.msg.author.id
      };

      writeFileSync(file, this.yaml.stringify(config));
      QQBot.config = config;
      await this.send(e, {
        msg_id: e.msg.id,
        content: '认证成功'
      });
      return true;
    }
  }
  async restart(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    // 判断是不是打包项目
    const run = parse(process.argv0);
    if (run.name !== 'node') {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '打包文件不支持重启，请手动重启项目'
      });
      return true;
    }

    // 主人认证
    if (e.msg.author.id !== QQBot.config.master.id) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '只有主人才可以重启哦'
      });
      return true;
    }

    await this.send(e, {
      msg_id: e.msg.id,
      content: '开始执行重启，请稍等...'
    });

    this.cache.setCache(
      '重启',
      {
        e: e,
        time: +new Date()
      },
      10 * 60 * 1000
    );
    exec('npm run pm2:start && npm run pm2:save', { windowsHide: true }, async (error, stdout) => {
      if (error) {
        this.cache.setCache('重启', null);
        await this.send(e, {
          msg_id: e.msg.id,
          content: `操作失败！\n${error.stack}`
        });
        console.error(`重启失败\n${error.stack}`);
      } else if (stdout) {
        console.info('重启成功，运行已由前台转为后台');
        console.info(`查看日志请用命令：npm run pm2:log`);
        console.info(`停止后台运行命令：npm run pm2:stop`);
        process.exit();
      }
    });
  }

  async update(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    if (update) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '请勿重复发送指令'
      });
      return true;
    }

    //  判断是不是ts项目
    if (parse(__filename).ext !== '.ts') {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '打包项目不支持更新，请手动更新项目'
      });
      return true;
    }

    // 主人认证
    if (e.msg.author.id !== QQBot.config.master.id) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '只有主人才可以更新哦'
      });
      return true;
    }
    // 检查git安装
    if (!(await this.checkGit(e))) return;

    const type = e.msg.content.includes('强制') ? '强制更新' : '更新';

    await this.send(e, {
      msg_id: e.msg.id,
      content: '开始' + type
    });
    let data;
    try {
      data = execSync(type === '更新' ? 'git pull --no-rebase' : 'git fetch --all && git reset --hard origin/main', { encoding: 'utf-8' });
      update = true;
    } catch (error) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '更新失败' + error
      });

      return true;
    }

    if (data.includes('Already up to date') || data.includes('Already up-to-date')) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '已经最新了'
      });
    } else if (data.includes('error')) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '更新失败' + data
      });
    } else {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '更新成功'
      });
    }
    update = false;
    return true;
  }

  async checkGit(e: { eventType: typeof QQBot.eventType; msg: typeof QQBot.IMessage2 }) {
    const ret = execSync('git --version', { encoding: 'utf-8' });
    if (!ret || !ret.includes('git version')) {
      await this.send(e, {
        msg_id: e.msg.id,
        content: '请先安装git'
      });

      return false;
    }

    return true;
  }
}
