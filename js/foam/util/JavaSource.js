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
  package: 'foam.util',
  name: 'JavaSource',

  requires: [
    'foam.core.types.StringEnumProperty',
    'foam.util.InlineTrait'
  ],

  documentation: function() {/* Generates Java source code from a FOAM
    model. Add a template for each model, named by CONSTANTIZED_MODEL_ID.
  */},

  methods: [
    function prepModel_(model) {
      // Java doesn't support traits, so we'll copy traits into the model directly.
      model = this.InlineTrait.create().inlineTraits(model);
      return model;
    },

    function generate(model) {
      model = this.prepModel_(model);

      var filter = function(m) {
        if ( m.labels && m.labels.indexOf('java') == -1 ) {
          return false;
        }
        return true;
      };

      model.properties = model.properties.filter(filter);
      model.methods = model.methods.filter(filter);
      model.listeners = model.listeners.filter(filter);

      return this.javaSource.call(model, null, this);
    },
  ],

  templates: [
    function javaSource(out, javaSource) {/*// Generated by FOAM, do not modify.
// Version <%= this.version %><%
  var className       = this.javaClassName;
  var parentClassName = 'AbstractFObject';
  var parentModel = '';
  if (this.extendsModel) {
    parentClassName = this.extendsModel;
    parentModel = this.extendsModel + '.MODEL(), ';
  }
  if ( GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract )
    parentClassName = 'Abstract' + parentClassName;
%><% if ( this.package ) { %>
package <%= this.package %>;
<% } %>
import foam.core.*;
import foam.dao.*;
import java.util.Arrays;
import java.util.List;

public<%= this.abstract ? ' abstract' : '' %> class <%= className %>
    extends <%= parentClassName %> {
<% for ( var key in this.properties ) {
  var prop = this.properties[key];
  if ( prop.labels && prop.labels.indexOf('compiletime') != -1  )
    continue;
  javaSource.propertySource.call(this, out, prop);
}
if (this.relationships && this.relationships.length) {
  for ( var i = 0; i < this.relationships.length; i++) {
    var rel = this.relationships[i];
    javaSource.relationshipSource.call(this, out, rel);
  }
}

var allProps = this.getRuntimeProperties();
allProps = allProps.filter(function(m) {
  if ( m.labels &&
        ( m.labels.indexOf('java') == -1 ||
          m.labels.indexOf("compiletime") != -1 ) ) {
    return false;
  }
  return true;
});

 %>
final static Model model__ = new AbstractModel(<%= parentModel %>new Property[] {<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %> <%= constantize(prop.name) %>,<% } %>} , new Relationship[] {<% if (this.relationships && this.relationships.length) { for (var i = 0; i < this.relationships.length; i++) { %> <%= constantize(this.relationships[i].name) %>, <% } } %> }) {
    public String getName() { return "<%= this.id %>"; }
    public String getShortName() { return "<%= this.name %>"; }
    public String getLabel() { return "<%= this.label %>"; }
    public Property getID() { return <%= this.ids.length ? constantize(this.ids[0]) : 'null' %>; }
    public FObject newInstance() { return new <%= className %>(); }
  };

  public Model model() {
    return model__;
  }
  public static Model MODEL() {
    return model__;
  }

  public int hashCode() {
    int hash = 1;
<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>
    hash = hash * 31 + hash(<%= prop.name %>_);<% } %>

    return hash;
  }

  public int compareTo(Object obj) {
    if ( obj == this ) return 0;
    if ( obj == null ) return 1;

    <%= this.name %> other = (<%= this.name %>) obj;

    int cmp;
<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>
    if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;<% } %>

    return 0;
  }

  public StringBuilder append(StringBuilder b) {
    return b<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>
        .append("<%= prop.name %>=").append(get<%= prop.name.capitalize() %>())<%= i < allProps.length - 1 ? '.append(", ")' : '' %><% } %>;
  }

  public <%= className %> fclone() {
    <%= this.name %> c = new <%= this.name %>();
<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>
    c.set<%= prop.name.capitalize() %>(get<%= prop.name.capitalize() %>());<% } %>
    return c;
  }
<%
  function feature(f) {
    f.javaSource$f && f.javaSource$f(out, self);
  }

  this.methods.forEach(feature);
  this.listeners.forEach(feature);
%>
}
*/},
  function propertySource(out, prop) {/*<%
    var rawType, wrapperType, genericPropertyType, baseClass;
    rawType = prop.javaType;

    var toWrapperClass = function(name) {
      return name === 'int'  ? 'Integer' :
          name === 'double'  ? 'Double'  :
          name === 'float'   ? 'Float'   :
          name === 'boolean' ? 'Boolean' : name;
    };

    var extraText = '  ';
    if (prop.hidden) extraText += '  public boolean isHidden() { return true; }\u000a  ';
    if (prop.transient) extraText += '  public boolean isTransient() { return true; }\u000a  ';
    if (prop.help) {
      var parts = prop.help.split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
      extraText += '  public String getHelp() {\u000a  ';
      extraText += '    return "' + parts.join('\\n" +\n          "') + '";\u000a  ';
      extraText += '  }\u000a  ';
    }

    var asDAO = false;

    if (StringArrayProperty.isInstance(prop)) {
      rawType = wrapperType = 'List<String>';
      genericPropertyType = 'ArrayProperty<String>';
      baseClass = 'AbstractStringArrayProperty';
    } else if (ArrayProperty.isInstance(prop) || ReferenceArrayProperty.isInstance(prop)) {
      var elementType = toWrapperClass(prop.subType);
      rawType = wrapperType = 'List<' + elementType + '>';
      var ref = ReferenceArrayProperty.isInstance(prop) ? 'Reference' : '';
      genericPropertyType = ref + 'ArrayProperty<' + elementType + '>';
      baseClass = 'Abstract' + ref + 'ArrayProperty<' + elementType + '>';
      var propType = this.X.lookup(prop.subType) ? 'OBJECT' : constantize(elementType);
      extraText += '  public int getType() { return Property.TYPE_ARRAY | Property.TYPE_' + propType + '; }\u000a  ';
      asDAO = !!(prop.subType && this.X.lookup(prop.subType));
      if (asDAO) {
        extraText += '  public DAO getAsDAO(Object o) { return ((' + this.name + ') o).get' + prop.name.capitalize() + 'AsDAO(); }\u000a  ';
      }
    } else if (ReferenceProperty.isInstance(prop)) {
      wrapperType = toWrapperClass(rawType);
      genericPropertyType = 'ReferenceProperty<' + wrapperType + '>';
      baseClass = 'Abstract' + genericPropertyType;
      extraText += '  public int getType() { return Property.TYPE_' + constantize(wrapperType) + '; }\u000a  ';
    } else if (foam.core.types.StringEnumProperty.isInstance(prop)) {
      wrapperType = 'String';
      genericPropertyType = 'EnumProperty<String>';
      baseClass = 'Abstract' + genericPropertyType;
      var choices = [];
      for (var i = 0; i < prop.choices.length; i++) {
        var c = prop.choices[i];
        if (typeof c === 'string') c = [c, c];
        choices.push('new LabeledItem<String>("' + c[1] + '", "' + c[0] + '")');
      }
      extraText += '  public void initChoices_() { choices_ = Arrays.asList(' + choices.join(', ') + '); }\u000a  ';
      extraText += '  public int getType() { return Property.TYPE_STRING; }\u000a  ';
    } else {
      wrapperType = toWrapperClass(rawType);
      genericPropertyType = 'Property<' + wrapperType + '>';
      baseClass = 'Abstract' + prop.javaType.capitalize() + 'Property';
    }

    if (ReferenceProperty.isInstance(prop)) {
      extraText += '  public Model getSubType() { return ' + prop.subType + '.MODEL(); }\u000a  ';
      extraText += '  public Property getSubKey() { return getSubType().getProperty("' + prop.subKey + '"); }\u000a  ';
    }
%>
  public final static <%= genericPropertyType %> <%= constantize(prop.name) %> = new <%= baseClass %>() {
    public String getName() { return "<%= prop.name %>"; }
    public String getLabel() { return "<%= prop.label %>"; }
    public <%= wrapperType %> get(Object o) { return ((<%= this.name %>) o).get<%= prop.name.capitalize() %>(); }
    public void set(Object o, <%= wrapperType %> v) { ((<%= this.name %>) o).set<%= prop.name.capitalize() %>(v); }
    public int compare(Object o1, Object o2) { return compareValues(((<%= this.name%>)o1).<%= prop.name %>_, ((<%= this.name%>)o2).<%= prop.name %>_); }
<%= extraText %>};

  protected <%= rawType %> <%= prop.name %>_;

  public <%= rawType %> get<%= prop.name.capitalize() %>() {
    return <%= prop.name %>_;
  }
<% if (asDAO) { %>
  DAO <%= prop.name %>DAO_;
  public DAO get<%= prop.name.capitalize() %>AsDAO() {
    if (<%= prop.name %>DAO_ == null) <%= prop.name %>DAO_ = new ArrayDAO(<%= prop.subType %>.MODEL(), <%= prop.name %>_);
    return <%= prop.name %>DAO_;
  }
<% } %>
  public void set<%= prop.name.capitalize() %>(<%= rawType, ' ', prop.name %>) {
    if (isFrozen()) throw new FrozenObjectModificationException();
    <%= rawType %> oldValue = <%= prop.name %>_;
    <%= prop.name %>_ = <%= prop.name %>;
    if (<%= constantize(prop.name) %>.compareValues(oldValue, <%= prop.name %>) != 0) {
      firePropertyChange(<%= constantize(prop.name) %>, oldValue, <%= prop.name %>);
    }
  }
*/},

  function relationshipSource(out, rel) {/*<%
    var shortName = rel.relatedModel.split('.').pop();
    shortName = shortName.substring(0, 1).toLowerCase() + shortName.substring(1);
%>
  public final static Relationship <%= constantize(rel.name) %> = new AbstractRelationship() {
    public String getName() { return "<%= rel.name %>"; }
    public String getLabel() { return "<%= rel.label %>"; }
    public DAO get(Object o) { return ((<%= this.name %>) o).get<%= rel.name.capitalize() %>(); }
  };

  private DAO <%= rel.name %>_;

  public DAO get<%= rel.name.capitalize() %>() {
    if (<%= rel.name %>_ == null) {
      Model model = <%= rel.relatedModel %>.MODEL();
      DAO dao = new RelationshipDAO(model, "<%= shortName %>DAO");
      <%= rel.name %>_ = dao.where(MLang.EQ(model.getProperty("<%= rel.relatedProperty %>"), model().getID().get(this)));
    }
    return <%= rel.name %>_;
  }
  */},
  ]
});
