/**
 * Game Store - 核心游戏状态管理
 * 使用自建 Store 类替代 Pinia
 */
const { Store } = require("../store/store.js");
const { items } = require("../model/items.js");
const { roles } = require("../model/roles.js");
const { weatherData } = require("../model/weather.js");
const meta = require("./meta.js");
const { scenes, randomEventIds } = require("../model/scenes_data.js");

// TODO: 音频管理器稍后迁移
// const { audioManager } = require('../utils/audio.js');

// 创建 gameStore 实例
const gameStore = new Store();

/**
 * 获取玩家特质（独立函数，避免计算属性时序问题）
 */
function getPlayerTraits() {
  const roleId = gameStore.data.player.roleId;
  if (!roleId) return [];
  const role = roles.find((r) => r.id === roleId);
  return role ? role.traits : [];
}

/**
 * 检查是否有夜间视野
 */
function hasVision() {
  if (!gameStore.data.status.isNight) return true;
  const headGear = gameStore.data.equipment.head;
  return headGear && headGear.id === "gear_headlamp_01";
}

/**
 * 获取装备总属性
 */
function getTotalStats() {
  let warmth = 0;
  let speed = 0;
  Object.values(gameStore.data.equipment).forEach((item) => {
    if (item && item.stats) {
      warmth += item.stats.warmth || 0;
      speed += item.stats.speed || 0;
    }
  });
  return { warmth, speed };
}

/**
 * 获取当前负重
 */
function getCurrentLoad() {
  let load = 0;
  gameStore.data.inventory.forEach((item) => {
    load += item.weight || 0;
  });
  Object.values(gameStore.data.equipment).forEach((item) => {
    if (item) {
      load += item.weight || 0;
    }
  });
  return parseFloat(load.toFixed(1));
}

// 初始状态
gameStore.data = {
  gameState: "idle", // idle | playing | ended
  currentSceneId: "start_001",
  nextSceneId: "",
  player: {
    name: "驴友",
    identity: "普通游客",
    days: 1,
    roleId: "student",
  },
  status: {
    hp: 100,
    hunger: 100,
    sanity: 100,
    maxHp: 100,
    maxHunger: 100,
    maxSanity: 100,
    maxLoad: 20,
    isNight: false,
  },
  inventory: [],
  equipment: { head: null, body: null, feet: null, hand: null },
  weather: "sunny",
  history: [],
  progress: 0,
  worldFlags: { shuiwozi_water: true, liang2_blocked: false },
  notification: { visible: false, message: "", type: "normal" },

  // ========== 计算属性 (函数形式) ==========

  /** 是否存活 */
  isAlive() {
    return this.status.hp > 0 && this.status.sanity > 0;
  },

  /** 当前天气信息 */
  currentWeatherInfo() {
    return weatherData[this.weather];
  },
};

// 通知计时器
let notificationTimer = null;

// ==================== Actions ====================

/**
 * 初始化游戏
 */
function initGame(roleId = "student") {
  // 加载并更新 Meta
  meta.loadMeta();
  meta.incrementRun();

  // 获取角色配置
  const role = roles.find((r) => r.id === roleId) || roles[0];

  // 初始化游戏状态
  gameStore.data.gameState = "playing";
  gameStore.data.currentSceneId = "start_001";
  gameStore.data.nextSceneId = "";
  gameStore.data.player.days = 1;
  gameStore.data.player.roleId = role.id;
  gameStore.data.player.identity = role.name;

  // 初始化状态
  gameStore.data.status = {
    hp: role.stats.maxHp,
    hunger: role.stats.maxHunger,
    sanity: role.stats.maxSanity,
    maxHp: role.stats.maxHp,
    maxHunger: role.stats.maxHunger,
    maxSanity: role.stats.maxSanity,
    maxLoad: role.traits.includes("strong_back") ? 30 : 20,
    isNight: false,
  };

  gameStore.data.progress = 0;
  gameStore.data.inventory = [];
  gameStore.data.equipment = { head: null, body: null, feet: null, hand: null };
  gameStore.data.weather = "sunny";
  gameStore.data.history = [`开始旅程: ${role.name}`];
  gameStore.data.notification = { visible: false, message: "", type: "normal" };

  // 初始化世界状态
  gameStore.data.worldFlags = {
    shuiwozi_water: Math.random() > 0.4,
    liang2_blocked: Math.random() > 0.8,
  };

  // 添加初始物品
  role.items.forEach((itemId) => gainItem(itemId));

  // 更新 Store
  gameStore.update();
  saveGame();

  // 特质提示
  if (getPlayerTraits().includes("strong_back")) {
    showNotification("天赋[铁背]生效：最大负重+10kg", "success");
  }

  console.log("Game Initialized with role:", role.name);
  console.log("World Flags:", gameStore.data.worldFlags);
}

