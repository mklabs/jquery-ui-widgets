/**
 * Controller widget
 *
 * @author mdaniel
 */
(function(){

    var debug = false;
    
    var _controller, _live = $.fn.live, _empty = $.fn.empty, _load = $.fn.load;
    
    var controllers = {};
    
    var Class, SandBox, BaseController;
    
    var createInstance = function(baseController, prototype){
        var Base = baseController.extend(prototype);
        var instance = new Base(this), name, method;
        
        var controllerId = prototype.id ? prototype.id : this.attr("id").replace(/-/g, "_");
        
        // Store a reference to the instance controller
        controllers[controllerId] = {
			instance: instance,
			base: Base,
			sel: this.selector
		};
        
        
        if (!debug) {
            for (name in instance) {
                method = instance[name];
                if ($.isFunction(method)) {
                    instance[name] = function(name, method){
                        return function(){
                            try {
                                return method.apply(this, arguments);
                            } catch (ex) {
                                console.error(1, name + "(): " + ex.message);
                            }
                        };
                    }(name, method);
                }
            }
        }
        return instance;
    };
    
    
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){
            xyz;
        }) ? /\b_super\b/ : /.*/;
        
        // The base Class implementation (does nothing)
        Class = function(){
        };
        
        // Create a new Class that inherits from this class
        Class.extend = function(prop){
            var _super = this.prototype;
            
            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;
            
            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn){
                    return function(){
                        var tmp = this._super;
                        
                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];
                        
                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        
                        return ret;
                    };
                })(name, prop[name]) : prop[name];
            }
            
            // The dummy class constructor
            function Class(){
                // All construction is actually done in the init method
                if (!initializing && this.init) this.init.apply(this, arguments);
            }
            
            // Populate our constructed prototype object
            Class.prototype = prototype;
            
            // Enforce the constructor to be what we expect
            Class.constructor = Class;
            
            // And make this class extendable
            Class.extend = arguments.callee;
            
            return Class;
        };
    })();
    
    SandBox = function(){
    
        return {
            getController: function(id){
                if (!id) {
                    throw new Error("SandBox.getController(): Id paramater is mandatory and missing.");
                }
                
                if (!controllers[id]) {
                    throw new Error("Sandbox.getController(): Couldn't retrive controller with id ==> " + id);
                }
                
                return controllers[id].instance;
            }
        }
    }();
    
    
    BaseController = Class.extend({
        init: function(container){
            console.info("new Controller", this, arguments);
            
            this.container = container;
            this.Model = {};
            this.Elements = {};
        },
        
        listen: function(eventType, handler){
            console.log("listen:", this, arguments);
            $(this).bind(eventType, handler);
        },
        fire: function(eventType, data){
            console.log("fire:", this, arguments);
            // Fire up to all registered controllers
            
            // Role of sandbox to talk to strangers? 
            // Should prototyped fire function just fire on the current instance?
            $.each(controllers, function(){
                $(this.instance).trigger(eventType, data);
            });
        }
    });
    
    
    $.widget('ui.controller', {
        _init: function(){
            console.info("Controller widget init", this, arguments);
            
            var instance = this.instance = this.options;
            
            this._initModel();
            
            this._initEvents();
        },
        
        destroy: function(){
			// Should we also delete instance from cached controllers? Or keep it further use?
            console.log("What about proper destroy?", this, arguments);
            var o = this.options;
            
            if ($.isFunction(o.destroy)) {
                o.destroy.apply(this, arguments);
            }
            
            this._unbindEvents();
        },
        
        _initEvents: function(){
            var self = this, instance = this.instance;
            $.each(instance, function(prop, value){
                var sel = prop.split(" ")[0];
                var action = prop.split(" ")[1];
                var callback, context;
                
                if (!action) return;
                
                callback = $.isFunction(value) ? value : function(){
                };
                instance.Elements[sel] = $(sel, self.element);
                instance.Elements[sel].live(action, $.proxy(callback, instance));
            });
        },
        
        _initModel: function(){
            // Walk through hidden input and init model
            var model = this.element.find("input[type='hidden']").serializeArray();
            var instance = this.instance;
            // Fill in model
            $.each(model, function(i, data){
                var name = data.name;
                var value = data.value;
                ns.call(instance.Model, name, value);
            });
        },
        
        _unbindEvents: function(){
            // TBD
        }
    });
    
    $.ui.controller.defaults = {};
    
    $.ui.controller.controllers = controllers;
    
    // FIXME: Delegate instance creation to a factory or delegated function
    // 	Handle version?
    _controller = $.fn.controller;
    $.fn.controller = function(parent, entrypoint){
        console.info("Init controller:", this, arguments);
        var instance, prototype, baseController, controllerId;
        
        if (parent.constructor === Object) {
            return $.fn.controller.call(this, function(sb){
                return parent;
            });
        }
		
		if(parent instanceof BaseController){
			return _controller.call(this, parent);			
		}
        
        if (parent.constructor === String) {
            // We depends on some Base Controller
            baseController = controllers[parent] ? _controllers[parent].base : ns.call($, parent);
            
            if (!baseController) {
                throw new Error("$.fn.controller: Unable to retrieve base controller: " + parent);
            }
        } else if ($.isFunction(parent)) {
            baseController = BaseController;
            entrypoint = parent;
            parent = null;
        }
        
        if ($.isFunction(entrypoint)) {
            prototype = entrypoint.call(this, SandBox);
            instance = createInstance.call(this, baseController, prototype)
            
            // Start the controller by calling controller widget			
            return _controller.call(this, instance);
        } else {
            throw new Error("Controllers must follow the module pattern.");
        }
    };
    
    // create controller constructor
    $.controller = function(name, prototype){
        // Create namespace under jQuery one and store Controller class
        ns.call($, name, BaseController.extend(prototype));
    };
    
    $.fn.showDialog = function(options){
        return this.each(function(){
            $(this).dialog('open');
        });
    };
    
    $.fn.live = function(){
        console.log("Live:", this, arguments);
        return _live.apply(this, arguments);
    };
    
    $.fn.empty = function(){
        console.log("empty:", this, arguments);
        
        $("*", this).each(function(){
            $(this).triggerHandler("remove");
        });
        
        return _empty.apply(this, arguments);
    };
    
    $.fn.load = function(){
        console.log("load:", this, arguments);
        
        $("*", this).each(function(){
            $(this).triggerHandler("remove");
        });
        
        return _load.apply(this, arguments);
    };
	
    $(document).ajaxComplete(function(e, xhr, settings){
		var t = $(xhr.responseText);
		var context = settings.context;

		$.each(controllers, function(){
			var sel = this.sel;
			var instance = this.instance;
			var f = $(sel, context);
			
			if(f.get(0)){
				// Reinit controller with previously stored instance
				f.controller(instance);
			}
			
		});
		
    });
    
    
    function ns(){
        if (arguments.length == 0) throw new Error('ns should probably have some arguments passed to it.');
        
        var arg = arguments[0];
        var levels = null;
        var get = (arguments.length == 1 || arguments[1] === undefined) && arg.constructor != Object ? true : false;
        
        if (arg.constructor == String) {
            var dummy = {};
            dummy[arg] = arguments[1] ? arguments[1] : undefined;
            
            arg = dummy;
        }
        
        if (arg.constructor == Object) {
            var _class = this, miss = false, last = this;
            
            $.each(arg, function(nsName, nsValue){
                //Reset nsobj back to the top each time
                var nsobj = _class;
                var levels = nsName.split('.');
                
                $.each(levels, function(i, level){
                    //First, are we using ns as a getter? Also, did our get attempt fail?
                    if (get && typeof nsobj[level] == 'undefined') {
                        //Dave's not here, man
                        miss = true;
                        
                        //Break out of each
                        return false;
                    }                    //Ok, so we're setting. Is it time to set yet or do we move on?
                    else if (i == levels.length - 1 && nsValue) {
                        nsobj[level] = nsValue;
                    }                    //...nope, not yet. Check to see if the ns doesn't already exist in our class...
                    else if (typeof nsobj[level] == 'undefined') {
                        //...and make it a new static class
                        nsobj[level] = {};
                    }
                    
                    //Move one level deeper for the next iteration
                    last = nsobj = nsobj[level];
                });
            });
            
            return miss ? undefined : last;
        }
    };
    
    
    })();

