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
  name: 'ChoiceRadioViewDemo',
  extendsModel: 'foam.ui.SimpleView',
  package: 'foam.demos',

  requires: [
    'foam.ui.md.ChoiceRadioView',
    'foam.input.touch.TouchManager',
    'foam.input.touch.GestureManager',
    'foam.ui.md.FlatButton',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.PopupChoiceView',
    'foam.ui.md.ToggleView',
    'foam.ui.md.EditableView',
    'foam.ui.md.PopupView'
  ],

  properties: [
    {
      name: 'choices',
      defaultValueFn: function() {
        var arr = [];
        for (var i=0;  i < 2; i++) {
          arr.push(['value'+i, 'Choice '+i]);
        }
        arr.push(['name', 'Other', 'user']);
        return arr; }
    },
    {
      name: 'data',
      defaultValue: 'none'
    },
    {
      model_: 'BooleanProperty',
      name: 'booly'
    },
    {
      model_: 'BooleanProperty',
      name: 'enabledButton',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'showButton',
      defaultValue: true
    }
  ],

  actions: [
    {
      name: 'oneAction',
      label: 'one',
      action: function() {
        console.log("one action actionated");
        this.closeActionView.open();
      },
      isEnabled: function(action) {
        return this.enabledButton;
      },
      isAvailable: function(action) {
        return this.showButton;
      }
    },
    {
      name: 'closeAction',
      label: 'Close',
      action: function() {
        console.log("one action actionated");
        this.closeActionView.close();
      },
      isEnabled: function(action) {
        return this.enabledButton;
      },
      isAvailable: function(action) {
        return this.showButton;
      }
    }


  ],

  methods: {
    init: function() {
      this.Y.registerModel(this.FlatButton, 'foam.ui.ActionButton');

      this.SUPER();
      this.X.touchManager   = this.TouchManager.create();
      this.X.gestureManager = this.GestureManager.create();

    }
  },

  templates:
  [
    function CSS() {/*
      body {
        font-family: Roboto, RobotoDraft;
        font-size: 14px;
        color: #444;
      }

      .demo-row {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
      }
    */},

    function toInnerHTML()
    {/*
        <h3>Normal style, with padding and margins</h3>
        <div class="demo-row">
          $$data{model_:'foam.ui.md.ChoiceRadioView', inlineStyle: false, choices:this.choices, orientation: 'horizontal'}
          <div class="md-style-trait-standard">Plaining Text</div>
          $$data{model_:'foam.ui.md.TextFieldView', inlineStyle: false }
          $$data{model_:'foam.ui.md.TextFieldView', inlineStyle: false, floatingLabel: false }
          $$data{model_: 'foam.ui.md.PopupChoiceView', inlineStyle: false,  choices:this.choices}
          $$data{model_:'foam.ui.md.EditableView', inlineStyle: false }
        </div>
        <hr/>
        <h3>Inline style, with no padding and margins</h3>
        <div class="demo-row">
          $$data{model_:'foam.ui.md.ChoiceRadioView', inlineStyle: true, choices:this.choices, orientation: 'horizontal'}
          $$data{model_:'foam.ui.md.TextFieldView', inlineStyle: true }
          <div>Plaining Text</div>
          $$data{model_:'foam.ui.md.TextFieldView', inlineStyle: true, floatingLabel: false }
          $$data{model_: 'foam.ui.md.PopupChoiceView', inlineStyle: true,  choices:this.choices}
          $$data{model_:'foam.ui.md.EditableView', inlineStyle: true }
        </div>
        <hr/>
        $$data{model_:'foam.ui.md.ChoiceRadioView', choices:this.choices, orientation: 'vertical'}
        $$data{model_:'foam.ui.md.TextFieldView'}
        $$data{model_: 'foam.ui.md.PopupChoiceView', choices:this.choices}
        $$oneAction
        $$enabledButton{model_:'foam.ui.md.CheckboxView', label: 'Button Enabled'}
        $$showButton{model_:'foam.ui.md.ToggleView', label: 'Button Show'}
        $$closeAction{model_: 'foam.ui.md.PopupView', delegate: { factory_:'foam.ui.md.FlatButton', action: this.CLOSE_ACTION } }
    */}
  ]

});