/**
 * 获得物品
 */
function gainItem(itemId) {
  const item = items[itemId];
  if (!item) return;

  gameStore.data.inventory.push({ ...item });
  gameStore.update();

  if (
    gameStore.data.gameState === "playing" &&
    gameStore.data.history.length > 0
  ) {
    showNotification(`获得: ${item.name}`, "normal");
  }
}

/**
 * 使用物品
 */
function useItem(index) {
  const item = gameStore.data.inventory[index];
  if (!item) return;

  if (item.type === "gear" && item.slot) {
    // 装备物品
    equipItem(index);
  } else if (item.type === "consumable" && item.effect) {
    // 使用消耗品
    if (item.effect.hp) {
      gameStore.data.status.hp = Math.min(
        gameStore.data.status.maxHp,
        gameStore.data.status.hp + item.effect.hp
      );
    }
    if (item.effect.hunger) {
      gameStore.data.status.hunger = Math.min(
        gameStore.data.status.maxHunger,
        gameStore.data.status.hunger + item.effect.hunger
      );
    }
    if (item.effect.sanity) {
      gameStore.data.status.sanity = Math.min(
        gameStore.data.status.maxSanity,
        gameStore.data.status.sanity + item.effect.sanity
      );
    }

    let msg = item.effect.msg;

    // 医生特质加成
    if (
      getPlayerTraits().includes("field_medic") &&
      item.effect.hp &&
      item.effect.hp > 0
    ) {
      const bonus = Math.floor(0.5 * item.effect.hp);
      gameStore.data.status.hp = Math.min(
        gameStore.data.status.maxHp,
        gameStore.data.status.hp + bonus
      );
      msg += ` (医术加成+${bonus})`;
    }

    if (msg) {
      showNotification(msg, "success");
    }

    gameStore.data.inventory.splice(index, 1);
    gameStore.update();
    saveGame();
  } else {
    showNotification("暂时无法使用该物品", "negative");
  }
}

/**
 * 装备物品
 */
function equipItem(index) {
  const item = gameStore.data.inventory[index];
  if (!item || !item.slot) return;

  const slot = item.slot;
  const currentEquip = gameStore.data.equipment[slot];

  // 从背包移除
  gameStore.data.inventory.splice(index, 1);

  // 如果有旧装备，放回背包
  if (currentEquip) {
    gameStore.data.inventory.push(currentEquip);
  }

  // 装备新物品
  gameStore.data.equipment[slot] = item;
  gameStore.update();

  showNotification(`装备: ${item.name}`, "success");

  // 夜间装备提示
  if (
    gameStore.data.status.isNight &&
    !meta.metaStore.data.tutorialFlags.hasSeenNightTip
  ) {
    meta.markTutorialSeen("hasSeenNightTip");
    wx.showModal({
      title: "夜幕降临",
      content:
        "天黑后视野受限（探索成功率大幅下降）且气温骤降（失温风险剧增）。\n建议尽快寻找庇护所休息，或使用照明工具。",
      showCancel: false,
      confirmText: "我明白了",
    });
  }

  saveGame();
}

/**
 * 卸下装备
 */
function unequipItem(slot) {
  const item = gameStore.data.equipment[slot];
  if (!item) return;

  gameStore.data.equipment[slot] = null;
  gameStore.data.inventory.push(item);
  gameStore.update();

  showNotification(`卸下: ${item.name}`, "normal");
  saveGame();
}

