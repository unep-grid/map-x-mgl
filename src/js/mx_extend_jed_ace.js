
/*
 * mx_extend_jed_medium.js
 * Copyright (C) 2017 fxi <fxi@mbp-fxi.home>
 *
 * Distributed under terms of the MIT license.
 */
(function(){
  'use strict';

  JSONEditor.defaults.resolvers.unshift(function(schema) {
    if(schema.type === "string" && schema.format === "textarea" && schema.options) {
      if( schema.options.editor === "ace"){
        return "ace";
      }
    }
  });

  JSONEditor.defaults.editors.ace = JSONEditor.defaults.editors.string.extend({
/*     sanitize: function(value) {*/
      //value = value.replace(/\n/g, '\\n');
        //console.log(value);
       //return value;
     /*},*/
    refreshValue: function() {
      this.value = this.value;
      this.serialized = this.value;
    },
    setValue: function(value,initial,from_template) {

      var self = this;

      if(this.template && !from_template) {
        return;
      }


      if(value === null || typeof value === 'undefined') value = "";
      else if(typeof value === "object") value = JSON.stringify(value);
      else if(typeof value !== "string") value = ""+value;

      if(value === this.serialized) return;

      // Sanitize value before setting it
      var sanitized = this.sanitize(value);

      //if(this.input.value === sanitized) {
      if(this.input.value === sanitized) {
        return;
      }

      //this.input.value = sanitized;
      this.value = sanitized;
      //this.input.value = this.value;

      if(this.ace_editor) {
        this.ace_editor.setValue(sanitized);
      }

      var changed = from_template || this.getValue() !== value;

      this.refreshValue();

      if(initial) this.is_dirty = false;
      else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

      if(this.adjust_height) this.adjust_height(this.input);

      // Bubble this setValue to parents if the value changed
      this.onChange(changed);

    },
    afterInputReady: function() {
      var that = this;
      var mode = this.options.language;
      var htmlHelp =  this.options.htmlHelp;

      System.import("brace")
        .then(function(ace){
          window.ace = ace;
          return  Promise.all([
            System.import('brace/mode/javascript'),
            System.import('brace/theme/github'),
            System.import('js-beautify')
          ]);
        })
        .then(function(m){


          that.ace_container = document.createElement('div');
          that.ace_container.style.width = '100%';
          that.ace_container.style.position = 'relative';
          //that.ace_container.style.height = '400px';
          that.input.parentNode.insertBefore(that.ace_container,that.input);
          that.input.style.display = 'none';
          that.ace_editor = window.ace.edit(that.ace_container);
          that.ace_editor.setValue(that.getValue());
          that.ace_editor.getSession().setMode('ace/mode/'+mode);
          that.ace_editor.getSession().selection.clearSelection();
          that.ace_editor.setTheme('ace/theme/github');
          that.ace_editor.setOptions({
             minLines : 5, 
             maxLines : Infinity
          });

          // Listen for changes
          that.ace_editor.on('change',function() {
            var val = that.ace_editor.getValue();
            //that.input.value = val;
            that.value = val;
            that.refreshValue();
            that.is_dirty = true;
            that.onChange(true);
          });

          that.theme.afterInputReady(that.input);

          /**
          * Add toolbar
          */

          var elToolContainer  = document.createElement("div");

          /**
          * Add beautify button
          */
          if( mode == "javascript" || mode == "json" ){


            var elBeautifyBtn = document.createElement("button");
            elBeautifyBtn.className = "btn btn-info";
            elBeautifyBtn.innerHTML= "tidy";
            elBeautifyBtn.addEventListener("click",function(){ 

              var b = m[2];
              var s =  that.ace_editor.getSession();

              new Promise(function(resolve,reject){
                resolve(s.getValue());
              }).then(function(val){
                return(b(val));
              }).then(function(tidy){
                s.setValue(tidy);
              }).catch(function(e){
                mx.helpers.modal({
                  id :  "modalError",
                  title : "Error",
                  content : "<p>Error during tidy process :" + e 
                });
              });

            });

            elToolContainer.appendChild(elBeautifyBtn);
          }


          /**
          * Add optional help panel
          */
          if( htmlHelp ){
            var elHelp = mx.helpers.textToDom( htmlHelp );
            var elBtn = document.createElement("button");

            elBtn.className = "btn btn-info";
            elBtn.innerHTML= "help";
            elBtn.addEventListener("click",function(){
              mx.helpers.modal({
                id : "modalHelp",
                title : "Map-x help",
                content : elHelp
              });
            });

            elToolContainer.appendChild(elBtn);
          }

          /**
          * Insert toolbar before input
          */
            that.input.parentNode.insertBefore(elToolContainer,that.ace_container);
        });

    },
    destroy: function() {
      if(this.ace_editor) {
        this.ace_editor.destroy();
      }
    }

  });


})();