;( function ( $, window, document, undefined) {
    var pluginName = "znetFullScreenImage",
        defaults = {
            allowGapForNavigation   :   0,
            largeImageBreakpoint    :   768,
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new FullScreenImageContainer($(this), options, callback));
            });
        }
    };
    
    function FullScreenImageContainer($container, options, callback) {
        this.options = $.extend({}, defaults, options);
        this.$container = $container;
        this.callback = callback;
        
        this.init();
        this.setup();

        this.resizeCheck();
        this.doCallback();
    }
    
    FullScreenImageContainer.prototype.init = function() {
        this.$window = $(window);
        this.initialLoad = true;
    };
    
    /**
     * 
     */
    FullScreenImageContainer.prototype.setup = function(){
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        
        var that = this;

        var urlBarNudge = 0;
        if ($(window).height() < $(window).width()) {
            if(window.screen.availHeight > window.screen.availWidth){
               urlBarNudge = window.screen.availWidth - window.innerHeight;
            }
        }
        
        this.cssHeight = this.windowHeight - this.options.allowGapForNavigation - urlBarNudge;

        this.setCss();
    };

    FullScreenImageContainer.prototype.setCss = function(){
        this.$container.css({
            "width" : "100%",
            "height" : this.cssHeight + "px",
        });
    };
    
    FullScreenImageContainer.prototype.doCallback = function(){
        if($.isFunction(this.callback)){
            this.callback.call(this.callback);
        }
    };
    
    FullScreenImageContainer.prototype.resizeCheck = function(){
        var that = this;
        $(window).resize(function() {
            if (that.windowWidth !== $(window).width()) {
                that.setup();
            }
        });       
    };
})(jQuery, window, document);