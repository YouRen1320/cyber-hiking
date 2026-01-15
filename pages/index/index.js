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
    showAboutModal: false,
    $game: null,
    bgImage: "",
  },

  onLoad() {
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
   * 关于游戏
   */
  onShowAbout() {
    this.setData({ showAboutModal: true });
  },

  onCloseAbout() {
    this.setData({ showAboutModal: false });
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
});