/**
 * 随机天气
 */
function randomizeWeather() {
  const rand = Math.random();
  let newWeather;

  if (rand < 0.4) {
    newWeather = "sunny";
  } else if (rand < 0.7) {
    newWeather = "cloudy";
  } else if (rand < 0.85) {
    newWeather = "fog";
  } else if (rand < 0.95) {
    newWeather = "snow";
  } else {
    newWeather = "storm";
  }

  gameStore.data.weather = newWeather;
  gameStore.update();

  // 恶劣天气警告
  if (["storm", "snow"].includes(newWeather)) {
    const info = weatherData[newWeather];
    showNotification(`警告: ${info.name}`, "negative");
  }
}

/**
 * 保存游戏
 */
function saveGame() {
  try {
    const saveData = {
      gameState: gameStore.data.gameState,
      currentSceneId: gameStore.data.currentSceneId,
      nextSceneId: gameStore.data.nextSceneId,
      player: gameStore.data.player,
      status: gameStore.data.status,
      inventory: gameStore.data.inventory,
      equipment: gameStore.data.equipment,
      weather: gameStore.data.weather,
      history: gameStore.data.history,
      progress: gameStore.data.progress,
      worldFlags: gameStore.data.worldFlags,
    };
    wx.setStorageSync("braving_aotai_save_v1", saveData);
  } catch (e) {
    console.error("Save failed", e);
  }
}

/**
 * 加载游戏
 */
function loadGame() {
  try {
    const saved = wx.getStorageSync("braving_aotai_save_v1");
    if (saved && saved.currentSceneId) {
      gameStore.data.gameState = saved.gameState;
      gameStore.data.currentSceneId = saved.currentSceneId;
      gameStore.data.nextSceneId = saved.nextSceneId || "";
      gameStore.data.player = saved.player;
      gameStore.data.status = saved.status;

      // 兼容旧存档
      if (gameStore.data.status.sanity === undefined)
        gameStore.data.status.sanity = 100;
      if (gameStore.data.status.maxSanity === undefined)
        gameStore.data.status.maxSanity = 100;
      if (gameStore.data.status.maxLoad === undefined)
        gameStore.data.status.maxLoad = 20;
      if (gameStore.data.status.isNight === undefined)
        gameStore.data.status.isNight = false;
      if (gameStore.data.player.roleId === undefined)
        gameStore.data.player.roleId = "student";

      gameStore.data.inventory = saved.inventory || [];
      gameStore.data.equipment = saved.equipment || {
        head: null,
        body: null,
        feet: null,
        hand: null,
      };
      gameStore.data.weather = saved.weather || "sunny";
      gameStore.data.history = saved.history || [];
      gameStore.data.progress = saved.progress || 0;
      gameStore.data.worldFlags = saved.worldFlags || {
        shuiwozi_water: true,
        liang2_blocked: false,
      };

      if (!gameStore.data.notification) {
        gameStore.data.notification = {
          visible: false,
          message: "",
          type: "normal",
        };
      }

      gameStore.update();
      console.log("Game Loaded");
      return true;
    }
  } catch (e) {
    console.error("Load failed", e);
  }
  return false;
}

/**
 * 清除存档
 */
function clearSave() {
  try {
    wx.removeStorageSync("braving_aotai_save_v1");
  } catch (e) {
    console.error("Clear save failed", e);
  }
}

/**
 * 显示通知
 */
function showNotification(message, type = "normal") {
  gameStore.data.notification = { visible: true, message, type };
  gameStore.update();

  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
  notificationTimer = setTimeout(() => {
    gameStore.data.notification.visible = false;
    gameStore.update();
  }, 2500);
}

/**
 * 检查是否拥有某物品
 */
function hasItem(itemId) {
  return gameStore.data.inventory.some((item) => item.id === itemId);
}

/**
 * 获取当前场景（带动态文本处理）
 */
