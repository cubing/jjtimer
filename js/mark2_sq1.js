load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_sq1.js")

var mark2_sq1 = {
	name: 'square-1',

	scramble_func: function() {
		var s = scramblers["sq1"].getRandomScramble(); 
		return s.scramble_string;
	},

	selected: function(){
		scramblers["sq1"].initialize(null, Math);
	},

	unselected: function(){
	}
};

scramble_manager.add(mark2_sq1);
ui.plugin_loaded("mark2_sq1");
