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
  name: 'ShareTarget',
  package: 'com.google.plus',

  documentation: function() {/* A Person, Circle, or ShareList that can be
     shared to (one of the targets of a share). */},

  properties: [
    {
      model_: 'StringProperty',
      name: 'displayName',
    }
  ],

  methods: [
    function toPeople() {
      /* Implement to return the flat list of Person ids this share target references. */
    },
    function toChipE() {
      /* Implement to return a contact chip view Element */
    },
  ],

});
