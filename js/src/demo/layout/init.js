(function(){
	
	/**
	 * Setup the layout and behvaiour of main page.
	 * 
	 * Init the layout plugin.
	 * 
	 * @param {Object} "Controller demo.layout.init:"
	 * @param {Object} this
	 * @param {Object} arguments
	 */
	$(".ui-controller-demo-layout-init").controller(function(sandbox){
		console.log("Controller demo.layout.init:", this, arguments);
		
		var container = this, 
			mainTabs = $('#mk-tabs', container),
			grid = $("#mk-west-grid", container),
			Constants = {
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
                $(ui.tab)
					.parents('li:first')
					.append('<span class="ui-tabs-close ui-icon ui-icon-close" title="Close Tab"></span>')
					.find('span.ui-tabs-close')
					.click(function(){
                    	mainTabs.tabs('remove', $('li', mainTabs).index($(this).parents('li:first')[0]));
                	});
                
                // select just added tab
                mainTabs.tabs('select', '#' + ui.panel.id);
            }
        });
		
		grid.jqGrid({
            url: Constants.basePath + "demo/layout/tree.xml",
            datatype: "xml",
            height: "auto",
            pager: false,
            loadui: "disable",
            colNames: ["id", "Items", "url"],
            colModel: [
				{name: "id", width: 1, hidden: true, key: true}, 
				{name: "menu", width: 150, resizable: false, sortable: false},
				{name: "url", width: 1, hidden: true}
			],
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
                var st, tab, treedata = grid.jqGrid('getRowData', rowid), url;
				console.log("id:", treedata.id, typeof treedata.id);
				if(treedata.id !== "0"){
					alert("More to come soon...");
					return;
				}
				
                if (treedata.isLeaf == "true") {
                    st = Constants.tabPrefix + treedata.id;
					tab = mainTabs.find(st);
                    if (tab.html() != null) {
                        mainTabs.tabs('select', st);
                    } else {
                        mainTabs.tabs('add', st, treedata.menu);
						url = Constants.basePath + "../../" + treedata.url.replace("#", "");
						window.location.href = treedata.url;
						mainTabs.find(st).load(url + " .demo-container");
                    }
                }
            },
			gridComplete: function(){
				console.log("Grid Complete:", this, arguments);
				sandbox.getController("demo.layout.init").fire('gridComplete');
			}
        });
		
		// append close thingy
	    $("li", mainTabs)
			.filter(":first")
			.append('<span class="ui-tabs-close ui-icon ui-icon-close" title="Close Tab"></span>')
			.find('span.ui-tabs-close')
			.click(function(){
	        	mainTabs.tabs('remove', $('li', mainTabs).index($(this).parents('li:first')[0]));
	    	});
		
		return {
			id: "demo.layout.init",
			init: function(){
				this.listen("gridComplete", this.gridCompleteHandler);
			},
			gridCompleteHandler: function(){
				console.log("Grid Complete Handler:", this, arguments);
				var url = window.location.href;
				console.log("Url in place:", url);
				
				var anchor = url.split("#");
				console.log("anchor", anchor.length);
				if(anchor.length > 1){
					anchor = anchor[1];
				}
				container.find("td[title='#" + anchor + "']").trigger('click');
			}
		};
	});
})();