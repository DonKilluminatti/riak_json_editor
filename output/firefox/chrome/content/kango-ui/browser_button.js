﻿/*
Built using Kango - Cross-browser extension framework
http://kangoextensions.com/
*/
RiaknJSONneditor_kango.ui.BrowserButton=function(a){null==this._getContainerElem()&&this._insertButton();RiaknJSONneditor_kango.ui.Button.call(this,a)};
RiaknJSONneditor_kango.ui.BrowserButton.prototype=RiaknJSONneditor_kango.oop.extend(RiaknJSONneditor_kango.ui.Button,{_buttonId:"RiaknJSONneditor_kango-ui-browserButton",_containerId:"RiaknJSONneditor_kango-ui-browserButton-container",_getContainerElem:function(){return document.getElementById(this._containerId)},_insertButton:function(){if(null==RiaknJSONneditor_kango.systemStorage.getItem("ui.button_inserted")){RiaknJSONneditor_kango.systemStorage.setItem("ui.button_inserted",!0);var a=document.getElementById("nav-bar"),b=a.currentSet.split(",");if(-1==b.indexOf(this._containerId)){var c=b.indexOf("search-container")+
1||b.length;a.currentSet=b.slice(0,c).concat(this._containerId).concat(b.slice(c)).join(",");document.persist(a.id,"currentset");try{BrowserToolboxCustomizeDone(!0)}catch(d){}}}}});
