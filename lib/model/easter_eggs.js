/**
 * 彩蛋道具数据配置
 * 这些道具没有实际游戏属性加成，仅作为收集要素和故事载体
 */
const easterEggs = {
  egg_pencil: {
    id: "egg_pencil",
    name: "咬断的铅笔",
    icon: "✏️",
    type: "collection",
    story:
      "只有半截，末端是被牙齿咬断的痕迹。据说属于一位在麦秸岭遇难的诗人。他在狂风中试图写下最后一行诗：“风是山的呼吸，我是风的...”，字迹到这里戛然而止。",
  },
  egg_film_box: {
    id: "egg_film_box",
    name: "空胶卷盒",
    icon: "🎞️",
    type: "collection",
    story:
      "柯达胶卷的黄色塑料盒。里面没有胶卷，只有一张折得方方正正的纸条，上面用褪色的墨水写着：“如果能看到日照金山，就原谅自己吧。”",
  },
  egg_bell: {
    id: "egg_bell",
    name: "无声铃铛",
    icon: "🔔",
    type: "collection",
    story:
      "一个铜制的熊铃，但里面的撞珠不见了，所以摇不出声音。它的主人说：“我不怕熊，挂着它是为了提醒自己，在这万籁俱寂的荒野里，我还是个会行走的发声体。”",
  },
  egg_postcard: {
    id: "egg_postcard",
    name: "未寄出的明信片",
    icon: "📨",
    type: "collection",
    story:
      "背面印着太白山大爷海的照片。收件人地址模糊不清，只能辨认出“致遥远的她”。邮票没有盖戳，因为它从未走出过这片大山。",
  },
  egg_compass: {
    id: "egg_compass",
    name: "反向指北针",
    icon: "🧭",
    type: "collection",
    story:
      "指针被某种磁场永久磁化了，永远指向南方。也许它坏了，又也许它比任何人都清楚，“家”在南方，而北方只有无尽的寒冷。",
  },
  egg_walkman: {
    id: "egg_walkman",
    name: "老式随身听",
    icon: "🎧",
    type: "collection",
    story:
      "索尼出的经典款。按下播放键，耳机里传出的不是流行金曲，而是一段长达60分钟的录音——全是呼啸的风声，和偶尔夹杂的粗重呼吸声。",
  },
  egg_bear: {
    id: "egg_bear",
    name: "脏兮兮的泰迪",
    icon: "🧸",
    type: "collection",
    story:
      "一只掌心大小的玩偶，浑身泥泞，少了一只眼睛。但在暴风雪中被发现时，它被裹在三层防水袋里，比主人身上任何一件装备保护得都要好。",
  },
  egg_coin: {
    id: "egg_coin",
    name: "幸运石币",
    icon: "🪙",
    type: "collection",
    story:
      "这其实不是硬币，而是一块被打磨得极圆的片麻岩。正面刻着一个笑脸，背面刻着“活下去”。握着它时，手心会感到一丝莫名的温热。",
  },
  egg_flower_map: {
    id: "egg_flower_map",
    name: "手绘花卉图",
    icon: "🗺️",
    type: "collection",
    story:
      "一张手绘的等高线地图，但上面没有标注水源和营地，而是密密麻麻地标记了：“这里的杜鹃很红”、“这里有 rare 的绿绒蒿”、“这里适合躺着看云”。",
  },
  egg_spoon: {
    id: "egg_spoon",
    name: "凹陷的钛勺",
    icon: "🥄",
    type: "collection",
    story:
      "柄上刻着“干饭王”三个字。勺子头边缘有很多细小的磕痕，像是在无数个寒冷的夜晚，焦急地刮擦着饭盒底部的最后一粒米。",
  },
};

module.exports = { easterEggs };
