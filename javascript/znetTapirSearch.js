;(function ( $, token, window, document, undefined ) {
    var pluginName = "znetTapirSearch",
        defaults = {
            maxLength               : 250,
            $resultsAttachmentPoint : null,
            searchTitle             : null
        };

    function TapirSearch(element, options ) {
        this.options = $.extend( {}, defaults, options);
        this.$resultsAttachmentPoint = $(element);            
        this.init();
    }

    TapirSearch.prototype = {
        init: function() {
            var searchString = new RegExp('[\\?&]query=([^&#]*)').exec(window.location.href);
            this.searchTerms = searchString[1].toLowerCase().split("+");
            this.searchHits = this.sendTapirQuery();
            
            this.$searchContainer = $('<div>', {class: this.options.searchTitle});
            this.$searchSpinner = $('<span>', {class: 'icon-cog animate-spin loadingSpinner'});
            
            this.$resultsAttachmentPoint.append(this.$searchContainer);
            this.$searchContainer.append('<h2 class="containerTitle">' + this.options.searchTitle + '</h2>');
            this.$searchContainer.append(this.$searchSpinner.hide().fadeIn('slow'));
        },

        sendTapirQuery: function(){
            var that = this;
            $.ajax({
                dataType: "json",
                url: 'http://tapirgo.com/api/1/search.json?token=' + this.options.token + '&query=' + this.searchTerms.join("+") + '&callback=?',
                async: false,
                success: function (hits) {
                    that.$searchSpinner.remove();
                    that.processHits(hits);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
        },
        
        processHits: function(hits){
            var searchTermsInHit = Array();
            var groupedSearchTerms = Array();
            var snippetLength;
            
            if(hits.length > 0){
                for (var i=0; i < hits.length; i++) {
                    new HitSummary({
                        hit: hits[i],
                        searchTerms: this.searchTerms,
                        maxLength: this.options.maxLength,
                        $resultsAttachmentPoint: this.$searchContainer
                    });
                }
            }
            else {
                this.$searchContainer.append('<p class="hit">No results found</p>');
            }
        },
    };
    
    function HitSummary(settings){
        this.hit = settings.hit;
        this.searchTerms = settings.searchTerms;
        this.maxLength = settings.maxLength;
        this.$resultsAttachmentPoint = settings.$resultsAttachmentPoint;
        this.init();
    }
    
    HitSummary.prototype = {
        init: function(){
            this.searchTermGroupSnippets = Array();
            
            searchTermsInHit = this.findSearchTermsInHit(this.hit);
            groupedSearchTerms = this.groupSearchTerms(searchTermsInHit);
            this.createSearchTermGroupSnippets(groupedSearchTerms, this.hit);
            this.appendSearchTermGroupSnippets();
        },
        
        appendSearchTermGroupSnippets: function(){
            var allSnippets = '';
            
            // tapir search helpfully attaches a bunch of analytics stuff to the
            // link url. Which pisses amazon s3 off. So it must go. So does any
            // trailing '/' apparently.
            var cleanedUpLink = this.hit.link.split('?')[0];
            if (cleanedUpLink[cleanedUpLink.length-1] === "/"){
                cleanedUpLink = cleanedUpLink.substring(0, cleanedUpLink.length-1);
            }
            this.$resultsAttachmentPoint.append('<h3 class="title"><a href="' + cleanedUpLink + '">' + this.hit.title + '</a></h2>');
            for (var i = 0; i < this.searchTermGroupSnippets.length; i++){ 
                allSnippets = allSnippets + this.searchTermGroupSnippets[i].snippet + '...';
            }
            this.$resultsAttachmentPoint.append('<p class="hit">' + allSnippets + '</p>');
        },
        createSearchTermGroupSnippets: function(groupedSearchTerms, hit){
            var snippetLength = this.maxLength/groupedSearchTerms.length;
            var snippet;
            
            for (var h=0; h < groupedSearchTerms.length; h++){
                snippet = new SearchTermGroupSnippet(groupedSearchTerms[h], snippetLength, this.hit, this.searchTerms);
                this.searchTermGroupSnippets.push(snippet);
            }
        },
        
        findSearchTermsInHit: function(hit){
            var searchTermsInHit = Array();
            
            for(var j=0; j < this.searchTerms.length; j++){
                searchTermHitIndex = this.hit.content.toLowerCase().indexOf(this.searchTerms[j]);
                if(searchTermHitIndex > -1 ){
                    searchTermsInHit.push(searchTermHitIndex);
                }
            }
            return searchTermsInHit.sort(this.sortNumber);
        },
        
        groupSearchTerms: function(searchTermIndexes){
            var neighborhoods = Array();
            var neighbors = Array();
            var currentTermIndex;
            var maxDistance = 100;

            while (searchTermIndexes.length > 0) {
                currentTermIndex = searchTermIndexes.shift();

                // first time through
                if (neighbors.length === 0) {
                    neighbors.push(currentTermIndex);
                }
                // term is within X characters of the previous index
                else if (neighbors[neighbors.length - 1] + maxDistance > currentTermIndex) {
                    neighbors.push(currentTermIndex);
                }
                // else the term is too far away and we need to start a new subset
                else {
                    neighborhoods.push(neighbors.slice(0));
                    neighbors.length = 0;
                    neighbors.push(currentTermIndex);
                }
            }
            // The while loop will probably exit with an un-pushed set of neighbors.
            if (neighbors.length > 0) {
                neighborhoods.push(neighbors.slice(0));
            }
            return neighborhoods;  
        },
        
        // native javascript doesn't have (!?!) a native method to sort an array
        // of numbers. Defaults to alphabetical
        sortNumber: function(a,b){
            return a - b;
        },
    };
    function SearchTermGroupSnippet(searchTermGroup, snippetLength, hit, searchTerms){
        this.searchTermGroup = searchTermGroup;
        this.snippetLength = snippetLength;
        this.hit = hit;
        this.searchTerms = searchTerms;
        
        this.init();
        this.setup();
    }
    
    SearchTermGroupSnippet.prototype = {
        init: function() {
            this.hitLength = this.hit.content.length;
        },
        
        setup: function(){
            if(this.searchTermGroup.length === 1) {
                this.setSingleTermSnippet(this.searchTermGroup[0]);
            }
            else {
                this.setMultipleTermSnippet(this.searchTermGroup);
            }
        },
        
        setMultipleTermSnippet: function(searchTermIndexes){
            var rawStartIndex = searchTermIndexes[0];
            var rawEndIndex = searchTermIndexes[searchTermIndexes.length - 1];
            var rawSnippetLength = rawEndIndex-rawStartIndex;
            
            if( rawSnippetLength < this.snippetLength){
                var snippetPadding =  Math.round((this.snippetLength - rawSnippetLength) / 2);
                rawStartIndex = rawStartIndex - snippetPadding;
                rawEndIndex = rawEndIndex + snippetPadding;
            }
            
            
            var checkedStartIndex = this.checkStartIndex(rawStartIndex);
            var checkedEndIndex = this.checkEndIndex(rawEndIndex, this.hitLength);
            
            var wholeWordStartIndex = this.getOneMoreWholeWord(checkedStartIndex, -1);
            var wholeWordEndIndex = this.getOneMoreWholeWord(checkedEndIndex, 1);
            
            this.buildSnippet(wholeWordStartIndex, wholeWordEndIndex, this.hit.content);
            this.boldSearchTerms();
        },
        
        setSingleTermSnippet: function(searchTermIndex) {
            var singleTermPadding = Math.ceil(this.snippetLength/2);
            
            var rawStartIndex = searchTermIndex - singleTermPadding;
            var rawEndIndex = searchTermIndex + singleTermPadding;
            
            var checkedStartIndex = this.checkStartIndex(rawStartIndex);
            var checkedEndIndex = this.checkEndIndex(rawEndIndex, this.hitLength);
            
            var wholeWordStartIndex = this.getOneMoreWholeWord(checkedStartIndex, -1);
            var wholeWordEndIndex = this.getOneMoreWholeWord(checkedEndIndex, 1);
            
            this.buildSnippet(wholeWordStartIndex, wholeWordEndIndex, this.hit.content);
            this.boldSearchTerms();
        },
        
        buildSnippet: function(startIndex, endIndex, content){
            this.snippet = content.substring(startIndex, endIndex).replace(/(\r\n|\n|\r)/gm, "");
        },
        
        checkStartIndex: function(startIndex){
            if(startIndex < 0){
                return 0;
            }
            else{
                return startIndex;
            }
        },
        
        checkEndIndex: function(endIndex, maxLength){
            if(endIndex > maxLength){
                return maxLength;
            }
            else {
                return endIndex;
            }
        },
        
        getOneMoreWholeWord: function(snippetStartPoint, direction){
            var terminators = [" ", ",", ";", "--", ".", "!", "?", ":"];

            // direction = -1 is get previous word. direction = 1 get next word
            if (direction !== -1) {
                direction = 1;
            }
            
            while (terminators.indexOf(this.hit.content[snippetStartPoint]) === -1 && snippetStartPoint < this.hit.content.length - 1 && snippetStartPoint > 0) {
                snippetStartPoint = snippetStartPoint + direction;
            }
            return snippetStartPoint;  
        },
        
        boldSearchTerms: function(){
            for (var i = 0; i < this.searchTerms.length; i++){
                this.snippet = this.snippet.replace(new RegExp('(^|)(' + this.searchTerms[i] + ')(|$)','ig'), '$1<b>$2</b>$3');                
            }
        },
    };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new TapirSearch(this, options));
            }, $.isFunction(callback) && callback.call(this));
        }
    };

})( jQuery, window, document );