function getCurrentScene() {
  const sceneId = gameStore.data.currentSceneId;
  const scene = scenes[sceneId] || scenes.start_001;
  let text = scene.text;

  // 角色特定文本
  if (
    scene.roleText &&
    gameStore.data.player.roleId &&
    scene.roleText[gameStore.data.player.roleId]
  ) {
    text = scene.roleText[gameStore.data.player.roleId];
  }
  // 天气特定文本
  else if (scene.weatherText && scene.weatherText[gameStore.data.weather]) {
    text = scene.weatherText[gameStore.data.weather];
  }

  return { ...scene, text };
}

/**
 * 处理玩家选择
 */
function handleChoice(choice) {
  gameStore.data.history.push(`选择: ${choice.text}`);

  // 应用消耗
  if (choice.cost) {
    applyCost(choice.cost);
  }

  // 执行动作
  if (choice.action) {
    handleAction(choice.action);
  }

  // 检查存活
  if (!checkSurvival()) {
    return;
  }

  // 跳转场景
  if (choice.target) {
    if (choice.target === "resume") {
      // 返回之前的场景
      if (gameStore.data.nextSceneId) {
        moveToScene(gameStore.data.nextSceneId);
        gameStore.data.nextSceneId = "";
      } else {
        console.error("No nextSceneId to resume to!");
        moveToScene("node_forest_entry");
      }
      return;
    }

    const targetScene = scenes[choice.target];
    const isSafe = targetScene && targetScene.safe === true;

    // 10% 概率触发随机事件（非安全区域）
    if (choice.target.startsWith("node_") && Math.random() < 0.1 && !isSafe) {
      gameStore.data.nextSceneId = choice.target;
      const randomEventId =
        randomEventIds[Math.floor(Math.random() * randomEventIds.length)];

      // 暴风雪事件特殊处理
      if (randomEventId === "evt_storm") {
        gameStore.data.weather = "storm";
      }

      if (scenes[randomEventId]) {
        moveToScene(randomEventId);
        showNotification("遭遇突发事件！", "negative");
      } else {
        console.error(`Random event scene not found: ${randomEventId}`);
        moveToScene(choice.target);
      }
    } else {
      // 正常跳转
      if (choice.target.startsWith("node_")) {
        randomizeWeather();
      }
      moveToScene(choice.target);
    }
  }
}

/**
 * 应用消耗
 */
function applyCost(cost) {
  const weatherInfo = weatherData[gameStore.data.weather];
  const costCoeff = weatherInfo.costCoeff;
  const stats = getTotalStats();

  // 饱食度消耗
  let hungerCost = (cost.hunger || 0) * costCoeff;

  // 超重惩罚
  const currentLoad = getCurrentLoad();
  const maxLoad = gameStore.data.status.maxLoad;

  if (
    currentLoad > maxLoad &&
    !meta.metaStore.data.tutorialFlags.hasSeenOverloadTip
  ) {
    meta.markTutorialSeen("hasSeenOverloadTip");
    wx.showModal({
      title: "背负超重",
      content: `你携带了过多的物品（${currentLoad.toFixed(
        1
      )} / ${maxLoad} kg）。\n超重会大幅增加体能消耗并降低移动速度。\n请丢弃不必要的物品或寻找更好的背包。`,
      showCancel: false,
      confirmText: "知道了",
    });
  }

  if (currentLoad > maxLoad) {
    hungerCost *= 1 + 0.1 * (currentLoad - maxLoad);
  }

  // 高代谢特质
  if (getPlayerTraits().includes("high_metabolism")) {
    hungerCost *= 1.25;
  }

  // 速度加成减少消耗
  if (stats.speed && stats.speed > 0) {
    hungerCost *= 1 - Math.min(0.5, stats.speed / 100);
  }

  gameStore.data.status.hunger = Math.max(
    0,
    gameStore.data.status.hunger - hungerCost
  );

  // 生命值消耗
  let hpCost = (cost.hp || 0) * costCoeff;

  // 天气造成的持续伤害
  if (weatherInfo.hpLeak) {
    let leak = weatherInfo.hpLeak;
    if (stats.warmth) {
      leak = Math.max(0, leak - 0.5 * stats.warmth);
    }
    hpCost += leak;
  }

  // 饥饿造成的伤害
  if (gameStore.data.status.hunger <= 0) {
    hpCost += 15;
    showNotification("饥饿难耐，生命流失！", "negative");
  }

  // 夜间无视野的摔伤风险
  if (
    gameStore.data.status.isNight &&
    !hasVision() &&
    ((cost.hp || 0) > 0 || (cost.hunger || 0) > 0)
  ) {
    let fallChance = 0.5;
    if (getPlayerTraits().includes("iron_will")) {
      fallChance = 0.25;
    }
    if (Math.random() < fallChance) {
      hpCost += 35;
      showNotification("摸黑赶路摔伤了！(-35HP)", "negative");
    }
  }

  gameStore.data.status.hp = Math.max(0, gameStore.data.status.hp - hpCost);

  // 理智消耗
  let sanityCost = cost.sanity || 0;

  // 恶劣天气影响理智
  if (["fog", "storm", "snow"].includes(gameStore.data.weather)) {
    if (
      getPlayerTraits().includes("ptsd_storm_calm") &&
      gameStore.data.weather === "storm"
    ) {
      sanityCost -= 5; // 退伍军人在暴风雪中反而冷静
    } else {
      sanityCost += 2;
    }
  }

  // 夜间无视野影响理智
  if (gameStore.data.status.isNight) {
    if (!hasVision()) {
      if (!getPlayerTraits().includes("iron_will")) {
        sanityCost += 5;
      }
    } else {
      // 有视野（手电筒），理智消耗减半
      sanityCost = Math.ceil(sanityCost * 0.5);
    }
  }

  gameStore.data.status.sanity = Math.max(
    0,
    gameStore.data.status.sanity - sanityCost
  );

  // 低理智警告
  if (gameStore.data.status.sanity <= 30) {
    showNotification("意识模糊，耳边传来幻听...", "negative");
  }

  gameStore.update();
}

