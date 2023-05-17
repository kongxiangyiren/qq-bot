// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
// import redisClient, { RedisOptions } from 'ioredis';
// import { dirname, join } from 'path';
// import Yaml from 'yaml';
// import plugin from '../plugin';

// let Rcf: RedisOptions;
// const RcfPath = join(process.cwd(), '/config/redis.yaml');
// if (!existsSync(RcfPath)) {
//   mkdirSync(dirname(RcfPath), { recursive: true });
//   writeFileSync(
//     RcfPath,
//     Yaml.stringify({
//       host: '127.0.0.1',
//       port: 6379,
//       password: '',
//       db: 0
//     })
//   );

//   Rcf = {
//     ...{
//       host: '127.0.0.1',
//       port: 6379,
//       password: '',
//       db: 0
//     }
//   };
// } else {
//   Rcf = {
//     ...Yaml.parse(readFileSync(RcfPath, 'utf-8'))
//   };
// }
// /** 实例化redis */
// const redis = new redisClient({ ...Rcf });
// plugin.redis = redis;

// export const ctreateRedis = () => {
//   redis.on('connect', () => {
//     console.info('[REIDS] 连接成功~');
//   });
//   redis.on('error', error => {
//     console.error('[REDIS]', error);
//     process.exit();
//   });
// };
