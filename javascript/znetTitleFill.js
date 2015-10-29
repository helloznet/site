;( function ( $, window, document, undefined) {
    var pluginName = "znetTitleFill",
        defaults = {
            maxFontSize:                200,
            minFontSize:                30,
            suggestedMinFontSize:       50,
            maxWidth:                   2000,
            padding:                    0.05,
            paddingX:                   10,
            paddingY:                   10,
            minWidth:                   700,
            centerY:                    "true"
        };

    $.fn[pluginName] = function(options, callback){
        return this.each(function(){
            
            if(!$.data(this, "plugin_" + pluginName )){
                $.data(this, "plugin_" + pluginName,
                new TitleFill($(this), options));
                $.removeData(this, "plugin_" + pluginName);  
            }
        }, $.isFunction(callback) && callback.call(this));
    };
    
    function TitleFill($title, options) {
        this.$title = $title;
        this.options = $.extend({}, defaults, options);
        
        this.init();
        this.setup();
        this.resizeCheck();
    }
    
    TitleFill.prototype.init = function() {
        
        this.$title.css("position", "absolute");
        this.$title.css("left", this.options.paddingX);
    };
    
    TitleFill.prototype.setup = function () {
        this.titleInitialFontSize = parseInt(this.$title.css('font-size'));
        this.containerHeight = this.$title.parent().innerHeight();
        this.containerWidth = this.$title.parent().width();
        this.setFontSize();
        this.centerTitle();
        this.$title.show();
    };
    
    TitleFill.prototype.setFontSize = function() {
        var titleText = this.$title.text();
        
        var xMaxSize = this.getXMaxSize(titleText);
        this.setRealisticSize(xMaxSize);
    };   

    TitleFill.prototype.getXMaxSize = function(title) {
        var newlinedTitle,
            containerWidthMinusPadding,
            titleWidth,
            xRatio;
            
        newlinedTitle = title.split(" ").join("<br>");
        
        this.$title.empty().append(newlinedTitle);
        
        containerWidthMinusPadding = this.containerWidth - (this.options.paddingX * 2);
        titleWidth = this.$title.width();
        
        xRatio = containerWidthMinusPadding/titleWidth;

        this.$title.empty().append(title);        
        
        return Math.floor(this.titleInitialFontSize * xRatio);
    };
    
    TitleFill.prototype.setRealisticSize = function(widthGuess) {
        this.$title.css("fontSize", widthGuess);
        var titleHeight = this.$title.height();
        var yRatio = this.containerHeight/titleHeight;
        var newWidthGuess = Math.floor(widthGuess * yRatio);
        var splitTheDifference = ((widthGuess - newWidthGuess)/2) + newWidthGuess;
        
        if(newWidthGuess < widthGuess){
            this.setRealisticSize(splitTheDifference);
        }
        else {
            return widthGuess;
        }
    };
    
    TitleFill.prototype.centerTitle = function() {
        
        var titleHeight = this.$title.height();
        var titleWidth = this.$title.width();
        
        var marginY = (this.containerHeight - titleHeight) / 2;
        var marginX = (this.containerWidth - titleWidth) / 2;
        
        this.$title.css("top", marginY);
    };
    
    TitleFill.prototype.lineWrapped = function() {
        var titleText = this.$title.text();
        var firstCharacter = titleText.slice(0,1);
        var lastCharacter = titleText.slice(-1);
        var theRest = titleText.substr(1, titleText.length-2);
        
        var testText = "<span data-character='first'>" + firstCharacter + "</span>" + theRest + "<span data-character='last'>" + lastCharacter + "</span>";
        
        this.$title.html(testText);
        var firstCharacterHeight = this.$title.find("[data-character='first']").offset().top;
        var lastCharacterHeight = this.$title.find("[data-character='last']").offset().top;

        this.$title.text(titleText);
        
        if(lastCharacterHeight > firstCharacterHeight){
            return true;
        }
        else {
            return false;
        }
    };
    
    TitleFill.prototype.resizeCheck = function(){
        var that = this;
        
        $(window).resize(function() {
            if ($(window).width() !== that.containerWidth) {
                that.setup();
            }
            
        });       
    };
    
})(jQuery, window, document);