// pages/journal/journal.js
const { metaStore, loadMeta } = require("../../lib/core/meta.js");

Page({
  data: {
    runHistory: [],
  },

  onLoad() {
    loadMeta();
    metaStore.bind(this, "$meta");
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  onUnload() {
    metaStore.unbind(this);
  },

  loadHistory() {
    const history = metaStore.data.runHistory || [];
    const runHistory = history.map((run) => {
      const date = new Date(run.date);
      return {
        ...run,
        dateStr: `${
          date.getMonth() + 1
        }/${date.getDate()} ${date.getHours()}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`,
      };
    });

    this.setData({ runHistory });
  },

  onBack() {
    wx.navigateBack();
  },
});
