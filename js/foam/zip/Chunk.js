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
  package: 'foam.zip',
  name: 'Chunk',

  constants: {
    // Order matters here! In particular, some typed array-related
    // structures have a "length" that is NOT the length of the data
    // contained inside the structure.
    LENGTH_PROPS: ['byteLength', 'size', 'length'],
  },

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'data',
      lazyFactory: function() { return []; },
      adapt: function(old, nu) {
        if ( old === nu ) return nu;
        if ( ! nu ) return [];
        if ( ! Array.isArray(nu) ) return [nu];
        return nu;
      },
    },
  ],

  methods: [
    function append() {
      var args = argsToArray(arguments);
      for ( var i = 0; i < args.length; ++i ) {
        if ( this.model_.isInstance(args[i]) ) {
          this.data = this.data.concat(args[i].data);
        } else if ( Array.isArray(args[i]) ) {
          this.data = this.data.concat(args[i]);
        } else {
          this.data.push(args[i]);
        }
      }
      return this;
    },
    function size() {
      var propNames = this.LENGTH_PROPS;
      var data = this.data;
      var len = 0;

      for ( var i = 0; i < data.length; ++i ) {
        var d = data[i];
        var l = undefined;

        // Search for a length-denoting property.
        for ( var j = 0; j < propNames.length; ++j ) {
          l = d[propNames[j]];
          if ( typeof l === 'number' ) break;
        }

        // Only if we found a length-denoting property, add the length.
        if ( typeof l === 'number' ) len += l;
      }

      return len;
    },
  ],
});
