/**
 * 场景数据统一导出
 * 合并地图场景和随机事件场景
 */
const { mapScenes } = require("./scenes/map_scenes.js");
const { eventScenes, randomEventIds } = require("./scenes/event_scenes.js");

// 合并所有场景
const scenes = {
  ...mapScenes,
  ...eventScenes,
};

module.exports = {
  scenes,
  randomEventIds,
};
