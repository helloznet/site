window.znet = Array();
window.znet = {'siteUrl': 'http://172.20.20.15:4000'};

;(function ($) {
    $.resizeDelayTimer = function (options, callback) {
        var settings = $.extend({
            ms: 500
        }, options);
 
        
        var doit = null;
        window.onresize = function() {
            clearTimeout(doit);
            doit = setTimeout(function() {
                if (typeof callback === 'function') { 
                    callback.call(this); 
                }
            }, settings.ms);
        };
    };
}(jQuery));

(function ($) {
    $.getMediaQueryWidth = function (options, callback) {
        var settings = $.extend({
        }, options);
        
        return parseInt($("style").css("width"));
        
    };
}(jQuery)); 
