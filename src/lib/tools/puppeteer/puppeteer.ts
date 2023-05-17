// import { join } from 'path';
import downloadP from './download';
import puppeteer, { Browser, Configuration } from 'puppeteer';
import { PathLike } from 'node:fs';
import { green, red } from 'kolorist';
import { existsSync } from 'fs';

let chromePath = '';
let pic = 0;
let browser: boolean | Browser | void = false;
// 下载
export async function download() {
  return new Promise((resolve, reject) => {
    // 获取puppeteer安装路径
    if (chromePath === '') {
      if (process.platform === 'win32') {
        // win判断有没有edge浏览器，有就直接使用
        if (existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')) {
          chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
          console.info(`检测到edge浏览器,跳过下载puppeteer浏览器`);
          return resolve(true);
        }
      } else if (process.platform === 'linux') {
        // linux判断有没有chromium浏览器，有就直接使用
        //  termux 安装debian系统
        // apt-get install chromium
        // apt-get install ttf-wqy-zenhei
        // apt-get install fontconfig
        // fc-cache -f -v
        if (existsSync('/usr/bin/chromium')) {
          chromePath = '/usr/bin/chromium';
          console.info(`检测到chromium浏览器,跳过下载puppeteer浏览器`);
          return resolve(true);
        }
      } else {
        return resolve(true);
      }

      // @ts-ignore
      const configuration = puppeteer.configuration as Configuration;
      configuration.skipDownload = false;
      // 使用默认安装路径，防止重复下载
      // configuration.cacheDirectory = join(process.cwd(), '.cache', 'puppeteer');

      try {
        // 判断浏览器是否存在
        chromePath = puppeteer.executablePath();
        return resolve(true);
      } catch (error) {
        downloadP()
          .then(res => {
            chromePath = res;
            resolve(true);
          })
          .catch(error => {
            console.log('puppeteer安装失败');
            reject('puppeteer安装失败');
            throw error;
          }); // 下载并返回安装路径
      }
    } else {
      resolve(true);
    }
  });
}

/**
 * @description:
 * @param {PathLike} htmlPath html完整路径
 * @param {string} tab html tab标签
 * @param {string} imgPath 生成的图片完整路径
 * @return {Promise<boolean>}
 */
export async function getPu(htmlPath: PathLike, tab: string, imgPath: string): Promise<boolean> {
  if (pic === 0) {
    browser = false;
    console.info(green('puppeteer 启动中。。'));

    browser = await puppeteer
      .launch({
        executablePath: chromePath,
        headless: 'new',
        devtools: false,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-first-run', '--no-sandbox', '--no-zygote', '--single-process']
      })
      .catch(err => {
        console.error(red(err.toString()));
        if (String(err).includes('correct Chromium')) {
          console.error(red('没有正确安装Chromium，可以尝试执行安装命令：node ./node_modules/puppeteer/install.js'));
        }
        return false;
      });
    if (typeof browser === 'boolean' && !browser) {
      console.error(red('puppeteer 启动失败'));
      return false;
    }
    console.info(green('puppeteer 启动成功'));
  }

  const page = await (browser as Browser).newPage();

  try {
    await page.goto(`file://${htmlPath}`, { timeout: 30000 });
  } catch (e) {
    console.log(e);
    await page.close();
    await (browser as Browser).close();
    return false;
  }

  const body = await page.$(tab);
  await body.screenshot({
    path: imgPath
  });

  pic++;
  // 大于等于30次重开
  if (pic >= 30) {
    await (browser as Browser).close().catch(err => console.error(red(err.toString())));
    console.info(green('puppeteer 关闭成功'));
    pic = 0;
  }

  return true;
}