/**
 * 处理动作
 */
function handleAction(action) {
  switch (action) {
    case "restart":
      wx.reLaunch({ url: "/pages/index/index" });
      break;

    case "rest":
      if (gameStore.data.status.hunger < 20) {
        showNotification("太饿了，根本睡不着！", "negative");
        return;
      }
      gameStore.data.status.hunger = Math.max(
        0,
        gameStore.data.status.hunger - 20
      );

      let hpRecover = 40;
      let sanityRecover = 20;

      // 检查帐篷
      const hasTent = hasItem("gear_tent_01");
      if (hasTent) {
        hpRecover = Math.floor(hpRecover * 1.5);
        sanityRecover = Math.floor(sanityRecover * 1.5);
      }

      if (gameStore.data.weather === "storm") {
        // 有帐篷暴风雪也能休息得不错，否则效果大减
        hpRecover = hasTent ? 40 : 15;
      }
      if (gameStore.data.weather === "sunny") hpRecover = 60;

      // 诅咒物品影响
      const hasWatch = hasItem("relic_watch");
      if (hasWatch) {
        showNotification("死者的手表在背包里滴答作响...你彻夜难眠", "negative");
        hpRecover = Math.floor(0.5 * hpRecover);
        gameStore.data.status.sanity = Math.max(
          0,
          gameStore.data.status.sanity - 10
        );
      } else {
        gameStore.data.status.sanity = Math.min(
          gameStore.data.status.maxSanity,
          gameStore.data.status.sanity + sanityRecover
        );
      }

      gameStore.data.status.hp = Math.min(
        gameStore.data.status.maxHp,
        gameStore.data.status.hp + hpRecover
      );
      gameStore.data.status.isNight = false;
      gameStore.data.player.days += 1;
      randomizeWeather();

      if (!hasWatch) {
        let msg = `休息一晚 (生命+${hpRecover}, 饱食-20)`;
        if (hasTent) msg += " [帐篷生效]";
        showNotification(msg, "success");
      }
      saveGame();
      break;

    case "loot_supplies":
      gainItem("food_001");
      gainItem("water_001");
      if (Math.random() > 0.3) gainItem("gear_headlamp_01");
      gameStore.data.status.sanity = Math.max(
        0,
        gameStore.data.status.sanity - 10
      );
      showNotification("获得物资 (理智-10)", "success");
      break;

    case "loot_supplies_big":
      gainItem("food_001");
      gainItem("food_001");
      gainItem("water_001");
      gainItem("water_001");
      showNotification("获得大量物资", "success");
      break;

    case "gain_item_flower":
      gainItem("special_flower");
      break;

    case "gain_item_water":
      gainItem("water_001");
      // 净水器效果：额外获得一瓶水
      if (hasItem("gear_water_filter")) {
        gainItem("water_001");
        showNotification("使用净水器过滤了额外的水", "success");
      }
      break;

    case "lose_food_water":
      const foodIdx = gameStore.data.inventory.findIndex(
        (item) => item.id === "food_001"
      );
      if (foodIdx > -1) gameStore.data.inventory.splice(foodIdx, 1);
      const waterIdx = gameStore.data.inventory.findIndex(
        (item) => item.id === "water_001"
      );
      if (waterIdx > -1) gameStore.data.inventory.splice(waterIdx, 1);
      showNotification("失去了部分食物和水", "normal");
      break;

    case "unlock_egg_pencil":
      meta.unlockEgg("egg_pencil");
      break;
    case "unlock_egg_film_box":
      meta.unlockEgg("egg_film_box");
      break;
    case "unlock_egg_bell":
      meta.unlockEgg("egg_bell");
      break;
    case "unlock_egg_postcard":
      meta.unlockEgg("egg_postcard");
      break;
    case "unlock_egg_compass":
      meta.unlockEgg("egg_compass");
      break;
    case "unlock_egg_walkman":
      meta.unlockEgg("egg_walkman");
      break;
    case "unlock_egg_bear":
      meta.unlockEgg("egg_bear");
      break;
    case "unlock_egg_coin":
      meta.unlockEgg("egg_coin");
      break;
    case "unlock_egg_flower_map":
      meta.unlockEgg("egg_flower_map");
      break;
    case "unlock_egg_spoon":
      meta.unlockEgg("egg_spoon");
      break;

    case "lose_random_item":
      if (gameStore.data.inventory.length > 0) {
        const randIdx = Math.floor(
          Math.random() * gameStore.data.inventory.length
        );
        const lostItem = gameStore.data.inventory[randIdx];
        gameStore.data.inventory.splice(randIdx, 1);
        showNotification(`失去了: ${lostItem.name}`, "negative");
      }
      break;

    case "restore_sanity_full":
      gameStore.data.status.sanity = gameStore.data.status.maxSanity;
      showNotification("理智完全恢复", "success");
      break;

    case "sos":
      gameStore.data.status.sanity = Math.max(
        0,
        gameStore.data.status.sanity - 15
      );
      let sosChance = 0.3;
      if (
        gameStore.data.currentSceneId.includes("village") ||
        gameStore.data.currentSceneId.includes("road")
      ) {
        sosChance = 0.9;
      }
      if (gameStore.data.weather === "storm") sosChance = 0;
      if (gameStore.data.weather === "fog") sosChance = 0.1;
      if (gameStore.data.weather === "snow") sosChance = 0.2;
      if (gameStore.data.status.isNight) sosChance *= 0.5;

      if (Math.random() < sosChance) {
        showNotification("求救信号发送成功！等待救援...", "success");
        setTimeout(() => {
          moveToScene("end_rescue");
        }, 1500);
      } else {
        showNotification("无信号 / 天气恶劣无法救援", "negative");
      }
      break;

    case "look_back":
      gameStore.data.status.sanity = Math.min(
        gameStore.data.status.maxSanity,
        gameStore.data.status.sanity + 5
      );
      showNotification("回望来路，内心平静了一些 (理智+5)", "success");
      break;

    case "check_gear":
      showNotification("背包状态良好，暂无异常", "normal");
      break;

    case "check_ice_risk":
      const load = gameStore.data.currentLoad();
      let failChance = 0.1;
      if (load > 15) {
        failChance += 0.15 * (load - 15);
      }
      failChance = Math.min(0.9, failChance);

      if (Math.random() < failChance) {
        gameStore.data.status.hp -= 40;
        gameStore.data.status.sanity -= 20;
        showNotification("冰面碎裂！落水重伤！", "negative");
        moveToScene("node_evt_ice_fail");
      } else {
        moveToScene("node_evt_ice_success");
      }
      break;

    case "discard_heavy":
      if (gameStore.data.inventory.length === 0) {
        showNotification("背包里没有东西可扔！", "negative");
        return;
      }
      let heaviestIdx = -1;
      let heaviestWeight = -1;
      gameStore.data.inventory.forEach((item, idx) => {
        if (item.weight > heaviestWeight) {
          heaviestWeight = item.weight;
          heaviestIdx = idx;
        }
      });
      if (heaviestIdx !== -1) {
        const discardedItem = gameStore.data.inventory[heaviestIdx];
        gameStore.data.inventory.splice(heaviestIdx, 1);
        showNotification(
          `扔掉了：${discardedItem.name} (${discardedItem.weight}kg)`,
          "normal"
        );
        moveToScene("node_evt_ice_discard_feedback");
      }
      break;

    case "die_cold":
      die("dead_cold");
      break;

    default:
      console.warn("Unknown action:", action);
  }

  gameStore.update();
}

