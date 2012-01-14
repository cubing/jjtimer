var shortcut_manager = function() {
	var shortcuts_down = {};
	var shortcuts_up = {};

	function add_key_down(key, shortcut) {
		shortcut['direction'] = 0;
		shortcut['shift'] = shortcut['shift'] ? true : false;
		if(!shortcuts_down[key]) shortcuts_down[key] = [];
		shortcuts_down[key][shortcuts_down[key].length] = shortcut;
	}

	function add_key_up(key, shortcut) {
		shortcut['direction'] = 1;
		shortcut['shift'] = shortcut['shift'] ? true : false;
		if(!shortcuts_up[key]) shortcuts_up[key] = [];
		shortcuts_up[key][shortcuts_up[key].length] = shortcut;
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

		init: init,
		add_key_down: add_key_down,
		add_key_up: add_key_up
	};
}();
