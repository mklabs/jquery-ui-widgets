DUI(["ui/all.js", "plugin/ui.controller.js"], function(){
	
	$("#wt-event-form-test-case").controller(function(sb){
		console.log("Controller singleton", this, arguments);
		
		var self = this;
		var dialog = this.parents('.ui-dialog-content').data('dialog');
		
		var tableController = sb.getController("wt.TableController");
		
		console.log("tableController:", tableController);
				
		return {
			// Important, identify yourself
			id: "wt.DialogController",
			init: function(){
				console.log("Init testCase", this, arguments);
				
				this._super();
				
			},
			
			
			destroy: function(){
				console.log("Destroy testCase", this, arguments);
			},
			
			".cmd-save click": function(e){
				console.log("Click save:", this, arguments);
				
				var postData = self.serializeArray();
								
				$.post("/weekly/event/save/", postData);
				
				
				this.fire('refreshTable');
						
				return false;
			},
			
			".cmd-cancel click": function(){
				console.log("Click cancel:", this, arguments, dialog);
				dialog.close();
				return false;
			}
		}
	});
	
});