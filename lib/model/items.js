/**
 * 物品数据配置
 */
const items = {
  water_001: {
    id: "water_001",
    name: "矿泉水",
    description: "一瓶500ml的矿泉水，虽然冰冷但能解渴。",
    type: "consumable",
    icon: "💧",
    weight: 0.5,
    effect: {
      hunger: 5,
      msg: "你喝了一口水，感觉喉咙舒服多了。(饱食+5)",
    },
  },
  food_001: {
    id: "food_001",
    name: "压缩饼干",
    description: "干硬的军用压缩饼干，顶饱但很难吃。",
    type: "consumable",
    icon: "🍪",
    weight: 0.2,
    effect: {
      hunger: 25,
      msg: "你艰难地咽下饼干，胃里充实了不少。(饱食+25)",
    },
  },
  food_energy_gel: {
    id: "food_energy_gel",
    name: "能量胶",
    description: "高浓缩能量胶，虽然齁甜，但能瞬间补充爆发力。",
    type: "consumable",
    icon: "⚡",
    weight: 0.05,
    effect: {
      hunger: 10,
      hp: 5,
      msg: "能量涌入四肢！(饱食+10, 生命+5)",
    },
  },
  item_thermal_blanket: {
    id: "item_thermal_blanket",
    name: "急救毯",
    description: "薄如蝉翼的铝箔毯，关键时刻能锁住体温。",
    type: "consumable",
    icon: "🧖",
    weight: 0.1,
    effect: {
      hp: 30,
      warmth_boost: true, // 特殊效果标记
      msg: "裹上急救毯，体温逐渐回升。(生命+30)",
    },
  },
  gear_tent_01: {
    id: "gear_tent_01",
    name: "轻量帐篷",
    description:
      "虽然是轻量化设计，但依然是荒野中最温暖的家。休息效果大幅提升。",
    type: "gear",
    slot: "backpack", // 需要在装备栏代码中支持这个新槽位，或者暂时放在背包里生效
    icon: "⛺",
    weight: 1.8,
    stats: { rest_bonus: 1.5 }, // 休息加成
  },
  gear_water_filter: {
    id: "gear_water_filter",
    name: "净水器",
    description: "可以安全地从自然水源取水，不用担心寄生虫。",
    type: "tool",
    icon: "🚰",
    weight: 0.3,
  },
  med_001: {
    id: "med_001",
    name: "云南白药",
    description: "止血化瘀的喷雾剂，处理外伤的神器。",
    type: "consumable",
    icon: "💊",
    weight: 0.1,
    effect: {
      hp: 15,
      msg: "伤口经过处理不再剧烈疼痛。(生命+15)",
    },
  },
  gear_jacket_01: {
    id: "gear_jacket_01",
    name: "冲锋衣",
    description: "专业的Gore-Tex冲锋衣，防风防水，是抵御恶劣天气的关键。",
    type: "gear",
    slot: "body",
    icon: "🧥",
    weight: 0.8,
    stats: { warmth: 15 },
  },
  gear_boots_01: {
    id: "gear_boots_01",
    name: "登山鞋",
    description: "抓地力极强的重装徒步鞋，能有效节省体力。",
    type: "gear",
    slot: "feet",
    icon: "🥾",
    weight: 1.2,
    stats: { speed: 10 },
  },
  gear_poles_01: {
    id: "gear_poles_01",
    name: "登山杖",
    description: "碳纤维登山杖，能有效分担膝盖压力。",
    type: "gear",
    slot: "hand",
    icon: "🦯",
    weight: 0.5,
    stats: { speed: 5 },
  },
  gear_headlamp_01: {
    id: "gear_headlamp_01",
    name: "手电筒",
    description: "夜间行进必备。装备后可在夜晚获得视野，避免理智大幅下降。",
    type: "gear",
    slot: "head",
    icon: "🔦",
    weight: 0.2,
    stats: { warmth: 0 },
  },
  relic_watch: {
    id: "relic_watch",
    name: "停摆的怀表",
    description:
      "表针永远停在 04:44。背面刻着模糊不清的名字。随着带着它，你总感觉背后有东西...",
    type: "tool",
    icon: "⌚",
    stackable: false,
    weight: 0.1,
    effect: {
      sanity: -5,
      msg: "滴答...滴答...它明明没有走动。",
    },
  },
  special_flower: {
    id: "special_flower",
    name: "格桑花",
    type: "material",
    description: "一朵干枯的格桑花，夹在笔记本里。代表着幸福和美好。",
    icon: "🌸",
    weight: 0,
  },
};

module.exports = { items };
