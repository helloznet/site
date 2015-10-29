;( function ( $, window, document, undefined) {
    var pluginName = "znetNavMenu";
    
    defaults = {
        
    };
    
    $.fn[pluginName] = function(options, callback){
        return this.each(function(){
            if(!$.data(this, "plugin_" + pluginName )){
                $.data(this, "plugin_" + pluginName,
                new NavMenu($(this), options));
            }
        }, $.isFunction(callback) && callback.call(this));
    };
    
    function NavMenu($navMenu) {
        this.$navMenu = $navMenu;
        this.init();
    }
    
    NavMenu.prototype.init = function(){
        
        this.updateMenuContext();
        this.watchScroll();
        
        $('.navButton').each(function(){
            new NavButton(this);
        });
    };
    
    NavMenu.prototype.watchScroll = function(){
        timeout = null;
        var that = this;
        
        $(window).scroll(function () {
            if (!timeout) {
                timeout = setTimeout(function () {
                    clearTimeout(timeout);
                    timeout = null;
                    that.updateMenuContext();
                }, 125);
            }
        });
    };

    
    NavMenu.prototype.updateMenuContext = function(){
        // page just scrolled down from top of page.
        if (this.atTopOfPage(20)) {
            this.setMenuForTopOfPage();
        }
        else {
            this.setMenuForScrollDown();
        }
    };
    
    NavMenu.prototype.atTopOfPage = function(threshold){
        if($(window).scrollTop() <= threshold){
            return true;
        }
        else {
            return false;
        }
    };
    
    NavMenu.prototype.setMenuForTopOfPage = function(){
        this.$navMenu.addClass('pageTop');
        this.$navMenu.removeClass('scrolledDown');
    };
    
    NavMenu.prototype.setMenuForScrollDown = function(){
        this.$navMenu.addClass('scrolledDown');
        this.$navMenu.removeClass('pageTop');
    };
    
    
    
    function NavButton(navButton){
        this.$navButton = $(navButton);
        this.init();
    }
    
    NavButton.prototype.init = function(){
        var menuIdentifier = this.$navButton.data('menu-identifier');
        
        this.$navSubMenu = $('.subMenu[data-menu-identifier="' + menuIdentifier + '"]');
        
        this.$navSubMenu.hide();
        
        this.setClickBehavior();
    };
    
    
    
    
    NavButton.prototype.setClickBehavior = function(){
        var that = this;
        this.$navButton.on( "click", function(e) {
            e.preventDefault();
            
            // if the subMenu is visible, then it's already open, thus a click
            // on the menu button should CLOSE the menu.
            if(that.$navSubMenu.is(":visible")){ 
                that.deactivateMenu();
            }
            else {
                that.activateMenu();
                
            }
        });
        
        $(document).on("click", function (e){
            // if the clicked element WAS the subMenu or it was IN the subMenu, do nothing
            // otherwise, close the menu.
            if($(e.target).closest(that.$navSubMenu).length === 0 && $(e.target).closest(that.$navButton).length === 0){
                that.deactivateMenu();
            }
        });
    };
    
    NavButton.prototype.deactivateMenu = function(){
        this.$navButton.removeClass("activeButton");
        this.$navSubMenu.hide();
    };
    
    NavButton.prototype.activateMenu = function(){
        this.$navButton.addClass("activeButton");
        this.$navSubMenu.show();
        
        var theoreticalInput = this.$navSubMenu.find('input').first()
        if(theoreticalInput.length > 0 ){
            theoreticalInput.focus();
        }
    };
})(jQuery, window, document);