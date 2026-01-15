/**
 * 背景图片路径映射
 * 根据场景 bg 属性返回对应的图片路径
 */

const bgImages = {
  // 主要场景
  loc_village: "/static_pkg9/assets/loc_camp.png",
  loc_forest: "/static_pkg3/assets/loc_forest.png",
  loc_ridge: "/static_pkg8/assets/loc_ridge.png",
  loc_camp: "/static_pkg9/assets/loc_camp.png",
  loc_river: "/static_pkg3/assets/loc_river.png",
  loc_red_birch: "/static_pkg2/assets/loc_red_birch.png",
  loc_stone_sea: "/static_pkg4/assets/loc_stone_sea.png",
  loc_stone_sea_giant_ship: "/static_pkg7/assets/loc_stone_sea_giant_ship.png",
  loc_sunset_meadow: "/static_pkg10/assets/loc_sunset_meadow.png",
  loc_penjing: "/static_pkg5/assets/loc_penjing.png",
  loc_nav_stand: "/static_pkg10/assets/loc_nav_stand.png",
  loc_knife_ridge: "/static_pkg6/assets/loc_knife_ridge.png",
  loc_spring_water: "/static_pkg7/assets/loc_spring_water.png",
  loc_plane_wreck: "/static_pkg5/assets/loc_plane_wreck.png",
  loc_daye_lake: "/static_pkg10/assets/loc_daye_lake.png",
  loc_wengong_temple: "/static_pkg6/assets/loc_wengong_temple.png",
  loc_fangyang_temple: "/static_pkg1/assets/loc_fangyang_temple.png",
  loc_mingxing_temple: "/static_pkg3/assets/loc_mingxing_temple.png",
  loc_baxiantai_ruins: "/static_pkg9/assets/loc_baxiantai_ruins.png",
  loc_wanxian: "/static_pkg7/assets/loc_wanxian.png",
  loc_tractor_road: "/static_pkg8/assets/loc_tractor_road.png",
  loc_temple: "/static_pkg6/assets/loc_temple.png",
  loc_lake: "/static_pkg7/assets/loc_lake.png",
  loc_pingan_temple: "/static_pkg7/assets/loc_pingan_temple.png",
  loc_cliff: "/static_pkg8/assets/evt_sunset_cliff.png",

  // 天气/环境
  bg_fog: "/static_pkg10/assets/bg_fog.png",
  bg_storm: "/static_pkg4/assets/bg_storm.png",
  bg_snow: "/static_pkg9/assets/bg_snow.png",
  bg_night: "/static_pkg4/assets/bg_night.png",
  bg_sunny: "/static_pkg7/assets/bg_sunny.png",

  // 事件场景
  evt_rescue_hiker: "/static_pkg5/assets/evt_rescue_hiker.png",
  evt_abandoned_tent: "/static_pkg8/assets/evt_abandoned_tent.png",
  evt_frozen_body: "/static_pkg8/assets/evt_frozen_body.png",
  evt_takin_beast: "/static_pkg1/assets/evt_takin_beast.png",
  evt_takin_herd: "/static_pkg2/assets/evt_takin_herd.png",
  evt_phantom_opera: "/static_pkg5/assets/evt_phantom_opera.png",
  evt_broken_shoe: "/static_pkg3/assets/evt_broken_shoe.png",
  evt_water_bottle: "/static_pkg7/assets/evt_water_bottle.png",
  evt_lightning_hair: "/static_pkg8/assets/evt_lightning_hair.png",
  evt_wild_boar_shadow: "/static_pkg2/assets/evt_wild_boar_shadow.png",
  evt_thin_ice: "/static_pkg8/assets/evt_sunset_cliff.png",
  evt_shelter_cave: "/static_pkg9/assets/loc_camp.png",
  evt_hypothermia: "/static_pkg8/assets/evt_hypothermia.png",
  evt_phone_frozen: "/static_pkg4/assets/evt_phone_frozen.png",
  evt_ranger_patrol: "/static_pkg6/assets/evt_ranger_patrol.png",
  evt_mani_pile: "/static_pkg5/assets/evt_mani_pile.png",
  evt_sunset_cliff: "/static_pkg8/assets/evt_sunset_cliff.png",
  evt_notebook: "/static_pkg3/assets/evt_notebook.png",
  evt_shoe_trace: "/static_pkg4/assets/evt_shoe_trace.png",
  fog_halluncination: "/static_pkg4/assets/fog_halluncination.png",

  // 默认背景
  default: "/assets/back_ground.png",
};

/**
 * 获取背景图片路径
 */
function getBgImage(bgKey) {
  return bgImages[bgKey] || bgImages.default;
}

module.exports = {
  bgImages,
  getBgImage,
};
