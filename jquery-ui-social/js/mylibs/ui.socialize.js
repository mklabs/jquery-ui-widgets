(function($, doc) {


    $.widget("ui.socialize", {
        options: {
            count: 10, // not used for now
            
            accounts: {},
            
            resizable: true,
            draggable: true,
            
            data: {
              twitter: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed(10)%20where%20url%3D'http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fuser_timeline.atom%3Fscreen_name%3D${user}%26include_rts%3Dtrue'&format=json&callback=?",
              buzz: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed(10)%20where%20url%3D'http%3A%2F%2Fbuzz.googleapis.com%2Ffeeds%2F${user}%2Fpublic%2Fposted'&format=json&callback=?",
              github: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed(10)%20where%20url%3D'http%3A%2F%2Fgithub.com%2F${user}.atom'&format=json&callback=?"
            },
            templates: {
              main: '#ui-socialize-tmpl-main',
              list: '#ui-socialize-tmpl-list'
            }
        },
        
        _create: function() {
            console.log('_create', this, arguments);
            
            var self = this,
            
            o = this.options,
            
            el = this.element,
            
            feeds = this.feeds = {},
            
            baseClass = this.widgetBaseClass,
            
            loader = this.loader = $('<span />').text('Loading ...'),
            
            tmpl = this.tmpl = {
              main: $(o.templates.main).template(),
              list: $(o.templates.list).template()
            };
            
            o = this._metadata();
            
            $.tmpl(tmpl.main, {
              headers: o.accounts
            }).appendTo(el);
        
            this.pane = el.find('.ui-socialize-content');
            this.header = el.find('.ui-socialize-header');
            this.wrapper = el.find('.ui-socialize-wrapper');
            this.panes = this.pane.find('ul.ui-socialize-content-pane').css({
              display: 'none',
              opacity: 0
            });
            
            // Hide by default (except first pane)
            this.active = this.panes.eq(0).animate({left: 'show', opacity: 1}, 500);
            
            if(o.draggable) {
              el.draggable({
                handle: this.header
              });
            }
            
            if(o.resizable) {
              this.pane.resizable({
                alsoResize: this.wrapper
              });
              this.handleSe = this.pane.data('resizable').handles.se;
              
              this.pane.bind('scroll', function(){
	            	var y = self.pane.scrollTop();
	            	var bottom = parseInt(self.handleSe.css('bottom'), 10);
	            	self.handleSe.css('bottom', -(y - 1))
	            });
            }

            $.each(o.data, function(src, url){
              var a = o.accounts,
              d = o.data,
              url = d[src].replace(/\${\w+}/i, a[src]);

              $.getJSON(url, function(data){
                self.feeds[src] = data;
                self.render(src, data);
              });
            });

            el.addClass('ui-widget ' + baseClass);
            
            // Bind events
            this.buttons = el.find('.ui-socialize-button').hover(function(){
              $(this).toggleClass('ui-state-hover');
            });
            
            this.buttons.bind('click', $.proxy(self._clickHandler, self));
            
            this.buttons.eq(0).trigger('click');
        },
        
        _metadata: function() {
          var self = this, data = this.element.data();
          
          $.each(data, function(key, val){
            var m = key.match(/socialize-(\w+)/);
            if(m && m[1] && val) {
              self.options.accounts[m[1]] = val;
            }
          });
          
          return this.options;
        },
        
        _clickHandler: function(e) {
          var target = $(e.target),
          activeClass = 'ui-state-active',
          src = target.data('src');
          
          this.buttons.removeClass(activeClass);
          
          target.addClass(activeClass);
          
          if(this.feeds[src]) {
            this.switchPane(src);
          }
        },
        
        _formatContent: function(content) {
          var result = {};
          
          if(!$.isArray(content)) {
            result = {
              content: content.content
            };
          } else {
            $.each(content, function(i, val){
              var type = val.type;
              if(type === 'html') {
                result = {
                  content: val.content
                }
              }
            });
          }
          
          return result;
        },
        
        switchPane: function(src) {
          var toActive = this.panes.filter('.ui-socialize-content-' + src),
          active = this.active || this.panes.eq(0),
          index = this.panes.index(active),
          width = this.paneWidth,
          self = this;
          
          active.animate({opacity: 0}, 500, function() {
            self.panes.hide();
            toActive.animate( { left: "show", opacity: 1}, 1000, 'linear' );
          });
          
          this.active = toActive;
        },
        
        render: function(src, data) {
          var self = this,
          content = this.panes.filter('.ui-socialize-content-' + src),
          tmpl = this.tmpl.list,
          data = data || this.feeds[src],
          entries = [];
          
          if(!data || !content.get(0)) {
            return;
          }
          
          if(data.query && data.query.results) {
            entries = data.query.results.entry;
          }
          
          entries = (function(en){
            var results = [];
            
            $.each(en, function(i, val){
              var c = self._formatContent(val.content);
              results.push({
                title: (typeof val.title === 'string') ? val.title : val.title.content,
                content: c.content
              });
            });
            
            return results;
          })(entries);
          
          $.tmpl(tmpl, {
            items: entries,
            src: src
          }).appendTo(content.empty());
        }
    });
    
    function logIt(src){
      var args = Array.prototype.slice.call(arguments, 1);
      
      console.group(src);
      console.log(args);
      console.groupEnd();
    }
  
})(this.jQuery, document);