/**
 * Bootstrap file.
 *
 * @module bootstrap
 * @author mdaniel
 */
(function(){
    var Constants = {
        SWITCHER_SEL: "#mk-switcher"
    };
    
    // Setup console case not defined
    if (typeof console === "undefined") {
        this.console = {};
        this.console.log = function(){
        };
        this.console.info = function(){
        };
        this.console.debug = function(){
        };
        this.console.warn = function(){
        };
        this.console.error = function(){
        };
    }
    
    // ThemeRoller demo
    $(Constants.SWITCHER_SEL).themeswitcher();
    
    $(".ui-state-default").live("mouseover", function(){
        $(this).addClass('ui-state-hover');
    }).live("mouseout", function(){
        $(this).removeClass('ui-state-hover');
    });
    
	
	$(function(){
		$("#doc3 #bd .module li:last").addClass("ui-corner-bottom");
	})
	
})();
