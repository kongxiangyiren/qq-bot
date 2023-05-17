import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import schedule from 'node-schedule';

const cacheDir = join(process.cwd(), '/runtime/cache');
const maxage = 24 * 60 * 60 * 1000; // 最大缓存时间为24小时
let cacheData: { [key: string]: { maxAge: number; expireTime: number; type: string } } = {};

function getCache<T>(key: string): T | null {
  const cacheFile = join(cacheDir, md5(key));
  if (existsSync(cacheFile)) {
    const cacheInfo = cacheData[md5(key)];
    if (Date.now() < cacheInfo.expireTime) {
      const data = readFileSync(cacheFile, 'utf8');
      if (cacheInfo.type === 'string') {
        return data as unknown as T;
      } else if (cacheInfo.type === 'array') {
        return JSON.parse(data) as unknown as T;
      } else if (cacheInfo.type === 'object') {
        return JSON.parse(data) as unknown as T;
      }
    } else {
      delete cacheData[md5(key)];
      unlinkSync(cacheFile);
    }
  }
  return null;
}

function setCache<T>(key: string, value: T, maxAge = maxage) {
  const cacheFile = join(cacheDir, md5(key));
  mkdirSync(cacheDir, { recursive: true });
  if (value === null) {
    delete cacheData[md5(key)];
    unlinkSync(cacheFile);
  } else if (typeof value === 'string') {
    writeFileSync(cacheFile, value, 'utf8');
    cacheData[md5(key)] = {
      maxAge: maxAge,
      expireTime: Date.now() + maxAge,
      type: 'string'
    };
  } else if (Array.isArray(value)) {
    writeFileSync(cacheFile, JSON.stringify(value), 'utf8');
    cacheData[md5(key)] = {
      maxAge: maxAge,
      expireTime: Date.now() + maxAge,
      type: 'array'
    };
  } else {
    writeFileSync(cacheFile, JSON.stringify(value), 'utf8');
    cacheData[md5(key)] = {
      maxAge: maxAge,
      expireTime: Date.now() + maxAge,
      type: 'object'
    };
  }
  writeFileSync(join(cacheDir, 'cacheData.json'), JSON.stringify(cacheData), 'utf8');
}

function clearCache() {
  const files = readdirSync(cacheDir);
  files.forEach(file => {
    const filePath = join(cacheDir, file);
    const stats = statSync(filePath);
    if (Date.now() - stats.mtimeMs > maxage) {
      unlinkSync(filePath);
    } else {
      const key = file;
      const cacheInfo = cacheData[key];
      if (cacheInfo && Date.now() > cacheInfo.expireTime) {
        delete cacheData[key];
        unlinkSync(filePath);
      }
    }
  });
  writeFileSync(join(cacheDir, 'cacheData.json'), JSON.stringify(cacheData), 'utf8');
}

function loadCacheData() {
  const cacheDataFile = join(cacheDir, 'cacheData.json');
  if (existsSync(cacheDataFile)) {
    cacheData = JSON.parse(readFileSync(cacheDataFile, 'utf8'));
  }
}

function md5(str: string): string {
  return createHash('md5').update(str).digest('hex');
}

// 每天凌晨清理文件
const scheduleRule = new schedule.RecurrenceRule();
scheduleRule.tz = 'Asia/Shanghai';
scheduleRule.hour = 0;
scheduleRule.minute = 0;
schedule.scheduleJob(scheduleRule, async function () {
  clearCache();
});

loadCacheData();

export default {
  getCache,
  setCache
};

// // 使用示例
// setCache('key1', 'value1', 30 * 60 * 1000); // 缓存时间为30分钟
// const result1 = getCache<string>('key1');
// console.log(result1);

// setCache('key2', [1, 2, 3], 60 * 60 * 1000); // 缓存时间为1小时
// const result2 = getCache<number[]>('key2');
// console.log(result2);

// setCache('key3', { a: 1, b: 2, c: 3 }, 2 * 60 * 60 * 1000); // 缓存时间为2小时
// const result3 = getCache<{ a: number; b: number; c: number }>('key3');
// console.log(result3);

// setCache('key4', null); // 删除缓存
