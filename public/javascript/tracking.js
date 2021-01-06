window.shownFile = 'none';

(function() {
  var now = +new Date();
  window.gaTrack = function(type, subtype) {
    var time = Math.round((+new Date() - now) / 1000);
    function doTrack() {
      if (!window._gaq) return;
      _gaq.push(['_trackEvent', String(type), String(subtype), window.location.href, time]);
    }
    if (window._gaq) {
      doTrack()
    } else {
      setTimeout(doTrack, 1);
    }
  }
})();

function track(type, subtype) {
  /*
  fastrack({
    D01: version,
    D02: type,
    D03: subtype,
    D04: shownFile,
    M01: 3 // tmp
  });
  */
  gaTrack(type + '-' + version, subtype);
}