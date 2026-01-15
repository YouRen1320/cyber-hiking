// pages/character/character.js
const { gameStore, initGame } = require("../../lib/core/game.js");
const {
  metaStore,
  loadMeta,
  isRoleUnlocked,
} = require("../../lib/core/meta.js");
const { roles } = require("../../lib/model/roles.js");
const { items } = require("../../lib/model/items.js");
const { preloadCoreImages } = require("../../lib/utils/backgrounds.js");

Page({
  data: {
    roleList: [],
    currentIndex: 0,
    isTransitioning: false,
    isCurrentLocked: false,
    loadingProgress: 0,
    loadingText: "正在前往登山口...",
  },

  onLoad() {
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

    // 静默预加载分包
    this.preloadSubpackages();
  },

  /**
   * 预加载分包
   */
  preloadSubpackages() {
    const pkgs = [
      "pkg1",
      "pkg2",
      "pkg3",
      "pkg4",
      "pkg5",
      "pkg6",
      "pkg7",
      "pkg8",
      "pkg9",
      "pkg10",
    ];

    pkgs.forEach((name) => {
      if (wx.loadSubpackage) {
        wx.loadSubpackage({
          name: name,
          fail: (res) => {
            console.warn(`Preload ${name} failed:`, res);
          }, // 静默加载，不阻塞用户
        });
      }
    });
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
   * 确认选择
   */
  onConfirmSelection() {
    if (this.data.isTransitioning) return;

    const currentRole = this.data.roleList[this.data.currentIndex];

    if (currentRole.isLocked) {
      wx.showToast({
        title: "该角色尚未解锁",
        icon: "none",
      });
      return;
    }

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
      console.error("Error in confirmSelection:", err);
      this.setData({ isTransitioning: false });
    }
  },
});
