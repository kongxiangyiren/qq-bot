import { green, red, yellow } from 'kolorist';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'yaml';
import prompts from 'prompts';
import { AvailableIntentsEventsEnum } from 'qq-guild-bot';

// 检查配置
export default async function check() {
  const file = join(process.cwd(), '/config/config.yaml');
  if (existsSync(file)) {
    const config = parse(readFileSync(file, 'utf-8'));

    if (config && config.config && config.config.appID && config.config.token) {
      return config;
    }
  }
  console.log(yellow('请按提示输入，生成配置文件config.yaml，输入错误【Ctrl+c】结束重来'));
  console.log(yellow('注册机器人：https://q.qq.com ，教程：https://support.qq.com/products/396585/faqs-more/'));

  let result: prompts.Answers<'appID' | 'token' | 'type' | 'pass'>;

  try {
    result = await prompts(
      [
        {
          type: 'text',
          name: 'appID',
          message: green('请输入appID: '),
          validate: value => (value !== '' && typeof value === 'string' ? true : '请输入appID')
        },
        {
          type: 'text',
          name: 'token',
          message: green('请输入token: '),
          validate: value => (value !== '' && typeof value === 'string' ? true : '请输入token')
        },
        {
          type: 'select',
          name: 'type',
          message: green('请选择机器人类型'),
          choices: [
            { title: '私域', value: '私域' },
            { title: '公域', value: '公域' }
          ]
        },
        {
          type: 'text',
          name: 'pass',
          message: green('请输入自定义一次性主人密码'),
          validate: value => (value !== '' && typeof value === 'string' ? true : '请输入自定义一次性主人密码')
        }
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' 操作被取消');
        }
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { appID, token, type, pass } = result;

  const config = {
    config: {
      appID,
      token,
      intents:
        type === '私域'
          ? [
              AvailableIntentsEventsEnum.GUILDS,
              AvailableIntentsEventsEnum.GUILD_MEMBERS,
              AvailableIntentsEventsEnum.GUILD_MESSAGES,
              AvailableIntentsEventsEnum.GUILD_MESSAGE_REACTIONS,
              AvailableIntentsEventsEnum.DIRECT_MESSAGE,
              AvailableIntentsEventsEnum.INTERACTION,
              AvailableIntentsEventsEnum.MESSAGE_AUDIT,
              AvailableIntentsEventsEnum.FORUMS_EVENT,
              AvailableIntentsEventsEnum.AUDIO_ACTION
            ]
          : [
              AvailableIntentsEventsEnum.GUILDS,
              AvailableIntentsEventsEnum.GUILD_MEMBERS,
              AvailableIntentsEventsEnum.GUILD_MESSAGE_REACTIONS,
              AvailableIntentsEventsEnum.DIRECT_MESSAGE,
              AvailableIntentsEventsEnum.INTERACTION,
              AvailableIntentsEventsEnum.MESSAGE_AUDIT,
              AvailableIntentsEventsEnum.AUDIO_ACTION,
              AvailableIntentsEventsEnum.PUBLIC_GUILD_MESSAGES
            ],
      sandbox: false
    },
    master: {
      pass
    }
  };

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, stringify(config));
  console.log(green(`生成配置文件成功`));
  console.log(green(`其他配置请打开${file}修改`));

  return config;
}
