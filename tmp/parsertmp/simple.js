(function(){
	$(".ui-controller-demo-simple").controller({
		id: "demo.simple",
		verbose: true,
	    init: function(model){
	        console.log("I am a fancy controller =)", this);
	        console.log("And i have a model:", model);
			
			this.uiStateHover = "ui-state-highlight";
			this.uiStateHover = "ui-state-hover";
	    },
	    ".todo mouseover": function(ev){ //matches .ui-controller-demo-simple .todo
	        console.log("mouseover", this, arguments);
	        var el = $(ev.target);
	        el.addClass(this.uiStateHover);
	    },
	    ".todo mouseout": function(ev){ //matches .ui-controller-demo-simple .todo
	        console.log("mouseout", this, arguments);
	        var el = $(ev.target);
	        el.removeClass(this.uiStateHover);
	    },
	    "button click": function(ev){ //matches .ui-controller-demo-simple button
	        var el = $(ev.target);
			console.log("click", this, arguments);
	        console.log("Have I access to the Model?", this.Model);
			
	        this.container.find("ol").append("<li class='todo'>New Todo</li>");
	        console.log("Have I access to the Model? dto", this.Model.dto);
	    },
		
		"button mouseover": function(ev){
			$(ev.target).addClass(this.uiStateHover);
	    },
		
		"button mouseout": function(ev){ 
			$(ev.target).removeClass(this.uiStateHover);
	    }
	});
})();
