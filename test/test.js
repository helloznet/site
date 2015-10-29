/*
 * Sets up footnotes for znet
 */

;( function ( $, window, document, undefined) {
    var pluginName = "znetFootnotes",
        defaults = {
            footnoteUpperMargin :   16,
            forceFootnoteLayout :   false,
            // the breakpoint isn't decided by pixel width.
            // instead, the javascript checks with the css
            // to see how wide the CSS thinks the page is.
            // due to scrollbars and so on, javascript and
            // css often disagree on width.
            layoutBreakpoint    :   "md",
            nudge               :   0,
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new FootnoteCollection($(this), options));
            }, $.isFunction(callback) && callback.call(this));
        }
    };
    
    /*
     * a footnote collection is the structure containing all footnotes for a given
     * story (of which there can be more than one: see blog index).
     */
    function FootnoteCollection($footnoteCollection, options) {
        this.options = $.extend({}, defaults, options);
        
        this.$footnoteCollection = $footnoteCollection;

        if(this.footnotesAttached()){
            this.init();
            this.wideOrNarrow();
            this.resizeCheck();
        }
    }
    
    /**
     * Initialize the Footnote object variables 
     */
    FootnoteCollection.prototype.init = function() {
        this.collectionNumber = this.$footnoteCollection.data("footnoteCollection");
        this.$story = $('[data-story-number = "' + this.collectionNumber + '"]');
        this.footnotes = [];
    };
    
    /*
     * There are two layouts, footnote-wise: desktop or mobile.
     * Since their behaviors are quite different, we need to branch here
     */
    FootnoteCollection.prototype.wideOrNarrow = function(){
        this.createFootnotes();
        
        if(screenWiderThanBreakpoint(this.options.layoutBreakpoint)){
            this.$footnoteCollection.show();
            this.setWideCss();
            this.positionFootnotes();
        }
        else {
            this.$footnoteCollection.hide();
            this.setNarrowCss();
        }
    };
    
    
    /*
     * are there any footnotes
     *
     */
    FootnoteCollection.prototype.footnotesAttached = function() {
        if ($(document).find(".footnote").length > 0 || this.options.forceFootnoteLayout === true){
            return true;
        }
        else {
            return false;
        }
    };
    
    /* fiddle around with bootstrap grids. reset some css that might have been set via the
     * other layout (wide to narrow, narrow to wide)
     */
    FootnoteCollection.prototype.setNarrowCss = function(){
        this.$story.removeClass().addClass("story col-xs-12 col-ms-offset-1 col-ms-10 col-sm-offset-2 col-sm-8");
        this.$footnoteCollection.removeClass().addClass("footnoteCollection");
        $(".footnote").css({ position: '' });
    };
    
    FootnoteCollection.prototype.setWideCss = function() {
        this.footnotesAttached();
        this.$story.removeClass().addClass("story col-sm-8 col-lg-offset-1 col-lg-6");
        this.$footnoteCollection.removeClass().addClass("footnoteCollection col-sm-4 col-md-offset-1 col-md-3");
    };
    
    /* whereas mobile footnotes change the structure considerably,
     * desktop footnotes are just the base footnotes moved around. So they
     * are not created, they are positioned.
     */
    FootnoteCollection.prototype.createFootnotes = function() {
        var that = this;
        if(this.footnotes.length === 0){
            this.footnotes = [];
        
            var $footnotes = this.$footnoteCollection.find('.footnote');
            
            if($footnotes.length === 0){
                this.footnotes.push("no footnotes");
            }
            else {
                for (var i=0; i < $footnotes.length; i++){
                    var footnote = new Footnote($footnotes[i], this.options.layoutBreakpoint);
                    this.footnotes.push(footnote);
                };    
            }
        }
    };
    
    /*
     * footnote collections are mostly generic, but they will need to be formatted for wide or narrow
     * screens.
     */
    FootnoteCollection.prototype.positionFootnotes = function() {
        var minFootnoteOffset = 0;

        for (var i=0; i < this.footnotes.length; i++){
            var footnote = this.footnotes[i];

            if(footnote !== "no footnotes"){
                footnote.upperLinkYPos = footnote.$upperLink.offset().top + this.options.nudge;
                
                if(footnote.upperLinkYPos <= minFootnoteOffset){
                    footnote.$element.offset({top: minFootnoteOffset});
                    minFootnoteOffset += footnote.$element.height() + this.options.footnoteUpperMargin;
                }
                else {
                    footnote.$element.offset({top: footnote.upperLinkYPos});
                    minFootnoteOffset = footnote.upperLinkYPos + footnote.$element.height() + this.options.footnoteUpperMargin;
                }   
            }
        }
    };
    
    /*
     * watch for resizes. If detected, all footnotes will need to be redrawn
     * (though events applied to footnotes in the document will remain)
     */
    FootnoteCollection.prototype.resizeCheck = function () {
        var resizeId;
        var that = this;        
        
        $(window).resize(function() {
            clearTimeout(resizeId);
            resizeId = setTimeout(function(){
                that.wideOrNarrow();
            }, 150);
        });
    };
    
    
    /*
     * Footnote objects contain behaviors for individual footnotes
     */
    function Footnote(footnote, layoutBreakpoint) {
        this.$element = $(footnote);
        this.layoutBreakpoint = layoutBreakpoint;
        this.init();
        this.sympatheticHighlight();
        this.bindFootLinkClick();
    }
    
    Footnote.prototype.init = function(){
        this.id                 = this.$element.data("footnote-number");
        // the link that's in the footnote itself. anchors to link in story text
        this.$lowerLink         = $('.footLink--lower[data-footnote-number="' + this.id + '"]');
        // link in the story to the footnote.
        this.$upperLink         = $('.footLink--upper[data-footnote-number="' + this.id + '"]');
        // height (relative to body) of the upper link.
        this.upperLinkYPos      = "";
        // used later. position of the footnote in wide format. Might be = upperLinkYPos, but might
        // not, depending on the height of the footnote preceeding it.
        this.footnoteYPos       = "";
        // mobile footnotes are actually clones of the regular footnote. See function for explanation
        this.$mobileFootnote    = "";
        // used by mobile footnotes. Part of unlocking the screen.
        this.scrollTop          = "";
        this.windowWidth = $(window).width();
    };
    
    
    /*
     * creates a mobile footnote.
     */
    Footnote.prototype.bindFootLinkClick = function(){
        var that = this;

        if(!this.eventAlreadyBound(this.$upperLink, 'click')){
            this.$upperLink.bind('click', function(event){
                if(!screenWiderThanBreakpoint(that.layoutBreakpoint)){
                    event.preventDefault();
                    that.lockScreen();
                    that.buildMobileFootnote();
                }
            });
        }
    };
    
    /*
     * disable browser scroll, dim content behind footnote
     */
    Footnote.prototype.lockScreen = function() {
        this.scrollTop = $(window).scrollTop();
        
        //$('body').css({ 'overflow' : 'hidden' });
        
        //$('html').addClass('.noScroll');
        //$('html').addClass("noScrollHtml");
        $('body, html').addClass("noScroll");
        
        //$(".noScrollHtml").css({
        //        "top" : "-" + this.scrollTop + "px"
        //});
        
        // the content of the footnote
        $("body").append($("<div>" , {"class": "overlay"}));

        $(".overlay").css("height", $(document).height());
        
    };
    
    
    /*
    * re-enables scrollbar and removes overlay from content behind footnote
    */
    Footnote.prototype.unlockScreen = function() {
        $(".overlay").remove();
        $("body, html").removeClass("noScroll");
        
        $(document).off("click.mobileFootnote");
    };
    
    /*
     * mobile footnotes are clones of the regular footnotes
     * They are created when their link is clicked and destroyed when
     * clicked off.
     */
    Footnote.prototype.buildMobileFootnote = function(){
        var that = this;
        var footnoteNumber = this.$element.find('.footnoteNumber').find(">:first-child").html();
        var footnoteContent = this.$element.find('.footnoteContent').text();
                    
        this.$mobileFootnote = $(
                                    '<div class="mobileFootnote" id="mobileFootnote_' + footnoteNumber + '">' +
                                        '<div class="footnoteClose"><span class="icon-cancel"> </span></div>' +
                                        '<p class="footnoteContent"><span class="footnoteNumber">' + footnoteNumber + ': </span>' + footnoteContent + '</p>' + 
                                    '</div>'
                                );
        
        $("body").append(this.$mobileFootnote);
        
        // get the footnote's height (in the document)
        var mobileFootnoteHeight = this.$mobileFootnote.height();
        
        // get the window's height. Do it here (instead of in init) because
        // the height might have changed between init (page load) and now
        var windowHeight = $(window).height();
        
        // center the footnote in the window.
        var newMobileFootnotePosition = (windowHeight-mobileFootnoteHeight)/2;
        
        this.$mobileFootnote.css({
            "top": newMobileFootnotePosition
        });
        
        this.$mobileFootnote.show();
        
        $(document).on("click.mobileFootnote", $.proxy(this.checkForClose, this));
        
        $(window).resize(function(){
            var newWindowWidth = $(window).width();
            if (newWindowWidth !== that.windowWidth){
                that.windowWidth = newWindowWidth;
                that.closeMobileFootnote();
            }
        });
    };
    
    /*
     * hides and destroys a mobile footnote
     */
    Footnote.prototype.checkForClose = function(event) {
        var $clickTarget = $(event.target);
        if($clickTarget.closest('.footnoteClose').length > 0) {
            this.closeMobileFootnote();
        }
        else if($clickTarget.is(this.$upperLink)) {
            return;
        }
        else if($clickTarget.closest(this.$mobileFootnote).length > 0) {
            return;
        }
        else {
            this.closeMobileFootnote();
        }
    };
    
    Footnote.prototype.closeMobileFootnote = function(){
        this.unlockScreen();
        this.$mobileFootnote.remove();
    };
    
    /*
     * when in widescreen mode, each footnote link (upper or lower) will (almost always) have its
     * sibling visible on screen. When one is hovered over, the other will also light up.
     */
    Footnote.prototype.sympatheticHighlight = function() {
        var that = this;
        if ($('head').find('.sympatheticHover').length === 0) {
            var sympatheticStyleTag = $("<style class='sympatheticHover' type='text/css'> .sympatheticHover{ text-decoration:underline;}</style>");
            sympatheticStyleTag.appendTo("head");    
        }
        if(!this.eventAlreadyBound(this.$upperLink, 'mouseover')){
            if(screenWiderThanBreakpoint(that.layoutBreakpoint)){
                this.$upperLink.hover(function(){
                    that.$lowerLink.toggleClass("sympatheticHover");
                });
                
                this.$lowerLink.hover(function(){
                    that.$upperLink.toggleClass("sympatheticHover");
                });    
            }
            
        }
    };
    
    /*
     * A resize will force all footnotes to reposition and the layout will change, but
     * the bound events can stay the same (sympathetic highlight doesn't care about screen
     * width and mobile footnote clicks figure the position of the footnote on the fly)
     * so there is no reason to recreate those. So this checks to see if there is an
     * event of type X bound so we don't have multiple click events on the same object,
     * for example.
     */
    Footnote.prototype.eventAlreadyBound = function($object, event) {
        var boundEvents = $._data( $object[0], 'events' ) || {};
        return boundEvents.hasOwnProperty(event);
    };
    
    /*
    * both FootnoteCollections and Footnotes use this function, so here it is,
    * banished to outside of both.
    */
   function screenWiderThanBreakpoint(breakPoint) {
        var layoutXsBreakpoint = 320;
        var layoutSmBreakpoint = 480;
        var layoutMdBreakpoint = 768;
        var layoutLgBreakpoint = 992;
        var widthReportedByCss = parseInt($("style").css("width"));
        
        if (breakPoint === "lg" && widthReportedByCss >= layoutLgBreakpoint){
            return true;
        }
        else if (breakPoint === "md" && widthReportedByCss >= layoutMdBreakpoint){
            return true;
        }
        else if (breakPoint === "sm" && widthReportedByCss >= layoutSmBreakpoint){
                return true;
        }
        else if (breakPoint === "xs" && widthReportedByCss >= layoutXsBreakpoint){
                return true;
        }
        else {
            return false;
        }
    };
})(jQuery, window, document);