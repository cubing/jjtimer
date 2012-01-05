load_external("http://www.cubing.net/mark2-test/inc/raphael-min.js")
load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_222.js")

var mark2_222 = {
	name: '2x2',

	scramble_func: function() {
		var s = scramblers["222"].getRandomScramble(); 
		$('info').html("");
		scramblers["222"].drawScramble($('info'), s.state, 100, 80);
		return s.scramble;
	},

	selected: function(){
		scramblers["222"].initialize(null, Math);
	},

	unselected: function(){
		$('info').html("");
	}
};

scramble_manager.add(mark2_222);
ui.plugin_loaded("mark2_222");

