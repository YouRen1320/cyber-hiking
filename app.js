// 设置所有页面可分享
const originalPage = Page;
Page = function (pageConfig) {
  // 如果页面没定义分享函数，我们就给它补一个默认的
  if (!pageConfig.onShareAppMessage) {
    pageConfig.onShareAppMessage = function () {
      return {
        title: "坚持不懈，你一定能成功！",
        path: "/pages/index/index",
      };
    };
  }
  return originalPage(pageConfig);
};

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 登录
    wx.login({
      success: (res) => {},
    });
  },
  globalData: {
    userInfo: null,
  },
});
