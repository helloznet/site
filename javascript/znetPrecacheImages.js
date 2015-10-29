;(function ( $, window, document, undefined ) {
    var pluginName = "znetPrecacheImages",
        defaults = {
            imageList   : 'http://zacharybell.net.s3-website-us-east-1.amazonaws.com/image_precache.json',
            imageUrl    : 'http://zacharybell.net.s3-website-us-east-1.amazonaws.com/images/large',  
            //imageList   : 'http://172.20.246.8:4000/image_precache.json',
            //imageUrl    : 'http://172.20.246.8:4000/images/large'  
        };

    function PrecacheImages($element, options ) {
        this.options = $.extend( {}, defaults, options) ;
        this.init();
    };

    PrecacheImages.prototype = {
        init: function() {
            var that = this;
            
            $.ajax({
                dataType: 'JSON',
                url: this.options.imageList,
                success: function(data) {
                    that.fetchImages(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            }); 
        },

        setup: function(jsonData) {
            console.log(jsonData);
        },
        
        fetchImages: function(data){
            for (var i=0; i < data.length; i++) {
                this.pushToCache(data[i].url);
            }
        },
        
        pushToCache: function(imageName){
            var image = new Image();
            image.src = this.options.imageUrl + "/" + imageName;
            return image.complete;
        }
    };
    
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new PrecacheImages( this, options ));
            }
        });
    };

})( jQuery, window, document );