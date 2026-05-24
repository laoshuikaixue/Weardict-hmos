# 腕上词典 (Weardict)

一款为华为鸿蒙轻量级智能穿戴设备打造的离线词典应用。无需网络连接，随时随地查词。

## 功能特性

- **离线词典** — 内置词典数据，完全离线使用，无需网络
- **双词典支持** — 内置词典 A（维克多词典，完整释义、例句、音标）和词典 B（覆盖范围广），查询失败时自动切换
- **英文键盘** — 支持英文 26 键输入，可切换拼音键盘和符号键盘
- **中文拼音输入** — 内置拼音字典，支持候选项选择
- **单词详情展示** — 展示单词、音标、词性、释义、例句及翻译
- **中文检索** — 支持输入中文查找对应单词，结果列表展示
- **生词本** — 将单词保存到单词笔记，方便复习
- **查询历史** — 自动记录查询历史，支持单条删除
- **屏幕常亮** — 阅读单词详情时可保持屏幕常亮
- **表冠旋转** — 所有列表页面支持表冠旋转操控
- **主题切换** — 支持纸色、黑色、白色三种主题
- **息屏保活** — 支持息屏状态下保持应用运行

## 目录结构

```
entry/src/main/js/default/
├── app.js                    # 应用生命周期管理
├── pages/                    # 页面
│   ├── index/                # 启动页
│   ├── home/                 # 主页
│   ├── search_keyboard/
│   │   └── english/          # 统一搜索键盘（英文/拼音切换）
│   ├── search_word/          # 词典查询引擎
│   ├── show_word/            # 单词详情展示
│   ├── settings/             # 设置页面
│   ├── history/              # 查询历史
│   ├── wordbook/             # 生词本
│   └── about/                # 关于页面
└── common/                   # 公共模块
    ├── router.js             # 页面路由管理器
    ├── common.js             # 全局参数传递
    ├── utils.js              # 工具函数
    ├── fs.js                 # 文件系统操作
    ├── wearengine.js         # WearEngine 通信
    ├── inputMethod.js        # 输入法核心
    ├── textlayout.js         # 文本排版引擎
    ├── Light.js              # 屏幕常亮控制
    ├── dict/                 # 词典数据文件 (.bin)
    └── image/                # 键盘图标资源
```

## 开源协议

本项目基于 [Wrist Dictionary Non-Commercial License v1.0](LICENSE.md) 协议发布，仅限非商业用途使用。

## 开源感谢

本项目开发过程中参考或使用了以下开源项目与资源，在此表示感谢：

- [LiteWearable_Tools](https://github.com/alone-86/LiteWearable_Tools)
- [LiteWearable_InputMethod](https://github.com/alone-86/LiteWearable_InputMethod)
- Dictionary icons created by Freepik
