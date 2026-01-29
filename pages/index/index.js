// pages/index/index.js
const { gameStore, loadGame, initGame } = require("../../lib/core/game.js");
const { metaStore, loadMeta } = require("../../lib/core/meta.js");
const audio = require("../../lib/utils/audio.js");
const { STATIC_BASE_URL } = require("../../lib/utils/backgrounds.js");

Page({
  data: {
    snowflakes: [],
    hasSave: false,
    showRestartModal: false,
    isMusicOn: false,
    showInfoModal: false,
    modalTitle: "",
    modalContent: "",
    $game: null,
    bgImage: "",
  },

  onLoad(option) {
    this.goin(option);
    this.setData({
      bgImage: `${STATIC_BASE_URL}/back_ground.png`,
    });

    // 生成雪花
    this.generateSnowflakes();

    // 绑定 store
    gameStore.bind(this, "$game");
    metaStore.bind(this, "$meta");

    // 加载 meta 数据
    loadMeta();

    // 初始化音频
    audio.initAudio();

    const sysInfo = wx.getSystemInfoSync();

    this.setData({
      isMusicOn: audio.getMusicStatus(),
      statusBarHeight: sysInfo.statusBarHeight,
    });
  },

  onShow() {
    // 检查是否有存档
    const saved = wx.getStorageSync("braving_aotai_save_v1");
    this.setData({
      hasSave: !!(saved && saved.currentSceneId),
      isMusicOn: audio.getMusicStatus(),
    });
  },

  onUnload() {
    gameStore.unbind(this);
    metaStore.unbind(this);
  },

  /**
   * 生成雪花数据
   */
  generateSnowflakes() {
    const snowflakes = [];
    for (let i = 0; i < 25; i++) {
      snowflakes.push({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 10,
        size: 4 + Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }
    this.setData({ snowflakes });
  },

  /**
   * 切换音乐
   */
  toggleMusic() {
    const isMusicOn = audio.toggleMusic();
    this.setData({ isMusicOn });
  },

  /**
   * 开始游戏
   */
  onStartGame() {
    if (this.data.hasSave) {
      // 有存档时显示确认弹窗
      this.setData({ showRestartModal: true });
    } else {
      // 无存档直接进入角色选择
      wx.navigateTo({
        url: "/pages/character/character",
      });
    }
  },

  /**
   * 继续游戏
   */
  onContinueGame() {
    if (loadGame()) {
      wx.navigateTo({
        url: "/pages/game/game",
      });
    } else {
      wx.showToast({
        title: "存档丢失或损坏",
        icon: "none",
      });
      this.setData({ hasSave: false });
    }
  },

  /**
   * 结局图鉴
   */
  /**
   * 结局图鉴
   */
  onOpenGallery() {
    wx.navigateTo({
      url: "/pages/gallery/gallery",
    });
  },

  /**
   * 用户服务协议
   */
  onShowServiceAgreement() {
    this.setData({
      showInfoModal: true,
      modalTitle: "用户服务协议",
      modalContent: `本应用为户外安全教育工具，旨在提高用户的户外安全意识。

1. 风险提示
本游戏模拟了高海拔徒步的风险场景，包括但不限于失温、滑坠、迷路等。游戏中的生存机制（如体温、体力、水分）旨在模拟真实生理反应，但不可作为现实生存的绝对依据。

2. 免责声明
本游戏内容仅供娱乐和教育。开发者不对用户在现实生活中模仿游戏行为导致的任何后果负责。户外活动具有固有风险，请在专业指导下进行。

3. 内容规范
用户不得利用本游戏传播违法违规信息。

4. 知识产权
本游戏的所有素材、文本、代码均受版权保护。`,
    });
  },

  /**
   * 隐私政策
   */
  onShowPrivacyPolicy() {
    this.setData({
      showInfoModal: true,
      modalTitle: "隐私政策",
      modalContent: `信息收集：仅收集游戏进度、成就等必要数据以提供游戏服务。

1. 数据收集范围
- 游戏进度：包括当前关卡、角色状态、物品栏等，用于存档功能。
- 成就数据：用于记录您的游戏里程碑。
- 设置偏好：如通过音乐开关设置的状态。

2. 数据存储
所有数据仅存储在您的设备本地（微信小程序本地缓存）。我们不搭建服务器，不上传您的任何个人数据。

3. 权限使用
- 音频播放：用于播放背景音乐和音效。
- 用户信息：本游戏不获取您的微信昵称、头像等个人信息。

4. 第三方服务
本游戏基于微信小程序平台运行，相关基础设施由腾讯提供。`,
    });
  },

  onCloseInfoModal() {
    this.setData({ showInfoModal: false });
  },

  /**
   * 取消重新开始
   */
  onCancelRestart() {
    this.setData({ showRestartModal: false });
  },

  /**
   * 确认重新开始
   */
  onConfirmRestart() {
    this.setData({ showRestartModal: false });
    wx.navigateTo({
      url: "/pages/character/character",
    });
  },

  goin(options) {
    const { targetPage } = options;
    if (targetPage) {
      // 提取除了 targetPage 之外的其他所有参数
      const queryParams = Object.keys(options)
        .filter((key) => key !== "targetPage")
        .map((key) => `${key}=${options[key]}`)
        .join("&");

      const finalUrl = `${targetPage}?${queryParams}`;

      // 使用 reLaunch 或 navigateTo 跳转
      wx.navigateTo({
        url: finalUrl,
        fail: () => {
          // 如果跳转失败（比如路径不对），就留在首页
          wx.showToast({ title: "页面路径错误", icon: "none" });
        },
      });
    }
  },
});
