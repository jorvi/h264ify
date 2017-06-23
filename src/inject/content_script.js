// content_script.js

// This content script runs in an isolated environment and cannot modify any
// javascript variables on the youtube page. Thus, we have to inject another
// script into the DOM.

// Set defaults for options stored in localStorage
if (localStorage['h264ify+-enable'] === undefined) {
  localStorage['h264ify+-enable'] = true;
}
if (localStorage['h264ify+-block_60fps'] === undefined) {
  localStorage['h264ify+-block_60fps'] = false;
}

// Cache chrome.storage.local options in localStorage.
// This is needed because chrome.storage.local.get() is async and we want to
// load the injection script immediately.
// See https://bugs.chromium.org/p/chromium/issues/detail?id=54257
chrome.storage.local.get({
  // Set defaults
  enable: true,
  block_60fps: false
 }, function(options) {
   localStorage['h264ify+-enable'] = options.enable;
   localStorage['h264ify+-block_60fps'] = options.block_60fps;
 }
);

document.addEventListener('DOMContentLoaded', function() {
  var videos = document.getElementsByTagName('video');
  if(videos.length > 0) {
    var videoLength = videos.length, i = 0;
    for(i = 0; i < videoLength; i++) {
      var sources = videos[i].getElementsByTagName('source');
      var sourcesLength = sources.length, i2 = 0;

      if(sourcesLength > 0) {
        videos[i].src = false;
        videos[i].preload = 'none';
        videos[i].pause();
        var play = false, preload;
        if(videos[i].autoplay === true) {
          videos[i].autoplay = false;
          preload = videos[i].preload;
          play = true;
        }
        if(videos[i].currentTime > 0 && videos[i].paused === false && videos[i].ended) {
          videos[i].pause();
          play = true;
        }
        for(i2 = 0; i2 < sourcesLength; i2++) {
          if(typeof sources[i2].type !== 'string') {
            continue;
          }
          if(sources[i2].type === 'video/mp4') {
            videos[i].src = sources[i2].src;
            videos[i].preload = preload;
            if(play === true) {
              videos[i].play();
            }
          }
        }
      }
    }
  }
}, false);

var injectScript = document.createElement('script');
// Use textContent instead of src to run inject() synchronously
injectScript.textContent = inject.toString() + "inject();";
injectScript.onload = function() {
  // Remove <script> node after injectScript runs.
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(injectScript);

