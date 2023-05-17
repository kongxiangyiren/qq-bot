import { green, red, yellow } from 'kolorist';
import dayjs from './day';
import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import './qqbot';
if (process.env.NODE_ENV !== 'pm2') {
  // 修改console.log
  const cl = console.log;
  console.log = function (...args) {
    cl(green(`[${dayjs().format('YYYY-MM-DD HH:mm:ss Z')}] [${process.pid}] [INFO] - `), ...args);
  };

  // 修改console.info
  const ci = console.info;
  console.info = function (...args) {
    // 移除 心跳校验 和最大重试提示
    if (args[0] !== '[CLIENT] 心跳校验' && args[0] !== '[CLIENT] 超过重试次数，连接终止' && args[0] !== '[ERROR] createSession: ') {
      ci(green(`[${dayjs().format('YYYY-MM-DD HH:mm:ss Z')}] [${process.pid}] [INFO] - `), ...args);
    }
  };

  // 修改console.warn
  const cw = console.warn;
  console.warn = function (...args) {
    cw(yellow(`[${dayjs().format('YYYY-MM-DD HH:mm:ss Z')}] [${process.pid}] [WARN] - `), ...args);
  };

  // 修改console.error
  const ce = console.error;
  console.error = function (...args) {
    const date = dayjs().format('YYYY-MM-DD HH:mm:ss Z');
    ce(red(`[${date}] [${process.pid}] [ERRO] - `), ...args);

    // 写入日志文件
    if (parse(__filename).ext !== '.ts') {
      const errPath = join(process.cwd(), `logs/error.${dayjs().format('YYYY-MM-DD')}.log`);
      mkdirSync(dirname(errPath), { recursive: true });
      const errorLog = createWriteStream(errPath, { flags: 'a' });
      let error = '';
      args.forEach(err => {
        error +=
          (typeof err === 'object'
            ? JSON.stringify(err, null, 2)
                .replace(/\n/g, ' ')
                .replace(/\s{2,}/g, ' ')
            : err) + ' ';
      });
      errorLog.write(`${`[${date}] [${process.pid}] [ERRO]`} - ${error}\n`);
    }
  };
} else {
  // 修改console.info
  const ci = console.info;
  console.info = function (...args) {
    // 移除 心跳校验 和最大重试提示
    if (args[0] !== '[CLIENT] 心跳校验' && args[0] !== '[CLIENT] 超过重试次数，连接终止' && args[0] !== '[ERROR] createSession: ') {
      ci(...args);
    }
  };
}
