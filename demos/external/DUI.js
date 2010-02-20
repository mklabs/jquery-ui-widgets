/**
 * DUI: The Digg User Interface Library
 *
 * Copyright (c) 2008-2009, Digg, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * - Neither the name of the Digg, Inc. nor the names of its contributors 
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @module DUI
 * @author Micah Snyder <micah@digg.com>
 * @description The Digg User Interface Library
 * @version 1.1.0b
 * @link http://github.com/digg/dui
 *
 */

(function() {

[].indexOf || (Array.prototype.indexOf = function(v, n){
    n = (n == null) ? 0 : n; var m = this.length;
    for(var i = n; i < m; i++) {
        if(this[i] == v) return i;
    }

    return -1;
});

[].filter || (Array.prototype.filter = function(fun /*, thisp*/) {
    var len = this.length >>> 0, res = [], thisp = arguments[1];

    for (var i = 0; i < len; i++) {
      if (i in this) {
        var val = this[i];
        if (fun.call(thisp, val, i, this)) res.push(val);
      }
    }

    return res;
});


DUI = function(deps, action, opts) {
    //Let's settle out which signature is being used, shall we?
    if(arguments.length == 1) {
        action = deps;
    } else if(arguments.length == 2 && deps.constructor == Function) {
        opts = action;
        action = deps;
    }
    action = action && action.constructor == Function ? action : function(){};
    opts = opts || {};

    var str = action.toString(), re = /(DUI\.\w+)/gim, matches = [], match;

    if(opts && opts.newQ && DUI.currentQ.length > 0) {
        DUI.currentQ = DUI.actions[DUI.actions.push([]) - 1];
    }

    if(deps && deps.constructor == Array) matches = deps;
    if(DUI.loadedScripts.concat(DUI.loading).indexOf(DUI.jQueryURL) == -1) DUI.load(DUI.jQueryURL);

    while(match = re.exec(str)) {
        var unique = true; match = match[1] || null;

        var internals = ['isClass','global','prototype','_dontEnum','_ident','_bootstrap','init','create','ns','each'];
        var omit = ['clean'];

        if(internals.indexOf(match.replace('DUI.', '')) > -1) {
            match = 'DUI.Class';
        }

        //replace this with Array.indexOf
        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }

        if(unique && omit.indexOf(match.replace('DUI.', '')) == -1) matches.push(match + '.js');
    }

    if(opts.defer) {
        DUI.deferred.push(action);
    } else {
        DUI.currentQ.push(action);
    }

    for(var i = 0; i < matches.length; i++) {
        DUI.load(matches[i], opts);
    }

    if(DUI.loading.length == 0) {
        DUI.loaded();
    }
}

DUI.loading = [];
DUI.actions = [];
DUI.currentQ = DUI.actions[DUI.actions.push([]) - 1];
DUI.deferred = [];
DUI.internals = [];
DUI.loadedScripts = [];
DUI.jQueryURL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.0/jquery.min.js';
DUI.scriptURL = 'http://' + window.location.hostname + '/';
DUI.maps = {};
DUI.debug = false;

DUI.load = function(module, opts) {
    //^http - url, leave intact
    //DUI. - scriptDir/DUI/(match)
    //else - scriptDir/(match.replace(':', '/'))

    //split on :, look for _foo, check if DUI.maps._foo, replace _foo with mapped value, join('/')
    var parts = module.split(/:(?!\/\/)/);
    for(var i = 0; i < parts.length; i++) {
        if(DUI.maps[parts[i]]) parts[i] = DUI.maps[parts[i]];

        //DUI.All is a special case that replaces every DUI feature wholesale
        if(parts[i].indexOf('DUI.') == 0 && DUI.maps['DUI.All']) parts[i] = DUI.maps['DUI.All'];
    }
    module = parts.join('/');

    if(DUI.loading.indexOf(module) > -1) return;

    if(DUI.loadedScripts.indexOf(module) > -1) {
        DUI.loaded(module, opts);
        return;
    }

    DUI.loading.push(module);

    var src = module.indexOf('http') == 0 ? module :
        (module.indexOf('DUI.') > -1 ? DUI.scriptURL + 'DUI/' + module :
        DUI.scriptURL + module);

    if(DUI.debug) {
        var delim = src.search(/(\?|&)/) > -1 ? '&' : '?';
        src += delim + (new Date()).getTime();
    }

    var d = document, jq = d.createElement('script'), a = 'setAttribute';
    jq[a]('type', 'text/javascript');
    jq[a]('src', src);
    jq.onload = function() { DUI.loaded(module, opts); };
    jq.onerror = function(e, u, s) {
        throw 'DUI could not load the following script: ' + u;
    };
    jq.onreadystatechange = function() {
        if('loadedcomplete'.indexOf(jq.readyState) > -1) {
            DUI.loaded(module, opts);
        }
    }
    d.body.appendChild(jq);
}

DUI.loaded = function(module) {
    DUI.loading = DUI.loading.filter(function(item) {
        return item != module;
    });

    if(module) DUI.loadedScripts.push(module);

    if(DUI.loading.length == 0) {
        while(DUI.actions.length > 0) {
            var q = DUI.actions.shift();
            while(q.length > 0) {
                var func = q.pop();
                func.apply(DUI);
            }
        }

        if(DUI.deferred.length) {
            while(DUI.deferred.length > 0) {
                DUI.deferred.pop().apply(DUI);
            }
        }

        DUI.actions = [[]];
        DUI.currentQ = DUI.actions[0];
    }
}

DUI.clean = function(module) {
    if(module.constructor == Array) {
        $.each(module, function() {
            DUI.clean(this);
        });
        return;
    }

    var safe = module.replace(/([:\.]{1})/g, '\\$1');
    $('._view\\:' + safe + ', ._click\\:' + safe + ', ._hover\\:' + safe + ', ._load\\:' + safe)
                .removeClass('_view:' + module + ' _click:' + module + ' _hover:' + module + ' _load:' + module);
}

var d = document, add = 'addEventListener', att = 'attachEvent', boot = function(e) {
    e = e || window.event;

    if(e.button == 2 || e.ctrlKey || e.metaKey) return;

    var y = e.type, t = e.target || e.srcElement;


    var walk = function(el, ev) {
        var c = el.className;
        var m = c ? c.match(/(?:^|\s)_(click|hover):(\S+)(?:$|\s)/) : undefined;
        
        if(m && m[1] && m[2]) {
            if((m[1] == 'hover' && ev == 'mouseover')
                || (m[1] == 'click' && ev == 'click')) {

                m = m[2];
            } else return;

            if(el.className.indexOf('booting') == -1) {
                el.className = c + ' booting';

                DUI([m], function() {
                    DUI.clean(m);

                    var evt = new $.Event(ev);
                    evt.fromDUI = true;
                    $(el).removeClass('booting').trigger(evt);
                }, {
                    newQ: true
                });
            }

            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
        
        if(el.parentNode) {
            walk(el.parentNode, ev);
        }
    };
    
    walk(t, y);
};

var onload = function() {
    var html = 'class="' + document.body.className + '" ' + document.body.innerHTML, re = /class=(?:'|")(?:[^'"]*?)_load:([^\s"']+)(?:[^'"]*?)(?:'|")/gim, matches = [], match;

    while(match = re.exec(html)) {
        var unique = true;
        match = match[1] || null;

        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }

        if(unique) matches.push(match);
    }

    DUI(matches, function() {
        DUI.clean(matches);
    }, {
        newQ: true
    });
}

var onscroll = function() {
    //todo: cross-browser math
    //todo: roll regexes throughout the file into one common object
    var height = window.innerHeight, scroll = window.scrollY, re = /class=(?:'|")(?:[^'"]*?)_view:([^\s"']+)(?:[^'"]*?)(?:'|")/gim, matches = [], el;

    if(document.querySelectorAll) {
        qsa = document.querySelectorAll('*[class*=_view]');

        for(var i = 0; i < qsa.length; i++) {
            el = qsa[i];

            if(height + scroll > el.offsetTop) {
                matches.push(/(?:^|\s)_view:([^\s]+)(?:\s|$)/.exec(el.className)[1]);
            }
        }


    } else {
        console.log('no');
    }

    if(matches.length > 0) {
        el.className = el.className + ' booting';

        DUI(matches, function() {
            $(el).removeClass('booting');

            DUI.clean(matches);
        }, {
            newQ: true
        });
    }
}

if(d[att]) {
    d[att]('onclick', boot);
    d[att]('onmouseover', boot);
    d[att]('onscroll', onscroll);
    window[att]('onload', onload);
} else {
    d[add]('click', boot, false);
    d[add]('mouseover', boot, false);
    d[add]('scroll', onscroll, false);
    window[add]('load', onload, false);
}

})();