/**
 * 移动到场景
 */
function moveToScene(sceneId) {
  if (!scenes[sceneId]) {
    console.error(`Scene not found: ${sceneId}`);
    return;
  }

  gameStore.data.currentSceneId = sceneId;
  console.log("Moved to scene:", sceneId);
  saveGame();

  // 处理结局场景
  if (sceneId.startsWith("end_") || sceneId.startsWith("dead_")) {
    meta.unlockEnding(sceneId);
    gameStore.data.gameState = "ended";
    gameStore.data.history.push(`结局: ${sceneId}`);

    // 添加游戏记录
    const role = roles.find((r) => r.id === gameStore.data.player.roleId);
    meta.addRun({
      date: new Date().toISOString(),
      roleName: role ? role.name : "未知",
      days: gameStore.data.player.days,
      endingId: sceneId,
      endName: scenes[sceneId]
        ? scenes[sceneId].text.split("\n")[0]
        : "未知结局",
    });

    console.log(`Ending reached: ${sceneId}`);
  }

  // 更新进度
  if (scenes[sceneId] && typeof scenes[sceneId].progress === "number") {
    gameStore.data.progress = scenes[sceneId].progress || 0;
  }

  gameStore.update();
}

/**
 * 检查存活状态
 */
function checkSurvival() {
  if (gameStore.data.status.hp <= 0) {
    const deathType =
      gameStore.data.status.hunger <= 0 ? "dead_starve" : "dead_cold";
    die(deathType);
    return false;
  }

  if (gameStore.data.status.sanity <= 0) {
    die("dead_sanity");
    return false;
  }

  return true;
}

/**
 * 死亡处理
 */
function die(deathType) {
  gameStore.data.gameState = "ended";
  gameStore.data.currentSceneId = "dead_001";
  gameStore.data.history.push(`结局: ${deathType}`);
  saveGame();

  meta.unlockEnding(deathType);

  const role = roles.find((r) => r.id === gameStore.data.player.roleId);
  meta.addRun({
    date: new Date().toISOString(),
    roleName: role ? role.name : "未知",
    days: gameStore.data.player.days,
    endingId: deathType,
    endName: scenes[deathType]
      ? scenes[deathType].text.split("\n")[0]
      : "死亡结局",
  });

  console.log(`Player died: ${deathType}`);
  gameStore.update();
}

module.exports = {
  gameStore,
  initGame,
  gainItem,
  useItem,
  equipItem,
  unequipItem,
  randomizeWeather,
  saveGame,
  loadGame,
  clearSave,
  showNotification,
  hasItem,
  hasVision,
  getPlayerTraits,
  getTotalStats,
  getCurrentLoad,
  getCurrentScene,
  handleChoice,
  applyCost,
  handleAction,
  moveToScene,
  checkSurvival,
  die,
};
