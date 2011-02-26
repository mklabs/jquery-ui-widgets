/**
 *
 * Core application.
 *
 * @author mdaniel
 *
 * @module wtf-core
 */
(function($){

    var Class, Sandbox, wtf;
    
    // Static function taken from prototype
    var props = ["Class", "attach", "ns", "register", "module", "start", "startAll", "stop", "stopAll", "load", "require", "requireCache", "isRemote"];
    
    // The queue of required scripts currently being loaded
    var requireQueue = [];
    
    // The functions to execute on DOM ready
    var readyList = [];
    
    // Match portions of a URL
    var rurl = /^(\w+:)?\/\/([^\/?#]+)/;
    
    var Env = {
        scriptUrl: "/js/"
    };

    /**
     * Simple javascript inheritence.
     * 
     * Based on jresig implementation.
     * 
     * @class Class
     * 
     */
    // Inspired by base2 and Prototype
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        
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
                prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) 
					? (function(name, fn){
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
     * Core static class.
     *
     * @class WTF
     */
	// Define a local copy of our framework
	wtf = function() {
		var length = arguments.length - 1, callback = arguments[ length ];
		
		var str = "", re = /(wtf\.\S+\()/gim, matches = [], match, unique = false, toLoad, tmp, src;
		
		
		if ( length >= 1 ) {
			if ( !$.isFunction( callback ) ) {
		 		callback = null;
				length = arguments.length;
				matches = arguments;
			}else{
				matches = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
			}
		}
		
        callback = callback && $.isFunction(callback) ? callback : function(){};
        str = callback.toString();
        while (match = re.exec(str)) {
            toLoad = false;
            match = match[1] || null;
            match = match.replace('wtf.', '').replace('(', '');
			
			
            if ($.inArray(match, props) === -1) {
				tmp = match.split(".");
				tmp = tmp.slice(0, tmp.length - 1)
				match = tmp.join(".");
				toLoad = true;
            }
            
            if (toLoad) matches.push(match);
        }
       
		if(matches.length ==+ 0){
			// No dependencies there, execute the callback
			callback();
			
			return;
		}
		
        for (var i = 0; i < matches.length; i++) {
			tmp = matches[i].replace(/\./g, "/").split("/");
			src = Env.scriptUrl + "wtf/" + tmp.join("/") + ".js";
            
            // We only need to run the callback after all the scripts have loaded
			wtf.require(src, i === (length === 0 ? length : length - 1) ? callback : 
				// Make sure that a blank callback is provided to ensure async transport
				$.isFunction( callback ) ? function(){} : null );
        }
	
	};
    
    wtf.prototype = function(){
        var moduleData = {}, debug = false;
        
        function createInstance(moduleId){
            var s = new Sandbox(this);
            var instance = moduleData[moduleId].entrypoint(s.base, s), name, method;
            
            if (!instance) {
                console.error("Module entrypoint must return something, dude.");
            }
            
            if (!debug) {
                for (name in instance) {
                    method = instance[name];
                    if (typeof method == "function") {
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
        }
        
        
        
        return {
            // make class available
            Class: Class,
            
            init: function(){
                return this;
            },
            
            module: function(moduleId, entryPoint){
                console.info("module:", this, arguments);
                this.register(moduleId, entryPoint);
                this.start(moduleId);
                this.attach(moduleId, moduleData[moduleId].instance);
            },
            
            attach: function(moduleId, entrypoint){
                console.info("attach:", this, arguments);
                this.ns(moduleId, entrypoint);
            },
            
            // taken from dui
            ns: function ns(){
                console.info("ns:", this, arguments);
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
            },
            
            register: function(moduleId, entryPoint){
                console.info("register:", this, arguments);
                moduleData[moduleId] = {
                    entrypoint: entryPoint,
                    instance: null
                };
            },
            
            start: function(moduleId){
                console.info("start:", this, arguments);
                
                var instance = createInstance.call(this, moduleId);
                
                if (instance) {
                    moduleData[moduleId].instance = instance;
                    if ($.isFunction(moduleData[moduleId].instance.init)) {
                        moduleData[moduleId].instance.init();
                    }
                } else {
                    console.error("Error while statring module ", moduleId);
                }
                
            },
            
            stop: function(moduleId){
                console.info("start:", this, arguments);
                
                var data = moduleData[moduleId];
                if (data.instance) {
                    data.instance.destroy();
                    data.instance = null;
                }
            },
            
            startAll: function(){
                console.info("startAll:", this, arguments);
                
                for (var moduleId in moduleData) {
                    if (moduleData.hasOwnProperty(moduleId)) {
                        this.start(moduleId);
                    }
                }
            },
            stopAll: function(){
                console.info("stopAll:", this, arguments);
                for (var moduleId in moduleData) {
                    if (moduleData.hasOwnProperty(moduleId)) {
                        this.stop(moduleId);
                    }
                }
            },
            
            require: function(options){
                var xhr, requestDone, ival, head, script, length = arguments.length - 1, callback = arguments[length];
                
                if (length > 1) {
                    if (!$.isFunction(callback)) {
                        callback = null;
                        length = arguments.length;
                    }
                    
                    for (var i = 0; i < length; i++) {
                        // We only need to run the callback after all the scripts have loaded
                        wtf.require(arguments[i], i === length - 1 ? callback :                    
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
                
                options.url = wtf.require.urlFilter(options.url);
                
                if (!options || wtf.requireCache[options.url] != null) {
                    // File is already loaded, immediately execute the callback
                    if ($.isFunction(callback)) {
                        callback();
                    }
                    
                    return;
                }
                
                requireQueue.push(options);
                wtf.requireCache[options.url] = false;
                
                // If the DOM ready event has already occurred, we need to go synchronous
                if (!wtf.isRemote(options.url)) {
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
            },
            
            // Keep track of URLs that have been loaded
            requireCache: {},
            
            // Check to see if a URL is a remote URL
            isRemote: function(url){
                var parts = rurl.exec(url);
                return parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
            }
        }
    }();
	
    // Copy all needed function from the prototype
    for (var prop in wtf.prototype) {
        if ($.inArray(prop, props) !== -1) {
            wtf[prop] = wtf.prototype[prop];
        }
    }
    
    wtf.require.urlFilter = function(url){
        if (!/\./.test(url) || (/^(\w+)./.test(url) && !/\//.test(url) && !/.js$/.test(url))) {
            url = url.replace(/^(\w+)./, function(all, name){
                return (wtf.require.namespace[name] || name) + "/";
            }).replace(/\./g, "/") +
            ".js";
        }
        
        return url;
    };
    
    wtf.require.namespace = {};
    
    
    
    var Sandbox = Class.extend({
        base: $,
        init: function(){
            console.log("Sandbox init...", this, arguments);
        }
    });
    
    // Expose our framework to the global object
    window.wtf = wtf;
    
    wtf.Env = Env;
    
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
	
	/* */
	$.globalEval = function(data){
		console.log("Global Eval mine", this, arguments);
        if (data && /\S/.test(data)) {
            var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
            script.type = "text/javascript";
			
            if (jQuery.support.scriptEval) {
                script.appendChild(document.createTextNode(data));
            } else {
                script.text = data;
            }
            head.insertBefore(script, head.firstChild);
            head.removeChild(script);
        } 
	};
	/* */
    
    function execRequire(url, script, callback){
        var item, i, exec = true;
        
        wtf.requireCache[url] = true;
        
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
        for (var script in wtf.requireCache) {
            if (wtf.requireCache[script] === false) {
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
    }

	
	
    
})(jQuery);