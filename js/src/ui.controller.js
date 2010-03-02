/**
 * The Controller widget module provides clean and handy way 
 * to organize your jQuery code.
 * 
 * 
 * @module controller
 * @author mdaniel
 */
(function($){

	
    var Class, SandBox, BaseController;
	
	var urlFilter = function(url){
        if (!/\./.test(url) || (/^(\w+)./.test(url) && !/\//.test(url) && !/.js$/.test(url))) {
            url = url.replace(/^(\w+)./, function(all, name){
                return (require.namespace[name] || name) + "/";
            });
			
        }
        
        return url;
    };

	var isRemote = function(url){
        var parts = rurl.exec(url);
        return parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
    };
    
    /**
     * Base Class.
     * 
     * Based on jresig's implementaton (http://ejohn.org/blog/simple-javascript-inheritance/)
     * 
     * All subsequent controllers are inherited from BaseController which extend this Class.
     * 
     * @class Class
     * 
     */
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){
            xyz;
        }) ? /\b_super\b/ : /.*/;
        
        // The base Class implementation (does nothing)
        Class = function(){};
        
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
    
    /**
     * SandBox Singleton available in any controllers instance. <br />
     *
     * The sandbox is provided to you through parameters in your module impementation:
     *
     * <code>
     * $(".myController").controller(function(sandbox){
     *	// Some code
     * });
     *
     * @class SandBox
     * @static
     */
    SandBox = function(){
    
        return {
			/**
			 * Allow you to retrieve a specific controller from the internal cache
			 * @param {String} id
			 * @return {BaseController} controller instance 
			 */
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
    
    /**
     * Base Controller Class. All subsequent controller will inherit this one.
     * 
     * Provides common interface for controllers communication.
     * 
     * @class BaseController
     * @extends Class
     */
    BaseController = Class.extend({
		/**
		 * Init method. Called each time a controller is destroyed 
		 * (usually removed from the dom).
		 * @method init
		 * @constructor
		 */
        init: function(container){
            this.Model = {};
            this.Elements = {};
        },
		
		/**
		 * Destroy method. Called each time a controller is destroyed 
		 * (usually removed from the dom).
		 * 
		 * Basically just delete container reference and re-init the model.
		 * Elements are kept since are needed for events unbinding.
		 * 
		 * @method destroy
		 */
		destroy: function(){
			console.info("BaseController.destroy()", this, arguments);
			this.Model = null;
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
    
	
    /**
     * 
     * Widget implentation of controllers. <br />
     * 
	 * Does a few things:
	 * <ul>
	 *     <li>
	 *       At this point, controller instance is already created and provided 
	 *       by the proxy controller.
	 *     </li>
	 *     <li>
	 *       Init model by walking through hidden inputs in controller container 
	 *       and make it available to use via this.Model
	 *     </li>
	 *     <li>Setup event delegation restricted to controller container.</li>
	 * </ul>
     * 
     * @class controller
     * @namespace $.ui
     * @constructor
     */
    $.widget('ui.controller', {
		/**
		 * Controller method. Setup instance in widget ones, init model and events.
		 * @method _init
		 * @private
		 */
        _init: function(){
            console.info("Controller widget init", this, arguments);
            this.instance = this.options;
			this.instance.container = this.element;
            this._initModel();
            this._initEvents();
        },
        
		/**
		 * Delegated destroy method from widget's prototype.
		 * 
		 * Remove any delegated event handlers, call the controller's destroy 
		 * method and widget's super one.
		 * 
		 * @method destroy
		 */
        destroy: function(){
            // Should we also delete instance from cached controllers? Or keep it for further use?
            console.log("What about proper destroy?", this, arguments);
            var instance = this.instance;
            
            if ($.isFunction(instance.destroy)) {
                instance.destroy.apply(this, arguments);
            }
            this._unbindEvents();
			$.widget.prototype.destroy.apply(this, arguments);
        },
        
		/**
		 * Setup event delegation restricted to the controller container.
		 * 
		 * Each eventHandler is given a context (thanks to $.proxy method) that matchs the correct instance. This means that you could use something 
		 * like this.doThing() in there. The original or current target are still available in Event object passed in as parameter.
		 * 
		 * @method _initEvents
		 * @private
		 * 
		 */
        _initEvents: function(){
            var self = this, instance = this.instance;
			
			// Iterate trough controller instance to attach event handlers
            $.each(instance, function(prop, value){
                var sel = prop.split(" ")[0];
                var action = prop.split(" ")[1];
                var callback;
                
                if (!action) return;
                
                callback = $.isFunction(value) ? value : function(){};
                instance.Elements[sel] = $(sel, self.element);
                instance.Elements[sel].live(action, $.proxy(callback, instance));
            });
        },
        
		/**
		 * Init model by walking through hidden inputs within controller container 
	 	 * and make it available to use via this.Model
	 	 * 
	 	 * @method _initModel
	 	 * @private
		 */
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
        
		/**
		 * FIXME: TDB
		 * 
		 * Removes any event handlers fir this particular component.
		 * @method _unbindEvents
		 * @private
		 * 
		 */
        _unbindEvents: function(){
            console.info("_unbindEvents:", this, arguments);
			
			var instance = this.instance;
			
			$.each(instance.Elements, function(i, handler){
				console.log("Removing all previously registered event.", this);
				this.die();
			});
			
        }
    });
    
    $.ui.controller.defaults = {
		basePath: "/jquery-ui-controller/js/src/"
	};
    
	// Make cache globaly accesible via ui controller namespace
    $.ui.controller.controllers = controllers;
    
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
        
        if (parent instanceof BaseController) {
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
            instance = _createInstance.call(this, baseController, prototype)
            
            // Start the controller by calling controller widget			
            return _controller.call(this, instance);
        } else {
            throw new Error("Controllers must follow the module pattern.");
        }
    };
    
    // create controller constructor
    $.controller = function(name, prototype){
		// Change this to only be stored in the internal cache? Only accesible via Sandbox?
		
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
    
	// Workaround to get remove event triggered on empty and load method since jQuery 1.4.
	// (They don't internally called remove one anymore)
    $.fn.empty = function(){
        console.log("empty:", this, arguments);
        
        $("*", this).each(function(){
            $(this).triggerHandler("remove");
        });
        
        return _empty.apply(this, arguments);
    };
    
    $.fn.load = function(){
        console.log("load:", this, arguments, _load);
        
        $("*", this).each(function(){
            $(this).triggerHandler("remove");
        });
		
        return _load.apply(this, arguments);
    };
	
	/*
	 May be not so elegant... Responsible of re-binding controller's widget with previously stored instance, if any.
	 Non event live event a la livequery may be very usefull there.
    $(document).ajaxComplete(function(e, xhr, settings){
		var t = $(xhr.responseText);
		var context = settings.context;

		$.each(controllers, function(){
			var f = $(this.sel, context);
			if(f.get(0)){
				// Reinit controller with previously stored instance
				f.controller(this.instance);
			}
			
		});
    });
    */
	
	$("[class^='ui-controller']").livequery(function(){
		var target = $(this);
		var basePath = $.ui.controller.defaults.basePath;
		var context = target.parent();
		var cssClass = target.attr("class")
		var url = cssClass.split(" ")[0].replace("ui-controller-", "").replace(/-/g, "/") + ".js";
		console.log("Load features ", basePath + url);
		
		// Try a require case its our first met
		require(basePath + url);

		// Iterate trough controllers case we already met
		$.each(controllers, function(){
			var f = $(this.sel, context);
			if(f.get(0)){
				// Reinit controller with previously stored instance
				f.controller(this.instance);
			}
			
		});
		
	}, function(){
		console.log("Livequery out:", this, arguments);
	});
	
    
	
	/**
	 * Internal use only.
	 * 
	 * Does three things:
	 * <ul>
	 *     <li>Extends the baseController and create a fresh a new instance.</li>
	 *     <li>
	 *       Stores a reference of newly created instance in an internal controllers cache 
	 *       (with some metadata, namely used selector and base Class)</li>
	 *     <li>Setup error handling in controllers instance.</li>
	 * </ul>
	 * 
	 * FIXME: Prevent multiple instantiation of same controller. 
	 *   Will have to check in cache first.
	 * 
	 * @private
	 * @param {Object} baseController
	 * @param {Object} prototype
	 */
    function _createInstance(baseController, prototype){
        var Base, _init, name, method, controllerId = prototype.id ? prototype.id : this.attr("id").replace(/-/g, "_");
		
		if(!controllerId || controllerId === ""){
			throw new Error("Unable to compute controller identifier, please provide one or an id attribute upon the target DOM Element.")
		}
		
		// Make sure we always call the BaseController constructor
		if($.isFunction(prototype['init'])){
			_init = prototype['init'];
			prototype['init'] = function(){
				this._super.apply(this, arguments);
				return _init.apply(this, arguments);
			};
		}
		
		Base = baseController.extend(prototype);
		
        // Store a reference to the instance controller
        controllers[controllerId] = {
            instance: new Base(this),
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
		
        return controllers[controllerId].instance;
    };
	
	function require(options){
	    var xhr, requestDone, ival, head, script, length = arguments.length - 1, callback = arguments[length];
	    
	    if (length > 1) {
	        if (!$.isFunction(callback)) {
	            callback = null;
	            length = arguments.length;
	        }
	        
	        for (var i = 0; i < length; i++) {
	            // We only need to run the callback after all the scripts have loaded
	            require(arguments[i], i === length - 1 ? callback :                    
					// Make sure that a blank callback is provided to ensure async transport
	            	$.isFunction(callback) ? function(){} : null);
	        }
	        
	        return;
	    }
	    
	    if (options && !options.url) {
	        options = {
	            url: options,
	            success: callback
	        };
	    }
	    
	    options.url = urlFilter(options.url);
	    
	    if (!options || requireCache[options.url] != null) {
	        // File is already loaded, immediately execute the callback
	        if ($.isFunction(callback)) {
	            callback();
	        }
	        
	        return;
	    }
	    
	    requireQueue.push(options);
	    requireCache[options.url] = false;
	    
	    // If the DOM ready event has already occurred, we need to go synchronous
	    if (!isRemote(options.url)) {
	        xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
	        
	        xhr.open("GET", options.url, !$.isReady);
	        xhr.send(null);
	        
	        function checkDone(){
	            if (!requestDone && xhr && xhr.readyState === 4) {
	                requestDone = true;
	                
	                // clear poll interval
	                if (ival) {
	                    clearInterval(ival);
	                    ival = null;
	                }
	                
	                execRequire(options.url, xhr.responseText, callback);
	            }
	        }
	        
	        if ($.isReady) {
	            checkDone();
	        } else {
	            ival = setInterval(checkDone, 13);
	        }
	        
	        // Otherwise we can still load scripts asynchronously
	    } else {
	        head = document.getElementsByTagName("head")[0] || document.documentElement;
	        script = document.createElement("script");
	        
	        script.src = options.url;
	        
	        if (options.scriptCharset) {
	            script.charset = options.scriptCharset;
	        }
	        
	        // Attach handlers for all browsers
	        script.onload = script.onreadystatechange = function(){
	            if (!requestDone &&
	            (!this.readyState ||
	            this.readyState === "loaded" ||
	            this.readyState === "complete")) {
	            
	                requestDone = true;
	                
	                // Handle memory leak in IE
	                script.onload = script.onreadystatechange = null;
	                
	                if (head && script.parentNode) {
	                    head.removeChild(script);
	                }
	                
	                execRequire(options.url, null, callback);
	            }
	        };
	        
	        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
	        // This arises when a base node is used 
	        head.insertBefore(script, head.firstChild);
	    }
	};
	
	require.namespace = {};
	
	function execRequire(url, script, callback){
        var item, i, exec = true;
        
        requireCache[url] = true;
        
        for (i = 0; i < requireQueue.length; i++) {
            item = requireQueue[i];
            
            if (item.url === url) {
                if (script != null) {
                    item.script = script;
                } else {
                    next();
                    continue;
                }
                
            }
            
            if (exec && item.script) {
                $.globalEval(item.script);	
                next();
            } else {
                exec = false;
            }
        }
        
        if ($.isFunction(callback)) {
            callback();
        }
        
        // Check to see if all scripts have been loaded
        for (var script in requireCache) {
            if (requireCache[script] === false) {
                return;
            }
        }
        
        readyReady();
        
        function next(){
            if ($.isFunction(item.callback)) {
                item.callback();
            }
            
            requireQueue.splice(i--, 1);
        }
    };
	
	function readyReady(){
        if ($.isReady && requireQueue.length === 0) {
            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them
                var fn, i = 0;
                while ((fn = readyList[i++])) {
                    fn.call(document, $);
                }
                
                // Reset the list of functions
                readyList = null;
                
                // Trigger any bound ready events
                if ($.fn.triggerHandler) {
                    $(document).triggerHandler("ready");
                }
            }
        }
    };
			
    /**
     * Based on DUI's one.  <br />
     *
     * Make a namespace within a class.
     * Usage 1: MyClass.ns('foo.bar');
     * Usage 2: MyClass.ns('foo.bar', 'baz');
     * 
     * @param {String} name Period separated list of namespaces to nest. MyClass.ns('foo.bar') makes MyClass['foo']['bar'].
     * @param {optional mixed} value Set the contents of the deepest specified namespace to this value. 
     * 
     */
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
                    } else if (i == levels.length - 1 && nsValue) {
                        //Ok, so we're setting. Is it time to set yet or do we move on?
                        nsobj[level] = nsValue;
                    } else if (typeof nsobj[level] == 'undefined') {
                        //...nope, not yet. Check to see if the ns doesn't already exist in our class...
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
    
})(jQuery);