load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_333.js")

var mark2_333 = {
	name: '3x3-mk2',

	scramble_func: function() {
		var s = scramblers["333"].getRandomScramble(); 
		return s.scramble_string;
	},

	selected: function(){
		scramblers["333"].initialize(null, Math);
	}
};

scramble_manager.add(mark2_333);
ui.plugin_loaded("mark2_333");
