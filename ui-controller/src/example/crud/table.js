/**
 * Controller of main table page. <br />
 *
 * Deal with user interaction such as mouseover and row selection, so as to buttons binding.
 *
 * @module table-controller
 */
/*global $, console*/
wtf.require("/js/src/controller/module/myModule.js", function(SandBox){


    /**
     * Just for fun. Here is a base class that TableController will extend.
     *
     * @class LogMyRow
     * @namespace wt.controller
     */
    $.controller("wt.controller.LogMyRow", {
        /**
         * Just for logging purpose. We make sure to call the super one.
         * @constructor
         */
        init: function(){
            console.log("Base:", this, arguments);
            
            this._super();
        },
        
        /**
         * Dummy method.
         * @method doCommonStuff
         */
        doCommonStuff: function(){
            alert("doCommonStuff");
            
        },
        
        "table click": function(){
            console.log("On tables too!", this, arguments);
        },
        
        "table tr click": function(){
            console.log("I am a logger. I log your row!", this, arguments);
        }
    });
    
    
    // Use inheritence to get some more features
    $(".ui-controller-example-crud-table").controller("wt.controller.LogMyRow", function(){
        console.log("Controller singleton", this, arguments);
        
        var container = this;
        
        var loadingIcon = $("<p />").text("Loading...");
        
        // Private stuff
        var Constants = {
            DIALOG_URL: "/weekly/test/create/",
            SELF_URL: window.location.href
        };
        
        var myDialog = $("<div />").dialog({
            autoOpen: false
        });
        
        
        return {
            // Important, identify yourself
            id: "wt.TableController",
            init: function(){
                console.log("Init testCase", this, arguments);
                
                this._super(arguments);
                
                console.log("handleRefresh?", this, this.handleRefresh);
                
                this.listen('refreshTable', this.handleRefresh);
                
                for (var i in SandBox) {
                    console.log(SandBox[i]);
                }
                
                
            },
            ".cmd-add click": function(){
                console.log("Click add:", this, arguments);
                
                myDialog.empty().load(Constants.DIALOG_URL, {
                    start: this.Model.dto.start,
                    end: this.Model.dto.end
                });
                
                myDialog.showDialog();
                
            },
            ".cmd-edit click": function(){
                console.log("Click edit:", this, arguments);
            },
            ".cmd-remove click": function(){
                console.log("Click remove:", this, arguments);
                var ids = "";
                var selected = this.getSelected();
                var selectedNb = selected.size();
                
                if (selectedNb === 1) {
                    ids = selected.find("td:eq(0)").text();
                } else if (selectedNb > 1) {
                    $.each(selected, function(i){
                        var last = (selectedNb === (i + 1));
                        ids += $(this).find("td:eq(0)").text() + (last ? "" : ",");
                    });
                } else {
                    throw new Error("have to select a line, bro!");
                }
                
                $.get("/weekly/event/delete/" + ids);
                
                this.fire('refreshTable', {
                    data: 'foo'
                });
            },
            
            "table refresh": function(ev){
                console.log("I'm fresh and refresh!", this, arguments);
                this.handleRefresh();
            },
            
            "tr click": function(ev){
                console.log("click tr", this, arguments);
                var prevSelected = this.getSelected();
                if (prevSelected && !ev.altKey) {
                    prevSelected.removeClass("ui-state-highlight");
                }
                
                $(ev.currentTarget).addClass("ui-state-highlight");
            },
            
            "tr mouseover": function(ev){
                $(ev.currentTarget).css('cursor', 'pointer');
            },
            
            handleRefresh: function(){
                console.log("handleRefresh", this, arguments);
                var table = $("table", container);
                var caption = table.find("caption");
                var prevText = caption.text();
                
                caption.text("En chargement");
                
                table.find("tbody").empty().load(Constants.SELF_URL + " table tbody tr", function(){
                    caption.text(prevText);
                });
            },
            
            getSelected: function(){
                return container.find("table tr.ui-state-highlight");
            }
        };
    });
    
});
