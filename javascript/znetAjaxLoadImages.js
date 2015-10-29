;( function ( $, window, document, undefined) {
    var pluginName = "znetAjaxLoadImages",
        defaults = {
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new AjaxImage($(this), options, callback));
            });
        }
    };
    
    function AjaxImage($container, options, callback) {
        this.options = $.extend({}, defaults, options);
        this.$container = $container;
        this.callback = callback;
        
        this.init();
        this.setup();
    }
    
    AjaxImage.prototype.init = function() {
        this.$coverImage = this.$container.find('.coverImage');
        this.$window = $(window);
    };
    
    AjaxImage.prototype.setup = function(){
        var that = this;
        var coverImagePath = this.$coverImage.data('background');
        var backgroundImage = new Image();
        
        backgroundImage.src=coverImagePath;
        
        $(backgroundImage).bind('load', function(e){
            $(that.$coverImage).css('background-image','url('+ coverImagePath +')');
            $(that.$coverImage).hide().css('visibility', 'visible').fadeIn();
            that.doCallback();
        });
    };
    
    AjaxImage.prototype.doCallback = function(){
        if($.isFunction(this.callback)){
            this.callback.call(this);                        
        }
    };
})(jQuery, window, document);