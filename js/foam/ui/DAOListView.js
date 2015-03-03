/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'DAOListView',
  package: 'foam.ui',
  
  requires: ['SimpleValue'],
  
  extendsModel: 'foam.ui.LeafDataView',
  traits: ['foam.ui.TemplateSupportTrait',
           'foam.ui.DAODataViewTrait',
           'foam.ui.HTMLViewTrait', 
           'foam.ui.ViewActionsTrait'], 
  
  properties: [
    {
      model_: 'BooleanProperty',
      name: 'isHidden',
      defaultValue: false,
      postSet: function(_, isHidden) {
        if ( this.dao && ! isHidden ) this.onDAOUpdate();
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'rowView',
      defaultValue: 'foam.ui.DetailView'
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
      view: { factory_: 'foam.ui.ChoiceView', choices: ['read-only', 'read-write', 'final'] }
    },
    {
      name: 'useSelection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      postSet: function(old, nu) {
        if ( this.useSelection && !this.X.selection$ ) this.X.selection$ = this.SimpleValue.create();
        this.selection$ = this.X.selection$;
      }
    },
    {
      name: 'selection',
      help: 'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
      factory: function() {
        return this.SimpleValue.create();
      }
    },
    {
      name: 'scrollContainer',
      help: 'Containing element that is responsible for scrolling.'
    },
    {
      name: 'chunkSize',
      defaultValue: 0,
      help: 'Number of entries to load in each infinite scroll chunk.'
    },
    {
      name: 'chunksLoaded',
      isHidden: true,
      defaultValue: 1,
      help: 'The number of chunks currently loaded.'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      this.subscribe(this.ON_HIDE, function() {
        self.isHidden = true;
      });

      this.subscribe(this.ON_SHOW, function() {
        self.isHidden = false;
      });

      // bind to selection, if present
      if (this.X.selection$) {
        this.selection$ = this.X.selection$;
      }
    },

    initHTML: function() {
      this.SUPER();

      // If we're doing infinite scrolling, we need to find the container.
      // Either an overflow: scroll element or the window.
      // We keep following the parentElement chain until we get null.
      if ( this.chunkSize > 0 ) {
        var e = this.$;
        while ( e ) {
          if ( window.getComputedStyle(e).overflow === 'scroll' ) break;
          e = e.parentElement;
        }
        this.scrollContainer = e || window;
        this.scrollContainer.addEventListener('scroll', this.onScroll, false);
      }

      if ( ! this.isHidden ) this.updateHTML();
    },

    construct: function() {
      if ( ! this.dao || ! this.$ ) return;
      if ( this.painting ) {
        this.repaintRequired = true;
        return;
      }
      this.painting = true;
      var out = [];
      this.children = [];
      this.initializers_ = [];

      var doneFirstItem = false;
      var d = this.dao;
      if ( this.chunkSize ) {
        d = d.limit(this.chunkSize * this.chunksLoaded);
      }
      d.select({put: function(o) {
        if ( this.mode === 'read-write' ) o = o.model_.create(o, this.Y); //.clone();
        var view = this.rowView({data: o, model: o.model_}, this.Y);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addListener(function() {
            // TODO(kgr): remove the deepClone when the DAO does this itself.
            this.dao.put(o.deepClone());
          }.bind(this, o));
        }
        this.addChild(view);
        
        if (!doneFirstItem) {
          doneFirstItem = true;
        } else {
          this.separatorToHTML(out); // optional separator
        }
        
        if ( this.X.selection$ ) {
          out.push('<div class="' + this.className + '-row' + '" id="' + this.on('click', (function() {
            this.selection = o;
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.X.selection$ ) {
          out.push('</div>');
        }
      }.bind(this)})(function() {
        if (this.repaintRequired) {
          this.repaintRequired = false;
          this.painting = false;
          this.realDAOUpdate();
          return;
        }

        var e = this.$;

        if ( ! e ) return;

        e.innerHTML = out.join('');
        this.initInnerHTML();
        this.children = [];
        this.painting = false;
      }.bind(this));
    },

    /** Allow rowView to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( children.length == 1 && children[0].nodeName === 'rowView' ) {
        this.SUPER(e);
      } else {
        this.rowView = e.innerHTML;
      }
    },
    
    // Template method
    separatorToHTML: function(out) {
      /* Template method. Override to provide a separator if required. This
      method is called <em>before</em> each list item, except the first. Use
      out.push("<myhtml>...") for efficiency. */
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.realDAOUpdate();
      }
    },
    {
      name: 'realDAOUpdate',
      isFramed: true,
      code: function() { 
        if ( ! this.isHidden ) this.updateHTML(); 
      }
    },
    {
      name: 'onScroll',
      code: function() {
        var e = this.scrollContainer;
        if ( this.chunkSize > 0 && e.scrollTop + e.offsetHeight >= e.scrollHeight ) {
          this.chunksLoaded++;
          this.updateHTML();
        }
      }
    }
  ]
});
