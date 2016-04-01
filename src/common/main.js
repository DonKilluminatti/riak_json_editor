// ==UserScript==
// @name ChristmasTree
// @include http://*/*
// @include https://*/*
// @include ftp://*/*
// @include file:///*
// @require jquery-1.8.2.min.js
// @require jsoneditor.min.js
// ==/UserScript==
var $ = window.$.noConflict(true); // Required for Opera and IE

JSONEditor.prototype.initAdditionalTools = function(){
	$('#editor').css({height: '95%'});
	$('body').append('<div id="messages"></div>');

	var editor = this;

	this.editTools = {
		editor: this,
		riak: {
			links: null,
			headers: {}
		},
		getData: function(ev, opType){
			var self = editor.editTools;
			var request = $.ajax({
				success: function(err, data, res){
					if(res.status == 200){
						self.riak.links = res.getResponseHeader('Link');

						var headers = request.getAllResponseHeaders();
						headers.toString().split('\n').forEach(function(h){
							var keyVal = h.split(':');
							if(keyVal[0].toLowerCase().indexOf('x-riak') === 0){
								self.riak.headers[keyVal[0].toLowerCase()] = res.getResponseHeader(keyVal[0]);
							}
						});

						editor.setText(res.responseText);
						editor.format();
						self.showMessage('Last ' + opType + ' ' + new Date());
					}
					else if(res.status == 304){
						self.showMessage('Not modified');
					}
				},
				error: function(err){
					self.showMessage('Obtain error: ' + err.responseText, true);
				},
				url: document.URL,
				type: 'GET'
			});
		},
		saveData: function(){
			var self = editor.editTools;
			var stringifyedData;
			try{
				stringifyedData = JSON.stringify(JSON.parse(editor.getText()));
			}
			catch(err){
				self.showMessage('Error while parse JSON', true);
				return;
			}

			var settings = {
				contentType: "application/json",
				success: function(){
					self.getData(null, 'save');
				},
				error: function(err){
					self.showMessage('Save error: ' + err.responseText, true);
				},
				url: document.URL,
				data: stringifyedData,
				type: 'PUT',
				headers: {
					'Link': self.riak.links
				}
			};

			if(Object.keys(self.riak.headers).length > 0){
				for(var h in self.riak.headers){
					settings.headers[h] = self.riak.headers[h];
				}
			}

			$.ajax(settings);
		},
		showMessage: function(text, isError){
			var messages = $("#messages");

			var cl = 'updated';
			if(isError){
				cl += '_err';
			}
			
			messages.html(text).addClass(cl);
			
			setTimeout(function(){
				messages.removeClass(cl);
			}, 2000);
		},
		addButtons: function(){
			var self = this;
			var save = $('<button/>').html('Save').on('click', self.saveData).addClass('center').css({
				width: '100px',
				background: '#18F776',
				color: '#000',
				fontWeight: 'bold'
			});
			var get = $('<button/>').html('Get data from RIAK').on('click', self.getData).addClass('center').css({
				width: '150px',
				background: '#fff',
				color: '#000',
			});

			var menu = $(editor.menu);
			menu.append(save);
			menu.append(get);
		},
		addKeyBindings: function(){
			var self = this;
			$(document).on('keydown', function(e){
				if(e.ctrlKey && e.keyCode == 83){
					self.saveData();
					return false;
				}
			});
		}
	};

	this.editTools.addButtons();
	this.editTools.addKeyBindings();
	this.editTools.getData(null, 'obtain');
};

function load(content, options){
	var child, data;

	if(document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" ||
			document.body.children.length === 0)){

		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText);

		var isNotFound = child.innerText.indexOf('not found') === 0;

		if(!data && !isNotFound){
			return;
		}

		// optimisations for display
		content = content.replace(/background[\-image]*:url\(img\/jsoneditor-icons\.svg\)[^;}]*[;]?/g, '');
		content += '#editor div.jsoneditor-menu{text-align: center;}';
		content += '#editor div.jsoneditor-menu>button.center{float: none;margin: 0 10px}';
		content += '#messages{transition: all 3s;text-align: center;}';
		content += '#messages.updated{background: #18F776;}';
		content += '#messages.updated_err{background: rgb(251, 96, 85);}';
		content += 'body{margin: 0;}';
		$("<style />").html(content).appendTo("head");
		$('body').html('<div class="editor" id="editor" style="height: 100%"></div>');

		var editor = new JSONEditor(
			document.getElementById("editor"),
			{mode: 'code', indentation: 4},
			isNotFound ? {notFount: true} : JSON.parse(data.text)
		);

		var menu = $(editor.menu);
		menu.find('.jsoneditor-format').html('format').css({width: '45px', color: '#000'});
		menu.find('.jsoneditor-compact').html('compact').css({width: '55px', color: '#000'});

		var isRiak = document.location.pathname.indexOf(options.riakPath) === 0;
		var editable = options.isRiakEnabled === true && isRiak === true;
		if(!editable){
			editor.aceEditor.setReadOnly(true);
		}

		if(isRiak){
			editor.initAdditionalTools();
		}
	}
}

function extractData(rawText) {
	var tokens, text = rawText.trim();

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}

	if (test(text)){
		return {
			text : rawText,
			offset : 0
		};
	}

	tokens = text.match(/^([^\s\(]*)\s*\(([\s\S]*)\)\s*;?$/);
	if(tokens && tokens[1] && tokens[2]) {
		if(test(tokens[2].trim()))
			return {
				fnName : tokens[1],
				text : tokens[2],
				offset : rawText.indexOf(tokens[2])
			};
	}
}

setTimeout(function(){
	kango.invokeAsync('kango.io.getExtensionFileContents', 'jsoneditor.min.css', function(content){
		kango.invokeAsync('kango.storage.getItem', 'options', function(options){
			if(!options){
				options = {
					isRiakEnabled: true,
					riakPath: '/riak/'
				};
			}

			load(content, options);
		});
	});
}, 100);
