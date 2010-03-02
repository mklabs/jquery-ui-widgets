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

(http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture)[Nicholas C. Zakas — Scalable JavaScript Application Architecture]

Without going as far as Nicolas advise us to do so, the idea of core / application / core / module is omnipresent in this widget proposal.

    *Base Library: jQuery.
    *Application Core: jQuery UI Widget Factory, through the Controller widget.
    *Sandbox: Passed as a parameter in every controller entry point. Responsible for example of controller communication (read module in Nicolas' video).
    *Modules: Controllers in our terminology.


This widget proposal is more like a playground for me and experience in trying to implement those key concepts in a jQuery / jQuery UI environment.

Key features
----------------

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
    