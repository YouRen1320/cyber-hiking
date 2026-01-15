// pages/gallery/gallery.js
const {
  metaStore,
  loadMeta,
  isEndingUnlocked,
} = require("../../lib/core/meta.js");

// 结局定义
const endingDefs = [
  { id: "end_success", name: "小鳌太完成", icon: "⛰️", desc: "安全走出无人区" },
  {
    id: "end_game_cleared",
    name: "大鳌太完成",
    icon: "🏆",
    desc: "完成全程穿越",
  },
  {
    id: "end_retreat",
    name: "明智下撤",
    icon: "🔙",
    desc: "保住性命，来日方长",
  },
  { id: "end_rescue", name: "获救", icon: "🚁", desc: "等待救援成功" },
  { id: "end_caught", name: "被捕", icon: "👮", desc: "被巡山队抓获" },
  { id: "end_lost_23km", name: "失踪", icon: "❓", desc: "迷失在23公里跑道" },
  { id: "end_hidden", name: "轮回", icon: "⌚", desc: "时间的秘密" },
  { id: "dead_001", name: "长眠大山", icon: "💀", desc: "成为大山的一部分" },
  { id: "dead_starve", name: "饥饿", icon: "🍽️", desc: "饥寒交迫" },
  { id: "dead_cold", name: "失温", icon: "❄️", desc: "温暖地睡去" },
  { id: "dead_sanity", name: "崩溃", icon: "🧠", desc: "理智归零" },
];

Page({
  data: {
    endings: [],
    unlockedCount: 0,
    totalCount: 0,
  },

  onLoad() {
    loadMeta();
    metaStore.bind(this, "$meta");
    this.loadEndings();
  },

  onShow() {
    this.loadEndings();
  },

  onUnload() {
    metaStore.unbind(this);
  },

  loadEndings() {
    const endings = endingDefs.map((def) => ({
      ...def,
      unlocked: isEndingUnlocked(def.id),
    }));

    const unlockedCount = endings.filter((e) => e.unlocked).length;

    this.setData({
      endings,
      unlockedCount,
      totalCount: endings.length,
    });
  },

  onBack() {
    wx.navigateBack();
  },
});
