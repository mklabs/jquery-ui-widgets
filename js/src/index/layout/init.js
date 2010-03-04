/**
 * Controller responsible of main layout rendering and behaviour
 * (jqGrid, tabs, layout).
 *
 * @module layout
 *
 */
(function(){

    /**
     * Setup the layout and behvaiour of main page.
     *
     * Init the layout plugin.
     *
     * @class InitLayout
     * @namespace demo.layout
     */
    $(".ui-controller-index-layout-init").controller(function(sandbox){
        console.log("Controller demo.layout.init:", this, arguments);
        
        var container = this, mainTabs = $('#mk-tabs', container), grid = $("#mk-west-grid", container), Constants = {
            tabPrefix: "#mk-tabs-",
            basePath: $.ui.controller.defaults.basePath
        };
        
        
        this.layout({
            north__resizable: false,
            togglerClass: "ui-state-default",
            west__onresize: function(pane, $Pane){
                grid.jqGrid('setGridWidth', $Pane.innerWidth() - 2);
            }
        });
        
        mainTabs.tabs({
            add: function(e, ui){
                console.log("Add:", this, arguments);
                // append close thingy
                $(ui.tab).parents('li:first').append('<span class="ui-tabs-close ui-icon ui-icon-close" title="Close Tab"></span>').find('span.ui-tabs-close').click(function(){
                    mainTabs.tabs('remove', $('li', mainTabs).index($(this).parents('li:first')[0]));
                });
                
                // select just added tab
                mainTabs.tabs('select', '#' + ui.panel.id);
            }
        });
        
        grid.jqGrid({
            url: Constants.basePath + "index/layout/tree.xml",
            datatype: "xml",
            height: "auto",
            pager: false,
            loadui: "disable",
            colNames: ["id", "Items", "url"],
            colModel: [{
                name: "id",
                width: 1,
                hidden: true,
                key: true
            }, {
                name: "menu",
                width: 150,
                resizable: false,
                sortable: false
            }, {
                name: "url",
                width: 1,
                hidden: true
            }],
            treeGrid: true,
            treeGridModel: "adjacency",
            caption: "Menu",
            ExpandColumn: "menu",
            autowidth: true,
            rowNum: 200,
            ExpandColClick: true,
            treeIcons: {
                leaf: 'ui-icon-document-b'
            },
            onSelectRow: function(rowid){
                var treedata = grid.jqGrid('getRowData', rowid);
                window.location.href = treedata.url;
            },
            gridComplete: function(){
                console.log("Grid Complete:", this, arguments);
                sandbox.getController("demo.layout.init").fire('gridComplete');
            }
        });
        
        // append close thingy
        $("li", mainTabs).filter(":first").append('<span class="ui-tabs-close ui-icon ui-icon-close" title="Close Tab"></span>').find('span.ui-tabs-close').click(function(){
            mainTabs.tabs('remove', $('li', mainTabs).index($(this).parents('li:first')[0]));
        });
        
        return {
            id: "index.layout.init",
            init: function(){
                this.listen("gridComplete", this.gridCompleteHandler);
            },
            
            /**
             * event grid
             * @event gridCompleteHandler
             */
            gridCompleteHandler: function(){
                console.log("Grid Complete Handler:", this, arguments);
                var url = window.location.href;
                console.log("Url in place:", url);
                
                var anchor = url.split("#");
                console.log("anchor", anchor.length);
                if (anchor.length > 1) {
                    anchor = anchor[1];
                }
                container.find("td[title='#" + anchor + "']").trigger('click');
            }
        };
    });
})();
