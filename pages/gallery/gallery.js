const { metaStore, loadMeta } = require("../../lib/core/meta.js");
const { easterEggs } = require("../../lib/model/easter_eggs.js");
const { endings } = require("../../lib/model/endings");
const { STATIC_BASE_URL } = require("../../lib/utils/backgrounds");

Page({
  data: {
    eggs: [],
    endings: [],
    unlockedCount: 0,
    unlockedEndingsCount: 0,
    selectedEgg: null,
    showModal: false,
    currentTab: "items", // 'items' or 'endings'
  },

  onLoad() {
    // No specific initialization needed for now
  },

  onShow() {
    loadMeta(); // 确保最新数据
    this.initEggs();
    this.initEndings();
  },

  initEggs() {
    const unlocked = metaStore.data.unlockedEggs || [];
    const eggsList = Object.values(easterEggs).map((egg) => ({
      ...egg,
      unlocked: unlocked.includes(egg.id),
    }));

    this.setData({
      eggs: eggsList,
      unlockedCount: unlocked.length,
    });
  },

  initEndings() {
    const unlocked = metaStore.data.unlockedEndings || [];

    const endingsList = Object.values(endings).map((ending) => ({
      ...ending,
      unlocked: unlocked.includes(ending.id),
    }));

    this.setData({
      endings: endingsList,
      unlockedEndingsCount: unlocked.length,
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
    });
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({
          url: "/pages/index/index",
        });
      },
    });
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    const egg = this.data.eggs.find((i) => i.id === id);

    if (egg && egg.unlocked) {
      this.setData({
        selectedEgg: egg,
        showModal: true,
      });
    } else {
      wx.showToast({
        title: "尚未发现此物品",
        icon: "none",
      });
    }
  },

  onEndingTap(e) {
    const id = e.currentTarget.dataset.id;
    const ending = this.data.endings.find((i) => i.id === id);

    if (ending && ending.unlocked) {
      // For endings, we might not need a modal if the card shows enough info,
      // or we can reuse the modal to show the full description if it's long.
      // For now, let's just let the card display the info.
      // If we *do* want a modal, we can set selectedEgg (reused as selectedItem)
      // but the WXML modal expects an icon/story structure.
      // Let's keep it simple: clicking an unlocked ending does nothing or maybe a small visual feedback.
    } else {
      wx.showToast({
        title: "尚未达成此结局",
        icon: "none",
      });
    }
  },

  closeModal() {
    this.setData({
      selectedEgg: null,
      showModal: false,
    });
  },

  stopProp() {}, // 防止点击内容关闭弹窗
});
