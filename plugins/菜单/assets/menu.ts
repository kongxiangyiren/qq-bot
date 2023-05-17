export default {
  '指令示范效果': [
    {
      reg: '/test',
      desc: 'js插件触发',
      icon: 51
    },
    {
      reg: '/运行状态2 | /运行状态3',
      desc: '多个class使用',
      icon: 51
    }
  ],
  '原神相关': [
    {
      reg: '/原神壁纸',
      desc: '返回一张原神壁纸',
      icon: 64
    },
    {
      reg: '/原神黄历',
      desc: '返回原神黄历',
      icon: 61
    }
  ],
  '关键词列表(私域)': [
    {
      reg: '^/添加(.*)$',
      desc: '添加关键词,频道主权限',
      icon: 103
    },
    {
      reg: '^/删除(.*)$',
      desc: '删除关键词,频道主权限',
      icon: 31
    },
    {
      reg: '/关键词列表',
      desc: '查看关键词列表',
      icon: 89
    }
  ],
  '游戏插件': [
    {
      reg: '/咸鱼帮助',
      desc: '咸鱼帮助',
      icon: 69
    }
  ],
  '其他插件': [
    {
      reg: '/一言',
      desc: '一言',
      icon: 69
    },
    {
      reg: '/毒鸡汤',
      desc: '美味毒鸡汤',
      icon: 69
    },
    {
      reg: '/签到',
      desc: '每日签到',
      icon: 104
    },
    {
      reg: '/运行状态',
      desc: '返回运行状态',
      icon: 106
    },
    {
      reg: 'noCheck',
      desc: '@机器人 青云客',
      icon: 110
    },
    {
      reg: '/点赞',
      desc: '点赞本条评论或回复的评论',
      icon: 88
    },
    {
      reg: '/撤回',
      desc: '撤回回复的评论',
      icon: 71
    },
    {
      reg: '/查询天气',
      desc: '例: /查询天气 北京',
      icon: 72
    }
  ],
  '管理插件': [
    { reg: '/运行状态', desc: '查看运行状态', icon: 51 },
    { reg: '/重启', desc: '重启项目', icon: 51 },
    { reg: '/(强制)更新', desc: '更新项目', icon: 51 }
  ]
};
