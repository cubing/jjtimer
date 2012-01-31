"use strict";
var shortcuts = (function() {
	var shortcuts_down = {};
	var shortcuts_up = {};

	function add_key_down(key, shortcut) {
		add_key(key, shortcut, shortcuts_down);
	}

	function add_key_up(key, shortcut) {
		add_key(key, shortcut, shortcuts_up);
	}

	function add_key(key, shortcut, direction) {
		shortcut['shift'] = shortcut['shift'] ? true : false;
		key = typeof key === String ? key.charCodeAt() : key;
		if(!direction[key]) direction[key] = [];
		direction[key][direction[key].length] = shortcut;
	}

	function key_down(ev) {
		do_key(ev, shortcuts_down);
	}

	function key_up(ev) {
		do_key(ev, shortcuts_up);
	}

	function do_key(ev, direction) {
		var s = direction[ev.keyCode];
		if(!s) return;

		for(var i = 0; i < s.length; i++)
		{
			if(s[i]['shift'] == ev.shiftKey) {
				s[i]['func'](ev);
			}
		} 
	}

	function init() {
		document.onkeydown = key_down;
		document.onkeyup = key_up;
	}

	return {
		down: 0,
		up: 1,

		space: 32,
		esc: 27,

		init: init,
		add_key_down: add_key_down,
		add_key_up: add_key_up
	};
})();
