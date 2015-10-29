;(function ( $, window, document, undefined ) {
    var pluginName = "znetConditionalLoadGoogleFonts",
        defaults = {
        };

    function GoogleFontLoader($element, options ) {
        this.options = $.extend( {}, defaults, options) ;
        this.init();
    };

    GoogleFontLoader.prototype = {
        init: function() {
            console.log(this.options);
        },

        setup: function(jsonData) {
        },
    };
    
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new GoogleFontLoader( this, options ));
            }
        });
    };

})( jQuery, window, document );