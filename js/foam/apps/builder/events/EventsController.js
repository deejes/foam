/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.events',
  name: 'EventsController',

  extendsModel: 'foam.apps.builder.AppController',

  requires: [
    'foam.apps.builder.events.Event',
    'foam.apps.builder.events.EventsDetailView',
    'foam.ui.DAOListView',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'dao',
      help: 'The store of events.',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.apps.builder.events.EventsDetailView'
      }
    },
  ],

  methods: [
    function exportDAOs() {
      this.SUPER();
      this.dao = this.Y.eventDAO;
    },
  ],

  templates: [
    function toHTML() {/*
      <app-body id="%%id" <%= this.cssClassAttr() %>>
        <% if ( this.dao ) { %>
          $$dao
        <% } %>
      </app-body>
    */},
    function CSS() {/*
      app-body {
        overflow-y: auto;
      }
    */},
  ]
});
