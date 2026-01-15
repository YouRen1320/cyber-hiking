// pages/index/index.js
const { gameStore, loadGame, initGame } = require("../../lib/core/game.js");
const { metaStore, loadMeta } = require("../../lib/core/meta.js");

Page({
  data: {
    snowflakes: [],
    hasSave: false,
    showRestartModal: false,
    isMusicOn: false,
    $game: null,
  },

  onLoad() {
    // 生成雪花
    this.generateSnowflakes();

    // 绑定 store
    gameStore.bind(this, "$game");
    metaStore.bind(this, "$meta");

    // 加载 meta 数据
    loadMeta();
  },

  onShow() {
    // 检查是否有存档
    const saved = wx.getStorageSync("braving_aotai_save_v1");
    this.setData({
      hasSave: !!(saved && saved.currentSceneId),
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
    // TODO: 音频管理器稍后实现
    this.setData({
      isMusicOn: !this.data.isMusicOn,
    });
    wx.showToast({
      title: this.data.isMusicOn ? "音乐已开启" : "音乐已关闭",
      icon: "none",
    });
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
  onGallery() {
    wx.navigateTo({
      url: "/pages/gallery/gallery",
    });
  },

  /**
   * 关于游戏
   */
  onAbout() {
    wx.showToast({
      title: "致敬所有勇敢的攀登者",
      icon: "none",
    });
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
