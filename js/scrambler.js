var scramble_manager = (function() {
	var scramblers = [];
	var last_scramble;
	var current_scrambler = undefined;
	var current_index = undefined;

	function add(s) {
		scramblers.push(s);
	}
	
	function add_default() {
		add({ name: '3x3', scramble_func: scramble_manager.generic([["U","D"],["R","L"],["F","B"]],["","2","'"], 25), selected: function(){}, unselected: function(){}});
		add({ name: '4x4', scramble_func: scramble_manager.generic([["U","D","u"],["R","L","r"],["F","B","f"]],["","2","'"], 40), selected: function(){}, unselected: function(){}});
		add({ name: '5x5', scramble_func: scramble_manager.generic([["U","D","u'",'d'],["R","L",'r','l'],["F","B",'f','b']],["","2","'"], 60), selected: function(){}, unselected: function(){}});
		set(0);
	}
	
	function set(index) {
		if(current_scrambler && current_scrambler.unselected)
			current_scrambler.unselected();
		
		current_scrambler = scramblers[index];
		
		if(current_scrambler.selected)
			current_scrambler.selected();
	}

	function next() {
		return last_scramble = current_scrambler.scramble_func();
	}
	
	function get_name(index) {
		return scramblers[index].name;
	}

	return {
		scramblers: scramblers,

		add: add,
		add_default: add_default,
		set: set,

		next: next,
		last_scramble: function() { return last_scramble; },

		get_name: get_name,

		generic: function(turns, suffixes, length) {
			function randn(n) {  return Math.floor(Math.random() * n); }
			function rand_el(x) { return x[randn(x.length)]; }
		
			return function(){
				var donemoves = [];
				var lastaxis = -1;
				var s = "";
	
				for(var j = 0; j < length; j++){
					var done = 0;
					while(done === 0) {
						var first = randn(turns.length);
						var second = randn(turns[first].length);
	
						if(first != lastaxis) {
							for(var k=0; k < turns[first].length; k++) donemoves[k] = 0;
							lastaxis = first;
						}

						if(donemoves[second] === 0) {
							donemoves[second] = 1;
							s += (turns[first][second]) instanceof Array ?
								rand_el(turns[first][second]) : turns[first][second];
							s += rand_el(suffixes) + " ";
							done = 1;
						}
					}
				}
				return s;
			};
		}
	};
})();
