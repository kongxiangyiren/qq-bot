import './lib/tools/console'; // console只能放在程序开头
import bot from './lib/bot';
import { join } from 'path';

const QQBot = new bot({
  ROOT_PATH: join(__dirname, '..')
});

QQBot.run();
