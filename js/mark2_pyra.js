load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_pyram.js");

var mark2_pyra = {
	name: 'pyra',

	scramble_func: function() {
		var s = scramblers["pyram"].getRandomScramble();
		return s.scramble_string;
	},

	selected: function() {
		scramblers["pyram"].initialize(null, Math);
	}
};

scramble_manager.add(mark2_pyra);
ui.plugin_loaded("mark2_pyra");
