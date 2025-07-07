// Placeholder for pcm-player.js
// Download the real file from https://github.com/novnc/noVNC/blob/master/app/js/pcm-player.js or https://github.com/kasmtech/KasmVNC/blob/develop/app/js/pcm-player.js 

var player = new PCMPlayer({
  inputCodec: 'Int16',
  channels: 2,
  sampleRate: 8000,
  flushTime: 2000
});
player.feed(pcm_data); 