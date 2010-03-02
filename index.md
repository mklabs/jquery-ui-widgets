jQuery-UI-Controller
====================
A jQuery UI Widget that provides you clean and handy way to organize your jQuery code. 
Controllers organize event handlers through the power of event delegation. If something happens 
in your application, either it is browser event or custom ones, a controller should respond to it.

*Controllers let you know where your code is!
*Controllers force you to group events and label your html in specific ways.
*Controllers are inheritable.
*Controllers use event delegation.


Key concepts
---------------------
Mosf of the purpose of this widget is to try to implement key concept's from Nicholas C. Zakas' great presentation.

<a href="http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture">Nicholas C. Zakas — Scalable JavaScript Application Architecture</a>

Without going as far as Nicolas advise us to do so, the idea of core / application / core / module is omnipresent in this widget proposal.

    *Base Library: jQuery.
    *Application Core: jQuery UI Widget Factory, through the Controller widget.
    *Sandbox: Passed as a parameter in every controller entry point. Responsible for example of controller communication (read module in Nicolas' video).
    *Modules: Controllers in our terminology.


This widget proposal is more like a playground for me and experience in trying to implement those key concepts in a jQuery / jQuery UI environment.

<h2>Key features</h2>

    *Lazy loading
    
        *Ala <a href="http://github.com/digg/dui">DUI</a>: Definitly a very good and promising library. We use a different convention to trigger JS loading and different <a href="behind-this-widget/#ui-github-wiki-jquery-require">techniques</a> to dynamically load and execute JS files, but this widget is heavily inspired by their work.  
    
    *Inheritence
    
        *Thanks to <a href="behind-this-widget/#ui-github-wiki-inheritence">John Resig's proposal</a>. Aims to introduce/reinforce a pattern for developing large applications with jQuery. I didn't invent any of this, but I find that, when using jQuery, developers seem to forget the paradigms they learned for well structured code in other languages (at least, in my very near environment...). jQuery is effectively neutral and doesn't push you in any direction. Many times in other libraries a paradigm is provided, and then code generally ends up more uniform than it does with pure jQuery style. This is necessary for large JavaScript applications where scalability and maintainability are part of the objectives of a project.
    
    *Modularity
    
        *By providing you modular and re-usable architecture pattern.
    
    *Loose coupling
    
         *Remember Nicolas' rules:
        
           *Only call your own methods or those on the sandbox.
           *Don't access DOM elements outside of your box.
           *Ask, don't take.
           *Anything else you need, ask the sandbox.
           *Don't create global objects.
           *Don't talk to strangers.
           *Don't directly reference other modules.
        
        *Ends up in a robust application structure where each modules (controllers) don't know about each other as long as they follow's the above rules. Controller communication is provided by the Observer pattern via te use of fire / listen methods (which internally use jQuery custom event's system and bind / live / trigger methods).
    
    *Attach / Detach System
    
        *Each controller, when first matched in the DOM Tree, will trigger an asynchronous loading of the JS file that describes it. A controller is instantiated by using the jQuery plugin / UI widget paradigm and registered by the application core, eg. $(someSelector).controller(prototype); Each Controller, if no parent defined, will inherit from a BaseController Class that provides some handy method to subscribe / publish events among registered controllers. Once a controller is registered, it is immediatly started if a matching DOM elements is available in the DOM Tree. When the latter is removed, controller disposal is performed (basically call your provided destroy method while cleaning up controller's event). Whenever a controller previously registered re-apear in the DOM Tree, either is is by Ajax means or direct DOM Manipulation, any new HTTP Request is done and cached controller's instance is re-used to re-attach the controller.
    


<h2>Configuration</h2>
<em>In progress...</em>

<i>Setup basePath: </i> Where all loaded features should remain following the ui-controller-app-module-controller ==&gt; basePath + "app/module/controller.js" convention.

<i>Error handling: </i> Based on <a href="http://www.nczonline.net/blog/2009/04/28/javascript-error-handling-anti-pattern/">Nicolas' article</a>. Also demonstrated in the presentation linked above.


<i>Bind / Live:</i> By default, controllers will use event delegation to perform event's binding. Provided if you want to use "classic" event binding rather than using event delegation technique.


<h2>Lazy Loading</h2>
Ala <a href="http://github.com/digg/dui">DUI</a>: Definitly a very good and promising library. We use a different convention to trigger JS loading and different <a href="behind-this-widget/#ui-github-wiki-jquery-require">techniques</a> to dynamically load and execute JS files, but this widget is heavily inspired by their work.  

Whenever a DOM element has a cssClass that begins with 'ui-controller-', an HTTP request will try to load according scripts following the ui-controller-app-module-controller ==&gt; basePath + "app/module/controller.js" convention. This step is performed only once, subsequent request are prevented since needed features are already available to use.

<h2>HTML Markup</h2>
Simply put the following in any HTML page will trigger the loading of according script files:
<pre>
&lt;div class="ui-controller-example-crud-table"&gt;
	&lt;!-- Some HTML Markup --&gt;
&lt;/div&gt;
</pre>

Here , we use a &lt;div&gt; element, but we could use a &lt;form&gt; one or any container like tag. Try to avoid weird things like &lt;input type=""&gt;&lt;/input&gt;, &lt;hr /&gt; or  &lt;br /&gt;...

<h2>Writing a controller</h2>
<h3>Simple</h3>
<p>Example of a controller embbed in a jQuery UI Dialog. This is a simple use case where we load the content of the dialog each time it is opened, perfect to demonstrate the dialog lifecycle, particularly when the controller is removed from the DOM and inserted again.</p>

<h3>Inherited Controller</h3>
<p>This is the controller responsible of "main" page of our previous example, it will subscribe events and needed logic to buttons and below table.</p>

<p>Note that our TableController inherit for fun from another controller. Note the slight different syntax for the base one: using $.controller(entrypoint) instead of $(selector).controller(entrypoint); will create the Base Class and make it available for further use without instantiating it.</p>

<pre><code>
/**
 * Just for fun. Here is a base class that TableController will extend.
 *
 * It will create and register the Controller Class (without instantiating it)
 * 
 * @class LogMyRow
 * @namespace myNamespace.controller
 */
$.controller("myNamespace.controller.LogMyRow", {
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

/**
 * Use inheritence to get some more features.
 * 
 * First parameter is Base Controller we want to extend. 
 * Second is the entrypoint of our controller.
 * 
 * Using this syntax will create, register the Controller Class and 
 * instantiate the controller (assuming that the selector match an available 
 * element in the DOM Tree). 
 * 
 * @class TableController
 * @namespace myNamespace.controller
 */
// Use inheritence to get some more features
$(".ui-controller-example-crud-table").controller("myNamespace.controller.LogMyRow", function(){
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
        id: "myNamespace.TableController",
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
</code></pre>

<h2>Playing with model</h2>
Simply put some hidden input elements in your controller container:
<pre>
&lt;div class="ui-controller-example-crud-table"&gt;
    &lt;input type="hidden" name="dto.firstName" value="John" /&gt;
    &lt;input type="hidden" name="dto.lastName" value="DOE" /&gt;
    &lt;input type="hidden" name="foo" value="bar" /&gt;
&lt;/div&gt;
</pre>

Ends up in the following Model Object available in your controller instance:
<pre><code>
".cmd-add click": function(){
    console.log("Click add:", this, arguments);
    console.log("Model", this.Model);
    myDialog.empty().load(Constants.DIALOG_URL, this.Model.dto);
    myDialog.showDialog();
    alert(this.Model.foo);
}
</code></pre>

<h2>Inheritence</h2>
Simply fill in as first parameter the controller identifier which you want inherit from:
<pre><code>
$(selector).controller("myNamespace.controller.LogMyRow", entryPoint);
</code></pre>

<h2>Fire / Listen</h2>
Remember Nicolas' rules:
<blockquote>
 * - Only call your own methods or those on the sandbox 
 * - Don't access DOM elements outside of your box 
 * - Ask, don't take 
 * - Anything else you need, ask the sandbox 
 * - Don't talk to strangers 
 * - Don't directly reference other modules
</blockquote>

Use fire / listen methods available both in the sandbox or in every controller instance. Very similar to bind / trigger system of jQuery (also works with live ones ;) )

<pre><code>
// In some controller
init: function(){
    this.listen('refreshTable', this.handleRefresh);
},
handleRefresh: function(data){
    if(data){
        console.log("We've got some data:", data);
    }
},
...

// In some other one
notifyRefresh: function(){
    this.fire('refreshTable', {
        data: 'foo'
    });
}
</code></pre>

<h2>Controller lifecycle</h2>
A controller usually follows the below lifecycle:
<ol>
    *First, a DOM element with a cssClass that begins with ui-controller is matched in the DOM Tree. At this time, controller feature is not yet known by the application core. An HTTP request is made to dynamically retrieve the controller definition.
    *Controller Class is created thanks to the entrypoint provided (or plain object provided as prototype one). If the $(selector).controller() syntax is used and if the selector passed in matches an available element in the DOM Tree, controller is immediatly instantiated upon the according DOM node or it will listen via event delegation for "lazy binding".
    *Controller can be roughly removed from the DOM Tree using standard Ajax mean or plain jQuery DOM manipulation. The controller is properly destroyed (not really) by calling the destroy method provided in the prototype chain, while removing all bounded events.
    *At this time, our controller is now longer running in our page but still available for further use.
    *If some HTML markup appears again in the DOM Tree that match the initial selector provided with your controller implementation, cached controller is automatically "re-bound" to the DOM with the newly created markup. All events listener are rebound, the init method re-called and Model Object Graph (also called MOG aha!) is refreshed.
    *And then goes the 3 to 5 step again.
</ol>

<h3>Just to be sure...</h3>
Again, this widget is still under heavy development. Is is provided as is and without any guarantee. This widget proposal is more like a playground for me and experience in trying to implement <a href="http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture">Nicholas C. Zakas — Scalable JavaScript Application Architecture</a> key concepts in a jQuery / jQuery UI environment.

It has been tested under Firefox and Chrome. Cross-browser support is planned but needs further work.

There's still a severe lack of unit testing and will be adressed soon.

<h3>In case you missed it...</h3>
I didn't invent anything. If you haven't done it yet, be sure to read <a href="behind-this-widget/">Behind thid Widget</a> page. It aims at listing all source inspiration, patterns and techniques internally used.

In case you didn't heard about, there are two beautiful alternatives that serve same purpose:
<dl>
    <dt><a href="http://javascriptmvc.com/">JavascriptMVC</a></dt>
    <dd><blockquote>JavaScriptMVC is an open-source framework containing the best ideas in enterprise JavaScript development. It guides you to successfully completed projects by promoting best practices, maintainability, and convention over configuration.</blockquote></dd>
    <dt><a href="http://code.google.com/p/ajaxsoft/">jQuery actionController plugin</a></dt>
    <dd><blockquote>actionController is, in spite of his size (3 Kb), much more as just events delegator. It is not only improving your performance, it makes your code more structured and clear, without dependences hell between html css and javascript.</blockquote></dd>
</dl>

<em>Have fun playing with this widget... or not ;)</em>