webpackJsonp([11],{122:function(e,t){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(r=window)}e.exports=r},96:function(e,t,r){(function(t){var r,r;/*!
    localForage -- Offline Storage, Improved
    Version 1.5.3
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
!function(t){e.exports=t()}(function(){return function e(t,n,o){function i(u,c){if(!n[u]){if(!t[u]){var f="function"==typeof r&&r;if(!c&&f)return r(u,!0);if(a)return a(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var l=n[u]={exports:{}};t[u][0].call(l.exports,function(e){var r=t[u][1][e];return i(r||e)},l,l.exports,e,t,n,o)}return n[u].exports}for(var a="function"==typeof r&&r,u=0;u<o.length;u++)i(o[u]);return i}({1:[function(e,r,n){(function(e){"use strict";function t(){s=!0;for(var e,t,r=l.length;r;){for(t=l,l=[],e=-1;++e<r;)t[e]();r=l.length}s=!1}function n(e){1!==l.push(e)||s||o()}var o,i=e.MutationObserver||e.WebKitMutationObserver;if(i){var a=0,u=new i(t),c=e.document.createTextNode("");u.observe(c,{characterData:!0}),o=function(){c.data=a=++a%2}}else if(e.setImmediate||void 0===e.MessageChannel)o="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var r=e.document.createElement("script");r.onreadystatechange=function(){t(),r.onreadystatechange=null,r.parentNode.removeChild(r),r=null},e.document.documentElement.appendChild(r)}:function(){setTimeout(t,0)};else{var f=new e.MessageChannel;f.port1.onmessage=t,o=function(){f.port2.postMessage(0)}}var s,l=[];r.exports=n}).call(this,void 0!==t?t:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(e,t,r){"use strict";function n(){}function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=g,this.queue=[],this.outcome=void 0,e!==n&&c(this,e)}function i(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function a(e,t,r){h(function(){var n;try{n=t(r)}catch(t){return y.reject(e,t)}n===e?y.reject(e,new TypeError("Cannot resolve promise with itself")):y.resolve(e,n)})}function u(e){var t=e&&e.then;if(e&&"object"==typeof e&&"function"==typeof t)return function(){t.apply(e,arguments)}}function c(e,t){function r(t){i||(i=!0,y.reject(e,t))}function n(t){i||(i=!0,y.resolve(e,t))}function o(){t(n,r)}var i=!1,a=f(o);"error"===a.status&&r(a.value)}function f(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}function s(e){return e instanceof this?e:y.resolve(new this(n),e)}function l(e){var t=new this(n);return y.reject(t,e)}function d(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,o=!1;if(!r)return this.resolve([]);for(var i=new Array(r),a=0,u=-1,c=new this(n);++u<r;)!function(e,n){function u(e){i[n]=e,++a!==r||o||(o=!0,y.resolve(c,i))}t.resolve(e).then(u,function(e){o||(o=!0,y.reject(c,e))})}(e[u],u);return c}function v(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,o=!1;if(!r)return this.resolve([]);for(var i=-1,a=new this(n);++i<r;)!function(e){t.resolve(e).then(function(e){o||(o=!0,y.resolve(a,e))},function(e){o||(o=!0,y.reject(a,e))})}(e[i]);return a}var h=e(1),y={},p=["REJECTED"],b=["FULFILLED"],g=["PENDING"];t.exports=r=o,o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===b||"function"!=typeof t&&this.state===p)return this;var r=new this.constructor(n);if(this.state!==g){a(r,this.state===b?e:t,this.outcome)}else this.queue.push(new i(r,e,t));return r},i.prototype.callFulfilled=function(e){y.resolve(this.promise,e)},i.prototype.otherCallFulfilled=function(e){a(this.promise,this.onFulfilled,e)},i.prototype.callRejected=function(e){y.reject(this.promise,e)},i.prototype.otherCallRejected=function(e){a(this.promise,this.onRejected,e)},y.resolve=function(e,t){var r=f(u,t);if("error"===r.status)return y.reject(e,r.value);var n=r.value;if(n)c(e,n);else{e.state=b,e.outcome=t;for(var o=-1,i=e.queue.length;++o<i;)e.queue[o].callFulfilled(t)}return e},y.reject=function(e,t){e.state=p,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},r.resolve=s,r.reject=l,r.all=d,r.race=v},{1:1}],3:[function(e,r,n){(function(t){"use strict";"function"!=typeof t.Promise&&(t.Promise=e(2))}).call(this,void 0!==t?t:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{2:2}],4:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){e=e||[],t=t||{};try{return new Blob(e,t)}catch(i){if("TypeError"!==i.name)throw i;for(var r="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,n=new r,o=0;o<e.length;o+=1)n.append(e[o]);return n.getBlob(t.type)}}function i(e,t){t&&e.then(function(e){t(null,e)},function(e){t(e)})}function a(e,t,r){"function"==typeof t&&e.then(t),"function"==typeof r&&e.catch(r)}function u(e){return"string"!=typeof e&&(console.warn(e+" used as a key, but it is not a string."),e=String(e)),e}function c(e){for(var t=e.length,r=new ArrayBuffer(t),n=new Uint8Array(r),o=0;o<t;o++)n[o]=e.charCodeAt(o);return r}function f(e){return new se(function(t){var r=e.transaction(le,he),n=o([""]);r.objectStore(le).put(n,"key"),r.onabort=function(e){e.preventDefault(),e.stopPropagation(),t(!1)},r.oncomplete=function(){var e=navigator.userAgent.match(/Chrome\/(\d+)/),r=navigator.userAgent.match(/Edge\//);t(r||!e||parseInt(e[1],10)>=43)}}).catch(function(){return!1})}function s(e){return"boolean"==typeof ce?se.resolve(ce):f(e).then(function(e){return ce=e})}function l(e){var t=fe[e.name],r={};r.promise=new se(function(e){r.resolve=e}),t.deferredOperations.push(r),t.dbReady?t.dbReady=t.dbReady.then(function(){return r.promise}):t.dbReady=r.promise}function d(e){var t=fe[e.name],r=t.deferredOperations.pop();r&&r.resolve()}function v(e,t){var r=fe[e.name],n=r.deferredOperations.pop();n&&n.reject(t)}function h(e,t){return new se(function(r,n){if(e.db){if(!t)return r(e.db);l(e),e.db.close()}var o=[e.name];t&&o.push(e.version);var i=ue.open.apply(ue,o);t&&(i.onupgradeneeded=function(t){var r=i.result;try{r.createObjectStore(e.storeName),t.oldVersion<=1&&r.createObjectStore(le)}catch(r){if("ConstraintError"!==r.name)throw r;console.warn('The database "'+e.name+'" has been upgraded from version '+t.oldVersion+" to version "+t.newVersion+', but the storage "'+e.storeName+'" already exists.')}}),i.onerror=function(e){e.preventDefault(),n(i.error)},i.onsuccess=function(){r(i.result),d(e)}})}function y(e){return h(e,!1)}function p(e){return h(e,!0)}function b(e,t){if(!e.db)return!0;var r=!e.db.objectStoreNames.contains(e.storeName),n=e.version<e.db.version,o=e.version>e.db.version;if(n&&(e.version!==t&&console.warn('The database "'+e.name+"\" can't be downgraded from version "+e.db.version+" to version "+e.version+"."),e.version=e.db.version),o||r){if(r){var i=e.db.version+1;i>e.version&&(e.version=i)}return!0}return!1}function g(e){return new se(function(t,r){var n=new FileReader;n.onerror=r,n.onloadend=function(r){var n=btoa(r.target.result||"");t({__local_forage_encoded_blob:!0,data:n,type:e.type})},n.readAsBinaryString(e)})}function m(e){return o([c(atob(e.data))],{type:e.type})}function _(e){return e&&e.__local_forage_encoded_blob}function w(e){var t=this,r=t._initReady().then(function(){var e=fe[t._dbInfo.name];if(e&&e.dbReady)return e.dbReady});return a(r,e,e),r}function I(e){l(e);for(var t=fe[e.name],r=t.forages,n=0;n<r.length;n++)r[n]._dbInfo.db&&(r[n]._dbInfo.db.close(),r[n]._dbInfo.db=null);return h(e,!1).then(function(e){for(var t=0;t<r.length;t++)r[t]._dbInfo.db=e}).catch(function(t){throw v(e,t),t})}function S(e,t,r){try{var n=e.db.transaction(e.storeName,t);r(null,n)}catch(n){if(!e.db||"InvalidStateError"===n.name)return I(e).then(function(){var n=e.db.transaction(e.storeName,t);r(null,n)});r(n)}}function E(e){function t(){return se.resolve()}var r=this,n={db:null};if(e)for(var o in e)n[o]=e[o];fe||(fe={});var i=fe[n.name];i||(i={forages:[],db:null,dbReady:null,deferredOperations:[]},fe[n.name]=i),i.forages.push(r),r._initReady||(r._initReady=r.ready,r.ready=w);for(var a=[],u=0;u<i.forages.length;u++){var c=i.forages[u];c!==r&&a.push(c._initReady().catch(t))}var f=i.forages.slice(0);return se.all(a).then(function(){return n.db=i.db,y(n)}).then(function(e){return n.db=e,b(n,r._defaultConfig.version)?p(n):e}).then(function(e){n.db=i.db=e,r._dbInfo=n;for(var t=0;t<f.length;t++){var o=f[t];o!==r&&(o._dbInfo.db=n.db,o._dbInfo.version=n.version)}})}function j(e,t){var r=this;e=u(e);var n=new se(function(t,n){r.ready().then(function(){S(r._dbInfo,ve,function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName),u=a.get(e);u.onsuccess=function(){var e=u.result;void 0===e&&(e=null),_(e)&&(e=m(e)),t(e)},u.onerror=function(){n(u.error)}}catch(e){n(e)}})}).catch(n)});return i(n,t),n}function A(e,t){var r=this,n=new se(function(t,n){r.ready().then(function(){S(r._dbInfo,ve,function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName),u=a.openCursor(),c=1;u.onsuccess=function(){var r=u.result;if(r){var n=r.value;_(n)&&(n=m(n));var o=e(n,r.key,c++);void 0!==o?t(o):r.continue()}else t()},u.onerror=function(){n(u.error)}}catch(e){n(e)}})}).catch(n)});return i(n,t),n}function x(e,t,r){var n=this;e=u(e);var o=new se(function(r,o){var i;n.ready().then(function(){return i=n._dbInfo,"[object Blob]"===de.call(t)?s(i.db).then(function(e){return e?t:g(t)}):t}).then(function(t){S(n._dbInfo,he,function(i,a){if(i)return o(i);try{var u=a.objectStore(n._dbInfo.storeName),c=u.put(t,e);null===t&&(t=void 0),a.oncomplete=function(){void 0===t&&(t=null),r(t)},a.onabort=a.onerror=function(){var e=c.error?c.error:c.transaction.error;o(e)}}catch(e){o(e)}})}).catch(o)});return i(o,r),o}function R(e,t){var r=this;e=u(e);var n=new se(function(t,n){r.ready().then(function(){S(r._dbInfo,he,function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName),u=a.delete(e);i.oncomplete=function(){t()},i.onerror=function(){n(u.error)},i.onabort=function(){var e=u.error?u.error:u.transaction.error;n(e)}}catch(e){n(e)}})}).catch(n)});return i(n,t),n}function O(e){var t=this,r=new se(function(e,r){t.ready().then(function(){S(t._dbInfo,he,function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName),a=i.clear();o.oncomplete=function(){e()},o.onabort=o.onerror=function(){var e=a.error?a.error:a.transaction.error;r(e)}}catch(e){r(e)}})}).catch(r)});return i(r,e),r}function D(e){var t=this,r=new se(function(e,r){t.ready().then(function(){S(t._dbInfo,ve,function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName),a=i.count();a.onsuccess=function(){e(a.result)},a.onerror=function(){r(a.error)}}catch(e){r(e)}})}).catch(r)});return i(r,e),r}function N(e,t){var r=this,n=new se(function(t,n){if(e<0)return void t(null);r.ready().then(function(){S(r._dbInfo,ve,function(o,i){if(o)return n(o);try{var a=i.objectStore(r._dbInfo.storeName),u=!1,c=a.openCursor();c.onsuccess=function(){var r=c.result;if(!r)return void t(null);0===e?t(r.key):u?t(r.key):(u=!0,r.advance(e))},c.onerror=function(){n(c.error)}}catch(e){n(e)}})}).catch(n)});return i(n,t),n}function B(e){var t=this,r=new se(function(e,r){t.ready().then(function(){S(t._dbInfo,ve,function(n,o){if(n)return r(n);try{var i=o.objectStore(t._dbInfo.storeName),a=i.openCursor(),u=[];a.onsuccess=function(){var t=a.result;if(!t)return void e(u);u.push(t.key),t.continue()},a.onerror=function(){r(a.error)}}catch(e){r(e)}})}).catch(r)});return i(r,e),r}function k(e){var t,r,n,o,i,a=.75*e.length,u=e.length,c=0;"="===e[e.length-1]&&(a--,"="===e[e.length-2]&&a--);var f=new ArrayBuffer(a),s=new Uint8Array(f);for(t=0;t<u;t+=4)r=pe.indexOf(e[t]),n=pe.indexOf(e[t+1]),o=pe.indexOf(e[t+2]),i=pe.indexOf(e[t+3]),s[c++]=r<<2|n>>4,s[c++]=(15&n)<<4|o>>2,s[c++]=(3&o)<<6|63&i;return f}function C(e){var t,r=new Uint8Array(e),n="";for(t=0;t<r.length;t+=3)n+=pe[r[t]>>2],n+=pe[(3&r[t])<<4|r[t+1]>>4],n+=pe[(15&r[t+1])<<2|r[t+2]>>6],n+=pe[63&r[t+2]];return r.length%3==2?n=n.substring(0,n.length-1)+"=":r.length%3==1&&(n=n.substring(0,n.length-2)+"=="),n}function T(e,t){var r="";if(e&&(r=ke.call(e)),e&&("[object ArrayBuffer]"===r||e.buffer&&"[object ArrayBuffer]"===ke.call(e.buffer))){var n,o=me;e instanceof ArrayBuffer?(n=e,o+=we):(n=e.buffer,"[object Int8Array]"===r?o+=Se:"[object Uint8Array]"===r?o+=Ee:"[object Uint8ClampedArray]"===r?o+=je:"[object Int16Array]"===r?o+=Ae:"[object Uint16Array]"===r?o+=Re:"[object Int32Array]"===r?o+=xe:"[object Uint32Array]"===r?o+=Oe:"[object Float32Array]"===r?o+=De:"[object Float64Array]"===r?o+=Ne:t(new Error("Failed to get type for BinaryArray"))),t(o+C(n))}else if("[object Blob]"===r){var i=new FileReader;i.onload=function(){var r=be+e.type+"~"+C(this.result);t(me+Ie+r)},i.readAsArrayBuffer(e)}else try{t(JSON.stringify(e))}catch(r){console.error("Couldn't convert value into a JSON string: ",e),t(null,r)}}function F(e){if(e.substring(0,_e)!==me)return JSON.parse(e);var t,r=e.substring(Be),n=e.substring(_e,Be);if(n===Ie&&ge.test(r)){var i=r.match(ge);t=i[1],r=r.substring(i[0].length)}var a=k(r);switch(n){case we:return a;case Ie:return o([a],{type:t});case Se:return new Int8Array(a);case Ee:return new Uint8Array(a);case je:return new Uint8ClampedArray(a);case Ae:return new Int16Array(a);case Re:return new Uint16Array(a);case xe:return new Int32Array(a);case Oe:return new Uint32Array(a);case De:return new Float32Array(a);case Ne:return new Float64Array(a);default:throw new Error("Unkown type: "+n)}}function L(e){var t=this,r={db:null};if(e)for(var n in e)r[n]="string"!=typeof e[n]?e[n].toString():e[n];var o=new se(function(e,n){try{r.db=openDatabase(r.name,String(r.version),r.description,r.size)}catch(e){return n(e)}r.db.transaction(function(o){o.executeSql("CREATE TABLE IF NOT EXISTS "+r.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],function(){t._dbInfo=r,e()},function(e,t){n(t)})})});return r.serializer=Ce,o}function z(e,t){var r=this;e=u(e);var n=new se(function(t,n){r.ready().then(function(){var o=r._dbInfo;o.db.transaction(function(r){r.executeSql("SELECT * FROM "+o.storeName+" WHERE key = ? LIMIT 1",[e],function(e,r){var n=r.rows.length?r.rows.item(0).value:null;n&&(n=o.serializer.deserialize(n)),t(n)},function(e,t){n(t)})})}).catch(n)});return i(n,t),n}function M(e,t){var r=this,n=new se(function(t,n){r.ready().then(function(){var o=r._dbInfo;o.db.transaction(function(r){r.executeSql("SELECT * FROM "+o.storeName,[],function(r,n){for(var i=n.rows,a=i.length,u=0;u<a;u++){var c=i.item(u),f=c.value;if(f&&(f=o.serializer.deserialize(f)),void 0!==(f=e(f,c.key,u+1)))return void t(f)}t()},function(e,t){n(t)})})}).catch(n)});return i(n,t),n}function P(e,t,r,n){var o=this;e=u(e);var a=new se(function(i,a){o.ready().then(function(){void 0===t&&(t=null);var u=t,c=o._dbInfo;c.serializer.serialize(t,function(t,f){f?a(f):c.db.transaction(function(r){r.executeSql("INSERT OR REPLACE INTO "+c.storeName+" (key, value) VALUES (?, ?)",[e,t],function(){i(u)},function(e,t){a(t)})},function(t){if(t.code===t.QUOTA_ERR){if(n>0)return void i(P.apply(o,[e,u,r,n-1]));a(t)}})})}).catch(a)});return i(a,r),a}function U(e,t,r){return P.apply(this,[e,t,r,1])}function q(e,t){var r=this;e=u(e);var n=new se(function(t,n){r.ready().then(function(){var o=r._dbInfo;o.db.transaction(function(r){r.executeSql("DELETE FROM "+o.storeName+" WHERE key = ?",[e],function(){t()},function(e,t){n(t)})})}).catch(n)});return i(n,t),n}function W(e){var t=this,r=new se(function(e,r){t.ready().then(function(){var n=t._dbInfo;n.db.transaction(function(t){t.executeSql("DELETE FROM "+n.storeName,[],function(){e()},function(e,t){r(t)})})}).catch(r)});return i(r,e),r}function Q(e){var t=this,r=new se(function(e,r){t.ready().then(function(){var n=t._dbInfo;n.db.transaction(function(t){t.executeSql("SELECT COUNT(key) as c FROM "+n.storeName,[],function(t,r){var n=r.rows.item(0).c;e(n)},function(e,t){r(t)})})}).catch(r)});return i(r,e),r}function J(e,t){var r=this,n=new se(function(t,n){r.ready().then(function(){var o=r._dbInfo;o.db.transaction(function(r){r.executeSql("SELECT key FROM "+o.storeName+" WHERE id = ? LIMIT 1",[e+1],function(e,r){var n=r.rows.length?r.rows.item(0).key:null;t(n)},function(e,t){n(t)})})}).catch(n)});return i(n,t),n}function G(e){var t=this,r=new se(function(e,r){t.ready().then(function(){var n=t._dbInfo;n.db.transaction(function(t){t.executeSql("SELECT key FROM "+n.storeName,[],function(t,r){for(var n=[],o=0;o<r.rows.length;o++)n.push(r.rows.item(o).key);e(n)},function(e,t){r(t)})})}).catch(r)});return i(r,e),r}function H(){try{return localStorage.setItem("_localforage_support_test",!0),localStorage.removeItem("_localforage_support_test"),!1}catch(e){return!0}}function K(){return!H()||localStorage.length>0}function V(e){var t=this,r={};if(e)for(var n in e)r[n]=e[n];return r.keyPrefix=r.name+"/",r.storeName!==t._defaultConfig.storeName&&(r.keyPrefix+=r.storeName+"/"),K()?(t._dbInfo=r,r.serializer=Ce,se.resolve()):se.reject()}function X(e){var t=this,r=t.ready().then(function(){for(var e=t._dbInfo.keyPrefix,r=localStorage.length-1;r>=0;r--){var n=localStorage.key(r);0===n.indexOf(e)&&localStorage.removeItem(n)}});return i(r,e),r}function Y(e,t){var r=this;e=u(e);var n=r.ready().then(function(){var t=r._dbInfo,n=localStorage.getItem(t.keyPrefix+e);return n&&(n=t.serializer.deserialize(n)),n});return i(n,t),n}function Z(e,t){var r=this,n=r.ready().then(function(){for(var t=r._dbInfo,n=t.keyPrefix,o=n.length,i=localStorage.length,a=1,u=0;u<i;u++){var c=localStorage.key(u);if(0===c.indexOf(n)){var f=localStorage.getItem(c);if(f&&(f=t.serializer.deserialize(f)),void 0!==(f=e(f,c.substring(o),a++)))return f}}});return i(n,t),n}function $(e,t){var r=this,n=r.ready().then(function(){var t,n=r._dbInfo;try{t=localStorage.key(e)}catch(e){t=null}return t&&(t=t.substring(n.keyPrefix.length)),t});return i(n,t),n}function ee(e){var t=this,r=t.ready().then(function(){for(var e=t._dbInfo,r=localStorage.length,n=[],o=0;o<r;o++){var i=localStorage.key(o);0===i.indexOf(e.keyPrefix)&&n.push(i.substring(e.keyPrefix.length))}return n});return i(r,e),r}function te(e){var t=this,r=t.keys().then(function(e){return e.length});return i(r,e),r}function re(e,t){var r=this;e=u(e);var n=r.ready().then(function(){var t=r._dbInfo;localStorage.removeItem(t.keyPrefix+e)});return i(n,t),n}function ne(e,t,r){var n=this;e=u(e);var o=n.ready().then(function(){void 0===t&&(t=null);var r=t;return new se(function(o,i){var a=n._dbInfo;a.serializer.serialize(t,function(t,n){if(n)i(n);else try{localStorage.setItem(a.keyPrefix+e,t),o(r)}catch(e){"QuotaExceededError"!==e.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==e.name||i(e),i(e)}})})});return i(o,r),o}function oe(e,t){e[t]=function(){var r=arguments;return e.ready().then(function(){return e[t].apply(e,r)})}}function ie(){for(var e=1;e<arguments.length;e++){var t=arguments[e];if(t)for(var r in t)t.hasOwnProperty(r)&&(Le(t[r])?arguments[0][r]=t[r].slice():arguments[0][r]=t[r])}return arguments[0]}var ae="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},ue=function(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(e){return}}();"undefined"==typeof Promise&&e(3);var ce,fe,se=Promise,le="local-forage-detect-blob-support",de=Object.prototype.toString,ve="readonly",he="readwrite",ye={_driver:"asyncStorage",_initStorage:E,_support:function(){try{if(!ue)return!1;var e="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),t="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return(!e||t)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(e){return!1}}(),iterate:A,getItem:j,setItem:x,removeItem:R,clear:O,length:D,key:N,keys:B},pe="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",be="~~local_forage_type~",ge=/^~~local_forage_type~([^~]+)~/,me="__lfsc__:",_e=me.length,we="arbf",Ie="blob",Se="si08",Ee="ui08",je="uic8",Ae="si16",xe="si32",Re="ur16",Oe="ui32",De="fl32",Ne="fl64",Be=_e+we.length,ke=Object.prototype.toString,Ce={serialize:T,deserialize:F,stringToBuffer:k,bufferToString:C},Te={_driver:"webSQLStorage",_initStorage:L,_support:function(){return"function"==typeof openDatabase}(),iterate:M,getItem:z,setItem:U,removeItem:q,clear:W,length:Q,key:J,keys:G},Fe={_driver:"localStorageWrapper",_initStorage:V,_support:function(){try{return"undefined"!=typeof localStorage&&"setItem"in localStorage&&"function"==typeof localStorage.setItem}catch(e){return!1}}(),iterate:Z,getItem:Y,setItem:ne,removeItem:re,clear:X,length:te,key:$,keys:ee},Le=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},ze={},Me={},Pe={INDEXEDDB:ye,WEBSQL:Te,LOCALSTORAGE:Fe},Ue=[Pe.INDEXEDDB._driver,Pe.WEBSQL._driver,Pe.LOCALSTORAGE._driver],qe=["clear","getItem","iterate","key","keys","length","removeItem","setItem"],We={description:"",driver:Ue.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},Qe=function(){function e(t){n(this,e);for(var r in Pe)if(Pe.hasOwnProperty(r)){var o=Pe[r],i=o._driver;this[r]=i,ze[i]||this.defineDriver(o)}this._defaultConfig=ie({},We),this._config=ie({},this._defaultConfig,t),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch(function(){})}return e.prototype.config=function(e){if("object"===(void 0===e?"undefined":ae(e))){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var t in e){if("storeName"===t&&(e[t]=e[t].replace(/\W/g,"_")),"version"===t&&"number"!=typeof e[t])return new Error("Database version must be a number.");this._config[t]=e[t]}return!("driver"in e&&e.driver)||this.setDriver(this._config.driver)}return"string"==typeof e?this._config[e]:this._config},e.prototype.defineDriver=function(e,t,r){var n=new se(function(t,r){try{var n=e._driver,o=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!e._driver)return void r(o);for(var i=qe.concat("_initStorage"),a=0,u=i.length;a<u;a++){var c=i[a];if(!c||!e[c]||"function"!=typeof e[c])return void r(o)}var f=function(r){ze[n]&&console.info("Redefining LocalForage driver: "+n),ze[n]=e,Me[n]=r,t()};"_support"in e?e._support&&"function"==typeof e._support?e._support().then(f,r):f(!!e._support):f(!0)}catch(e){r(e)}});return a(n,t,r),n},e.prototype.driver=function(){return this._driver||null},e.prototype.getDriver=function(e,t,r){var n=ze[e]?se.resolve(ze[e]):se.reject(new Error("Driver not found."));return a(n,t,r),n},e.prototype.getSerializer=function(e){var t=se.resolve(Ce);return a(t,e),t},e.prototype.ready=function(e){var t=this,r=t._driverSet.then(function(){return null===t._ready&&(t._ready=t._initDriver()),t._ready});return a(r,e,e),r},e.prototype.setDriver=function(e,t,r){function n(){u._config.driver=u.driver()}function o(e){return u._extend(e),n(),u._ready=u._initStorage(u._config),u._ready}function i(e){return function(){function t(){for(;r<e.length;){var i=e[r];return r++,u._dbInfo=null,u._ready=null,u.getDriver(i).then(o).catch(t)}n();var a=new Error("No available storage method found.");return u._driverSet=se.reject(a),u._driverSet}var r=0;return t()}}var u=this;Le(e)||(e=[e]);var c=this._getSupportedDrivers(e),f=null!==this._driverSet?this._driverSet.catch(function(){return se.resolve()}):se.resolve();return this._driverSet=f.then(function(){var e=c[0];return u._dbInfo=null,u._ready=null,u.getDriver(e).then(function(e){u._driver=e._driver,n(),u._wrapLibraryMethodsWithReady(),u._initDriver=i(c)})}).catch(function(){n();var e=new Error("No available storage method found.");return u._driverSet=se.reject(e),u._driverSet}),a(this._driverSet,t,r),this._driverSet},e.prototype.supports=function(e){return!!Me[e]},e.prototype._extend=function(e){ie(this,e)},e.prototype._getSupportedDrivers=function(e){for(var t=[],r=0,n=e.length;r<n;r++){var o=e[r];this.supports(o)&&t.push(o)}return t},e.prototype._wrapLibraryMethodsWithReady=function(){for(var e=0,t=qe.length;e<t;e++)oe(this,qe[e])},e.prototype.createInstance=function(t){return new e(t)},e}(),Je=new Qe;t.exports=Je},{3:3}]},{},[4])(4)})}).call(t,r(122))}});