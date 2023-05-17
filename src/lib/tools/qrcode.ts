import qrcode from 'qrcode';
import Jimp from 'jimp';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';

// 二维码logo路径  可以是jpg或png
const logoPath = join(process.cwd(), '/global/img/logo.png'); // logo图片路径

// 二维码生成
/**
 * @description:
 * @param {string} text 二维码内容
 * @param {string} out 输出的二维码图片完整路径 jpg或png
 */
export default function qr(text: string, out: string) {
  return new Promise((resolve, reject) => {
    const qrText = text; // 二维码内容
    const outputPath = out; // 生成的二维码图片路径

    return qrcode.toDataURL(
      qrText,
      {
        // 二维码容错率
        // L (Low)	~7%
        // M (Medium)	~15%
        // Q (Quartile)	~25%
        // H (High)	~30%
        errorCorrectionLevel: 'H',
        // 二维码白边
        margin: 2,
        // 二维码宽度
        width: 500,
        // 二维码颜色
        color: {
          dark: '#223d5b',
          light: '#FFFFFFFF'
        }
      },
      async (err, qrDataURL) => {
        if (err) {
          reject(false);
          return;
        }
        // 读取logo信息
        const logoImage = await Jimp.read(logoPath).catch(err_1 => {
          resolve(false);
          throw err_1;
        });
        // 读取二维码信息
        const qrJimp = await Jimp.read(Buffer.from(qrDataURL.split(',')[1], 'base64')).catch(err_2 => {
          resolve(false);
          throw err_2;
        });
        // logo为整个图片的1/6
        const logoSize = Math.min(qrJimp.bitmap.width, qrJimp.bitmap.height) / 6;
        //  调整logo大小
        logoImage.resize(logoSize, logoSize);
        // 二维码居中
        const x = (qrJimp.bitmap.width - logoImage.bitmap.width) / 2;
        const y = (qrJimp.bitmap.height - logoImage.bitmap.height) / 2;
        //  合成二维码
        qrJimp.composite(logoImage, x, y);
        // 创建存放二维码文件夹
        mkdirSync(dirname(outputPath), { recursive: true });
        // 写入最终生成的二维码图像文件
        qrJimp.write(outputPath, err_3 => {
          if (err_3) reject(false);
          return resolve(true);
        });
      }
    );
  });
}
