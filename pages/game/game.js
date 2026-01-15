// pages/game/game.js
const {
  gameStore,
  getCurrentScene,
  handleChoice,
  useItem,
  unequipItem,
  saveGame,
} = require("../../lib/core/game.js");
const { metaStore } = require("../../lib/core/meta.js");
const { weatherData } = require("../../lib/model/weather.js");
const { getBgImage } = require("../../lib/utils/backgrounds.js");

Page({
  data: {
    $game: null,
    currentScene: null,
    displayedText: "",
    isTyping: false,
    showInventory: false,
    showDamageFlash: false,
    isLowSanity: false,
    isNight: false,
    hasVision: true,
    weatherIcon: "☀",
    bgImage: "/static_pkg10/assets/back_ground.png",
    visualStyle: "",
    filteredChoices: [],
    currentLoad: 0,
    glitchChars: [],
    isChoiceProcessing: false,
  },

  // 打字机相关
  typewriterTimer: null,
  fullText: "",
  charIndex: 0,

  onLoad() {
    // 绑定 store
    gameStore.bind(this, "$game");
    metaStore.bind(this, "$meta");

    // 初始化场景
    this.updateScene();
  },

  onShow() {
    this.updateScene();
  },

  onUnload() {
    gameStore.unbind(this);
    metaStore.unbind(this);
    this.stopTypewriter();
  },

  onHide() {
    saveGame();
  },

  /**
   * 更新场景
   */
  updateScene() {
    const scene = getCurrentScene();
    const status = gameStore.data.status;
    const weather = gameStore.data.weather;
    const weatherInfo = weatherData[weather];

    // 计算视觉效果
    const sanity = status.sanity;
    let visualStyle = "";
    if (sanity < 60) {
      const grayscale = (60 - sanity) / 60;
      const blur = sanity < 30 ? (30 - sanity) / 10 : 0;
      const hueRotate = sanity < 30 ? (30 - sanity) * 2 : 0;
      visualStyle = `filter: grayscale(${grayscale}) blur(${blur}px) hue-rotate(${hueRotate}deg);`;
    }

    // 过滤选项
    const filteredChoices = this.filterChoices(scene.choices || []);

    // 生成低理智故障字符
    const glitchChars = [];
    if (sanity <= 30) {
      const chars = "!@#$%^&*()_+-={}[]|;:,.<>?/☠️❌";
      for (let i = 0; i < 20; i++) {
        glitchChars.push({
          char: chars[Math.floor(Math.random() * chars.length)],
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 40 + 20,
          opacity: Math.random(),
          rotate: Math.random() * 360,
        });
      }
    }

    // 计算负重
    let load = 0;
    gameStore.data.inventory.forEach((item) => (load += item.weight || 0));
    Object.values(gameStore.data.equipment).forEach((item) => {
      if (item) load += item.weight || 0;
    });

    this.setData({
      currentScene: scene,
      isNight: status.isNight,
      hasVision: gameStore.data.hasVision(),
      isLowSanity: sanity <= 30,
      weatherIcon: weatherInfo ? weatherInfo.icon : "☀",
      bgImage: getBgImage(scene.bg),
      visualStyle,
      filteredChoices,
      currentLoad: load.toFixed(1),
      glitchChars,
    });

    // 启动打字机效果
    this.startTypewriter(scene.text);
  },

  /**
   * 过滤选项
   */
  filterChoices(choices) {
    const roleId = gameStore.data.player.roleId;
    const worldFlags = gameStore.data.worldFlags;

    return choices
      .filter((choice) => {
        // 职业限制
        if (choice.requiredRole && choice.requiredRole !== roleId) {
          return false;
        }
        // 条件检查
        if (choice.condition) {
          if (choice.condition.startsWith("!")) {
            if (worldFlags[choice.condition.slice(1)]) return false;
          } else if (choice.condition.startsWith("hasItem:")) {
            const itemId = choice.condition.slice(8);
            if (!gameStore.data.inventory.some((item) => item.id === itemId))
              return false;
          } else {
            if (!worldFlags[choice.condition]) return false;
          }
        }
        return true;
      })
      .map((choice) => {
        // 处理低理智文字扭曲
        let displayText = choice.text;
        if (gameStore.data.status.sanity <= 30) {
          displayText = this.corruptText(
            choice.text,
            gameStore.data.status.sanity
          );
        }
        return { ...choice, displayText };
      });
  },

  /**
   * 文字扭曲
   */
  corruptText(text, sanity) {
    if (sanity > 50) return text;
    const corruptionRate = (50 - sanity) / 100;
    const chars = "!@#$%^&*()_+-=☠️❌💀";
    return text
      .split("")
      .map((char) => {
        if (Math.random() < corruptionRate && char !== " ") {
          return chars[Math.floor(Math.random() * chars.length)];
        }
        return char;
      })
      .join("");
  },

  /**
   * 启动打字机效果
   */
  startTypewriter(text) {
    this.stopTypewriter();
    this.fullText = text;
    this.charIndex = 0;
    this.setData({ displayedText: "", isTyping: true });

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.charIndex++;
        this.setData({
          displayedText: this.fullText.substring(0, this.charIndex),
        });
      } else {
        this.stopTypewriter();
      }
    }, 30);
  },

  /**
   * 停止打字机
   */
  stopTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    if (this.fullText) {
      this.setData({
        displayedText: this.fullText,
        isTyping: false,
      });
    }
  },

  /**
   * 点击故事区域
   */
  onStoryTap() {
    if (this.data.isTyping) {
      this.stopTypewriter();
    }
  },

  /**
   * 点击选项
   */
  onChoiceTap(e) {
    if (this.data.isTyping) {
      this.stopTypewriter();
      return;
    }

    if (this.data.isChoiceProcessing) return;

    const index = e.currentTarget.dataset.index;
    const choice = this.data.filteredChoices[index];

    if (!choice) return;

    this.setData({ isChoiceProcessing: true });

    // 记录当前HP用于受伤闪红
    const prevHp = gameStore.data.status.hp;

    // 处理选择
    handleChoice(choice);

    // 检查是否受伤
    if (gameStore.data.status.hp < prevHp) {
      this.setData({ showDamageFlash: true });
      setTimeout(() => {
        this.setData({ showDamageFlash: false });
      }, 300);
    }

    // 更新场景
    setTimeout(() => {
      this.updateScene();
      this.setData({ isChoiceProcessing: false });
    }, 100);
  },

  /**
   * 切换背包
   */
  toggleInventory() {
    this.setData({
      showInventory: !this.data.showInventory,
    });
  },

  /**
   * 阻止关闭
   */
  preventClose() {
    // 空函数，防止冒泡
  },

  /**
   * 使用物品
   */
  onUseItem(e) {
    const index = e.currentTarget.dataset.index;
    useItem(index);
    this.updateScene();
  },

  /**
   * 卸下装备
   */
  onUnequip(e) {
    const slot = e.currentTarget.dataset.slot;
    if (gameStore.data.equipment[slot]) {
      unequipItem(slot);
      this.updateScene();
    }
  },

  /**
   * 重新开始
   */
  onRestart() {
    wx.reLaunch({
      url: "/pages/character/character",
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },
});
