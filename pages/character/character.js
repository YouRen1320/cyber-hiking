// pages/character/character.js
const { gameStore, initGame } = require("../../lib/core/game.js");
const {
  metaStore,
  loadMeta,
  isRoleUnlocked,
} = require("../../lib/core/meta.js");
const { roles } = require("../../lib/model/roles.js");
const { items } = require("../../lib/model/items.js");
const {
  preloadCoreImages,
  STATIC_BASE_URL,
} = require("../../lib/utils/backgrounds.js");

Page({
  data: {
    roleList: [],
    currentIndex: 0,
    isTransitioning: false,
    isCurrentLocked: false,
    loadingProgress: 0,
    loadingText: "正在前往登山口...",
    showGuide: false,
    bgImage: "",
  },

  onLoad() {
    this.setData({
      bgImage: `${STATIC_BASE_URL}/back_ground.png`,
    });

    // 加载 meta 数据
    loadMeta();

    // 绑定 store
    metaStore.bind(this, "$meta");

    // 处理角色列表
    this.processRoles();

    // 找到第一个可选角色
    const firstUnlockedIndex = roles.findIndex(
      (role) => !role.locked || isRoleUnlocked(role.id)
    );
    this.setData({
      currentIndex: firstUnlockedIndex >= 0 ? firstUnlockedIndex : 0,
    });

    this.updateLockedStatus();
  },

  onShow() {
    this.setData({ isTransitioning: false });
    this.processRoles();
    this.updateLockedStatus();
  },

  onUnload() {
    metaStore.unbind(this);
  },

  /**
   * 处理角色列表
   */
  processRoles() {
    const roleList = roles.map((role) => {
      // 获取物品名称
      const itemNames = role.items.map((itemId) => {
        return items[itemId] ? items[itemId].name : "未知物品";
      });

      // 检查是否锁定
      const isLocked = role.locked && !isRoleUnlocked(role.id);

      return {
        ...role,
        itemNames,
        isLocked,
      };
    });

    this.setData({ roleList });
  },

  /**
   * 更新当前角色锁定状态
   */
  updateLockedStatus() {
    const currentRole = this.data.roleList[this.data.currentIndex];
    this.setData({
      isCurrentLocked: currentRole ? currentRole.isLocked : false,
    });
  },

  /**
   * 轮播切换
   */
  onSwiperChange(e) {
    this.setData({
      currentIndex: e.detail.current,
    });
    this.updateLockedStatus();
  },

  /**
   * 显示玩法指南
   */
  onShowGuide() {
    if (this.data.isTransitioning) return;

    const currentRole = this.data.roleList[this.data.currentIndex];

    // 检查角色是否锁定
    if (currentRole.isLocked) {
      wx.showToast({
        title: "该角色尚未解锁",
        icon: "none",
      });
      return;
    }

    // 显示指南弹窗
    this.setData({ showGuide: true });
  },

  /**
   * 开始游戏 (确认指南后)
   */
  onStartGame() {
    // 关闭弹窗
    this.setData({ showGuide: false });

    // 再次检查防止重复点击
    if (this.data.isTransitioning) return;

    const currentRole = this.data.roleList[this.data.currentIndex];

    try {
      // 初始化游戏
      initGame(currentRole.id);

      this.setData({
        isTransitioning: true,
        loadingProgress: 0,
        loadingText: "正在前往登山口...",
      });

      // 预加载核心图片
      preloadCoreImages((loaded, total) => {
        const progress = Math.floor((loaded / total) * 100);
        this.setData({
          loadingProgress: progress,
          loadingText: "加载资源中...",
        });
      }).then(() => {
        // 加载完成，跳转到游戏页面
        this.setData({ loadingText: "准备就绪!" });
        setTimeout(() => {
          wx.navigateTo({
            url: "/pages/game/game",
            fail: (err) => {
              console.error("Navigation failed:", err);
              this.setData({ isTransitioning: false });
            },
          });
        }, 300);
      });
    } catch (err) {
      console.error("Error in onStartGame:", err);
      this.setData({ isTransitioning: false });
    }
  },
});
