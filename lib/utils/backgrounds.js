/**
 * 背景图片路径映射
 * 根据场景 bg 属性返回对应的图片路径
 */

// 远程静态资源基础 URL
const STATIC_BASE_URL = "https://www.iyouren.top/static/images";

const bgImages = {
  // 主要场景
  loc_village: `${STATIC_BASE_URL}/loc_camp.png`,
  loc_forest: `${STATIC_BASE_URL}/loc_forest.png`,
  loc_ridge: `${STATIC_BASE_URL}/loc_ridge.png`,
  loc_camp: `${STATIC_BASE_URL}/loc_camp.png`,
  loc_river: `${STATIC_BASE_URL}/loc_river.png`,
  loc_red_birch: `${STATIC_BASE_URL}/loc_red_birch.png`,
  loc_stone_sea: `${STATIC_BASE_URL}/loc_stone_sea.png`,
  loc_stone_sea_giant_ship: `${STATIC_BASE_URL}/loc_stone_sea_giant_ship.png`,
  loc_sunset_meadow: `${STATIC_BASE_URL}/loc_sunset_meadow.png`,
  loc_penjing: `${STATIC_BASE_URL}/loc_penjing.png`,
  loc_nav_stand: `${STATIC_BASE_URL}/loc_nav_stand.png`,
  loc_knife_ridge: `${STATIC_BASE_URL}/loc_knife_ridge.png`,
  loc_spring_water: `${STATIC_BASE_URL}/loc_spring_water.png`,
  loc_plane_wreck: `${STATIC_BASE_URL}/loc_plane_wreck.png`,
  loc_daye_lake: `${STATIC_BASE_URL}/loc_daye_lake.png`,
  loc_wengong_temple: `${STATIC_BASE_URL}/loc_wengong_temple.png`,
  loc_fangyang_temple: `${STATIC_BASE_URL}/loc_fangyang_temple.png`,
  loc_mingxing_temple: `${STATIC_BASE_URL}/loc_mingxing_temple.png`,
  loc_baxiantai_ruins: `${STATIC_BASE_URL}/loc_baxiantai_ruins.png`,
  loc_wanxian: `${STATIC_BASE_URL}/loc_wanxian.png`,
  loc_tractor_road: `${STATIC_BASE_URL}/loc_tractor_road.png`,
  loc_temple: `${STATIC_BASE_URL}/loc_temple.png`,
  loc_lake: `${STATIC_BASE_URL}/loc_lake.png`,
  loc_pingan_temple: `${STATIC_BASE_URL}/loc_pingan_temple.png`,
  loc_cliff: `${STATIC_BASE_URL}/evt_sunset_cliff.png`,

  // 天气/环境
  bg_fog: `${STATIC_BASE_URL}/bg_fog.png`,
  bg_storm: `${STATIC_BASE_URL}/bg_storm.png`,
  bg_snow: `${STATIC_BASE_URL}/bg_snow.png`,
  bg_night: `${STATIC_BASE_URL}/bg_night.png`,
  bg_sunny: `${STATIC_BASE_URL}/bg_sunny.png`,

  // 事件场景
  evt_rescue_hiker: `${STATIC_BASE_URL}/evt_rescue_hiker.png`,
  evt_abandoned_tent: `${STATIC_BASE_URL}/evt_abandoned_tent.png`,
  evt_frozen_body: `${STATIC_BASE_URL}/evt_frozen_body.png`,
  evt_takin_beast: `${STATIC_BASE_URL}/evt_takin_beast.png`,
  evt_takin_herd: `${STATIC_BASE_URL}/evt_takin_herd.png`,
  evt_phantom_opera: `${STATIC_BASE_URL}/evt_phantom_opera.png`,
  evt_broken_shoe: `${STATIC_BASE_URL}/evt_broken_shoe.png`,
  evt_water_bottle: `${STATIC_BASE_URL}/evt_water_bottle.png`,
  evt_lightning_hair: `${STATIC_BASE_URL}/evt_lightning_hair.png`,
  evt_wild_boar_shadow: `${STATIC_BASE_URL}/evt_wild_boar_shadow.png`,
  evt_thin_ice: `${STATIC_BASE_URL}/evt_sunset_cliff.png`,
  evt_shelter_cave: `${STATIC_BASE_URL}/loc_camp.png`,
  evt_hypothermia: `${STATIC_BASE_URL}/evt_hypothermia.png`,
  evt_phone_frozen: `${STATIC_BASE_URL}/evt_phone_frozen.png`,
  evt_ranger_patrol: `${STATIC_BASE_URL}/evt_ranger_patrol.png`,
  evt_mani_pile: `${STATIC_BASE_URL}/evt_mani_pile.png`,
  evt_sunset_cliff: `${STATIC_BASE_URL}/evt_sunset_cliff.png`,
  evt_notebook: `${STATIC_BASE_URL}/evt_notebook.png`,
  evt_shoe_trace: `${STATIC_BASE_URL}/evt_shoe_trace.png`,
  fog_halluncination: `${STATIC_BASE_URL}/fog_halluncination.png`,

  // 默认背景
  default: `${STATIC_BASE_URL}/back_ground.png`,
};

/**
 * 获取背景图片路径
 */
function getBgImage(bgKey) {
  return bgImages[bgKey] || bgImages.default;
}

/**
 * 获取核心图片 URL 列表 (仅预加载常用场景和天气)
 */
function getCoreImageUrls() {
  const coreKeys = [
    // 默认背景
    "default",
    // 天气/环境
    "bg_sunny",
    "bg_night",
    "bg_fog",
    "bg_storm",
    "bg_snow",
    // 早期核心场景
    "loc_village",
    "loc_forest",
    "loc_river",
    "loc_camp",
    "loc_wengong_temple",
  ];

  const urls = new Set();
  coreKeys.forEach((key) => {
    if (bgImages[key]) urls.add(bgImages[key]);
  });
  return Array.from(urls);
}

/**
 * 预加载核心图片
 * @param {Function} onProgress - 进度回调 (loaded, total)
 * @returns {Promise} - 完成时 resolve
 */
function preloadCoreImages(onProgress) {
  const urls = getCoreImageUrls();
  const total = urls.length;
  let loaded = 0;

  return new Promise((resolve) => {
    if (total === 0) {
      resolve();
      return;
    }

    urls.forEach((url) => {
      wx.getImageInfo({
        src: url,
        success: () => {
          loaded++;
          if (onProgress) onProgress(loaded, total);
          if (loaded >= total) resolve();
        },
        fail: () => {
          console.warn("Preload failed:", url);
          loaded++; // 失败也继续
          if (onProgress) onProgress(loaded, total);
          if (loaded >= total) resolve();
        },
      });
    });
  });
}

module.exports = {
  STATIC_BASE_URL,
  bgImages,
  getBgImage,
  preloadCoreImages,
};
