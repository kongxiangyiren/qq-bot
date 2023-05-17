import { existsSync, mkdirSync } from 'fs';
import Jimp from 'jimp';
import { dirname } from 'path';

// 设置最大文件大小为1MB
const maxSize = 1 * 1024 * 1024;

/**
 * @description: 压缩图片（仅支持jpeg和png格式）
 * @param {string} imgPath 原图片路径
 * @param {string} outPath 输出图片路径
 * @returns {Promise<boolean>} 是否成功压缩图片
 */
export default async function imageSize(imgPath: string, outPath: string): Promise<boolean> {
  try {
    // 判断图片是否存在
    if (!existsSync(imgPath)) {
      return false;
    }

    // 读取图片
    const image = await Jimp.read(imgPath);

    // 判断图片格式是否支持
    if (image.getMIME() !== Jimp.MIME_JPEG && image.getMIME() !== Jimp.MIME_PNG) {
      return false;
    }

    // 获取当前文件大小
    const currentSize = await image.getBufferAsync(image.getMIME()).then(buffer => buffer.length);

    // 如果当前文件大小超过最大文件大小，则进行缩放
    if (currentSize > maxSize) {
      // 计算缩放比例
      const scaleFactor = Math.sqrt(maxSize / currentSize);

      // 缩放图片
      image.scale(Math.floor(scaleFactor * 10) / 10 - 0.1 <= 0 ? 0.1 : Math.floor(scaleFactor * 10) / 10 - 0.1);
    }

    // 输出创建文件夹
    mkdirSync(dirname(outPath), { recursive: true });

    // 写入修改后的图片
    await image.writeAsync(outPath);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
