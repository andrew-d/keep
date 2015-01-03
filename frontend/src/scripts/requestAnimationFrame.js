// Note: adapted from:
//      https://gist.github.com/paulirish/1579671
//
// The original code is MIT licensed.

var fnRequestAnimationFrame = window.requestAnimationFrame;
var fnCancelAnimationFrame  = window.cancelAnimationFrame;

var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !fnRequestAnimationFrame; ++x) {
    fnRequestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    fnCancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
}

var lastTime = 0;
if( !fnRequestAnimationFrame ) {
    fnRequestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if( !fnCancelAnimationFrame ) {
    fnCancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

module.exports = {
    requestAnimationFrame: fnRequestAnimationFrame,
    cancelAnimationFrame:  fnCancelAnimationFrame,
};
