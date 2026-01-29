// 设置所有页面可分享
// 保存原始的 Page 构造函数
const originalPage = Page;

// 重写 Page
Page = function (pageConfig) {
  // 1. 自动注入：发送给朋友
  if (!pageConfig.onShareAppMessage) {
    pageConfig.onShareAppMessage = function () {
      return {
        title: "坚持不懈，你一定能成功！",
        path: "/pages/index/index", // 统一跳回首页
      };
    };
  }

  // 2. 自动注入：分享到朋友圈 (点亮第二个图标)
  if (!pageConfig.onShareTimeline) {
    pageConfig.onShareTimeline = function () {
      return {
        title: "坚持不懈，你一定能成功！",
        query: "from=timeline", // 朋友圈只能传 query
      };
    };
  }

  // 调用原始的 Page 构造函数
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
