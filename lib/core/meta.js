/**
 * Meta Store - 全局成就与存档管理
 * 使用自建 Store 类替代 Pinia
 */
const { Store } = require("../store/store.js");

// 创建 metaStore 实例
const metaStore = new Store();

// 初始状态
metaStore.data = {
  runCount: 0,
  unlockedEndings: [],
  unlockedRoles: [],
  runHistory: [],
  tutorialFlags: {
    hasSeenNightTip: false,
    hasSeenOverloadTip: false,
  },

  // 计算属性
  totalEndingsUnlocked() {
    return this.unlockedEndings.length;
  },
};

// ==================== Actions ====================

/**
 * 从本地存储加载 Meta 数据
 */
function loadMeta() {
  try {
    const saved = wx.getStorageSync("braving_aotai_meta_v1");
    if (saved) {
      metaStore.data.runCount = saved.runCount || 0;
      metaStore.data.unlockedEndings = saved.unlockedEndings || [];
      metaStore.data.unlockedRoles = saved.unlockedRoles || [];
      metaStore.data.runHistory = saved.runHistory || [];
      metaStore.data.tutorialFlags = saved.tutorialFlags || {
        hasSeenNightTip: false,
        hasSeenOverloadTip: false,
      };
      metaStore.update();
    }
  } catch (e) {
    console.error("Failed to load meta", e);
  }
}

/**
 * 保存 Meta 数据到本地存储
 */
function saveMeta() {
  try {
    const data = {
      runCount: metaStore.data.runCount,
      unlockedEndings: metaStore.data.unlockedEndings,
      unlockedRoles: metaStore.data.unlockedRoles,
      runHistory: metaStore.data.runHistory,
      tutorialFlags: metaStore.data.tutorialFlags,
    };
    wx.setStorageSync("braving_aotai_meta_v1", data);
  } catch (e) {
    console.error("Failed to save meta", e);
  }
}

/**
 * 标记教程已查看
 */
function markTutorialSeen(flag) {
  if (!metaStore.data.tutorialFlags[flag]) {
    metaStore.data.tutorialFlags[flag] = true;
    metaStore.update();
    saveMeta();
  }
}

/**
 * 增加游戏次数
 */
function incrementRun() {
  metaStore.data.runCount++;
  metaStore.update();
  saveMeta();
}

/**
 * 解锁结局
 */
function unlockEnding(endingId) {
  if (!endingId) return;

  if (!metaStore.data.unlockedEndings.includes(endingId)) {
    metaStore.data.unlockedEndings.push(endingId);
    metaStore.update();
    saveMeta();
    wx.showToast({
      title: "解锁新结局！",
      icon: "success",
    });
  }

  // 检查关联解锁
  checkRefUnlock(endingId);
}

/**
 * 解锁角色
 */
function unlockRole(roleId) {
  if (!metaStore.data.unlockedRoles.includes(roleId)) {
    metaStore.data.unlockedRoles.push(roleId);
    metaStore.update();
    saveMeta();
    setTimeout(() => {
      wx.showToast({
        title: "解锁新角色！",
        icon: "none",
      });
    }, 1500);
  }
}

/**
 * 检查关联解锁
 */
function checkRefUnlock(endingId) {
  // 达成任意结局解锁退伍军人
  if (endingId) {
    unlockRole("veteran");
  }
  // 达成成功穿越解锁挑夫
  if (endingId && endingId.startsWith("end_success")) {
    unlockRole("porter");
  }
}

/**
 * 添加游戏记录
 */
function addRun(runData) {
  if (!runData) return;

  metaStore.data.runHistory.unshift(runData);
  // 最多保留10条记录
  if (metaStore.data.runHistory.length > 10) {
    metaStore.data.runHistory.pop();
  }
  metaStore.update();
  saveMeta();
  console.log("Run added:", runData);
}

/**
 * 重置所有 Meta 数据
 */
function resetMeta() {
  metaStore.data.runCount = 0;
  metaStore.data.unlockedEndings = [];
  metaStore.data.unlockedRoles = [];
  metaStore.data.runHistory = [];
  metaStore.data.tutorialFlags = {
    hasSeenNightTip: false,
    hasSeenOverloadTip: false,
  };
  metaStore.update();
  saveMeta();
}

/**
 * 检查结局是否已解锁
 */
function isEndingUnlocked(endingId) {
  return metaStore.data.unlockedEndings.includes(endingId);
}

/**
 * 检查角色是否已解锁
 */
function isRoleUnlocked(roleId) {
  return metaStore.data.unlockedRoles.includes(roleId);
}

module.exports = {
  metaStore,
  loadMeta,
  saveMeta,
  markTutorialSeen,
  incrementRun,
  unlockEnding,
  unlockRole,
  addRun,
  resetMeta,
  isEndingUnlocked,
  isRoleUnlocked,
};
