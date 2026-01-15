/**
 * 音频管理器
 * 管理背景音乐和音效
 */

// 背景音乐
let bgMusicContext = null;
let isMusicOn = false;

/**
 * 初始化音频管理器
 */
function initAudio() {
  if (!bgMusicContext) {
    bgMusicContext = wx.createInnerAudioContext();
    bgMusicContext.src = "/assets/audio/Ambient.mp3";
    bgMusicContext.loop = true;
    bgMusicContext.volume = 0.5;

    bgMusicContext.onError((err) => {
      console.error("Audio error:", err);
    });
  }
}

/**
 * 播放背景音乐
 */
function playMusic() {
  initAudio();
  if (bgMusicContext && !isMusicOn) {
    bgMusicContext.play();
    isMusicOn = true;
  }
}

/**
 * 暂停背景音乐
 */
function pauseMusic() {
  if (bgMusicContext && isMusicOn) {
    bgMusicContext.pause();
    isMusicOn = false;
  }
}

/**
 * 切换背景音乐
 */
function toggleMusic() {
  if (isMusicOn) {
    pauseMusic();
  } else {
    playMusic();
  }
  return isMusicOn;
}

/**
 * 设置音量
 */
function setVolume(volume) {
  if (bgMusicContext) {
    bgMusicContext.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * 销毁音频
 */
function destroyAudio() {
  if (bgMusicContext) {
    bgMusicContext.stop();
    bgMusicContext.destroy();
    bgMusicContext = null;
    isMusicOn = false;
  }
}

/**
 * 获取音乐状态
 */
function getMusicStatus() {
  return isMusicOn;
}

module.exports = {
  initAudio,
  playMusic,
  pauseMusic,
  toggleMusic,
  setVolume,
  destroyAudio,
  getMusicStatus,
};
