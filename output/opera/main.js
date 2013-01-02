﻿// ==UserScript==
// @name ChristmasTree
// @include */riak/*
// @include */riak/*
// @require jquery-1.8.2.min.js
// ==/UserScript==

var $ = window.$.noConflict(true); // Required for Opera and IE

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

var refreshJSON = function(data, status){
	var settings = {
		success: updateEditor,
		url: document.URL,
		type: 'GET'
	};

    $.ajax(settings);
};

function updateEditor(err, data, res){
	if(res.status == 200){
		var parsed = JSON.parse(res.responseText);
		$("#editor").val(JSON.stringify(parsed, null, 4));
		$("#errors").html('Updated ' + new Date());
	}
	else if(res.status == 304){
		$("#errors").html('Not modified');
	}
}

function postDATA(){
	var curJSON = $("#editor").val();
	var parsedJSON;
	var stringifyedData;

	try{
		parsedJSON = JSON.parse(curJSON);
		stringifyedData = JSON.stringify(parsedJSON);
	}
	catch(err){
		$("#errors").html('Error while parse JSON');
		return;
	}

	var settings = {
		contentType: "application/json",
		success: refreshJSON,
		url: document.URL,
		data: stringifyedData,
		type: 'PUT'
	};

	$.ajax(settings);
}

function load() {
	var child, data;
	if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText);

		if(data){
			var dataParsed = JSON.parse(data.text);
			var dataText = JSON.stringify(dataParsed, null, 4);			

			var html = '<textarea style="width: 80%; height: 500px;" id="editor">' + dataText + '</textarea><br/>' +
					'<button type="submit" id="update_json_data">Save</button>' +
					'<button id="refresh_btn">Get data from RIAK</button>' +
					'<div id="errors"></div>';

			document.documentElement.innerHTML = html;
			$("#update_json_data").click(postDATA);
			$("#refresh_btn").click(refreshJSON);			
		}			
	}
}

load();