YAHOO.env.classMap = {"$.ui.controller": "controller", "SandBox": "controller", "BaseController": "controller", "demo.layout.InitLayout": "layout", "Class": "controller"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
