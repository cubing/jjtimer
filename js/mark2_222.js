load_external("http://www.cubing.net/mark2/inc/lib/raphael-min.js")
load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_222.js")

var mark2_222 = {
	name: '2x2',

	scramble_func: function() {
		var s = scramblers["222"].getRandomScramble(); 
		t($('cube_drawing'), "");
		scramblers["222"].drawScramble($('cube_drawing'), s.state, 100, 80);
		return s.scramble_string;
	},

	selected: function(){
		scramblers["222"].initialize(null, Math);
	},

	unselected: function(){
		t($('cube_drawing'), "");
	}
};

scramble_manager.add(mark2_222);
ui.plugin_loaded("mark2_222");

