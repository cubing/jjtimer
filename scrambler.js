function scrambler(name, scramble_func, selected, unselected) {
	this.name = name;
	this.scramble_func = scramble_func;
	this.selected = selected || function() {};
	this.unselected = unselected || function() {};
}

var scramble_manager = function() {
	var scramblers = [];
	var last_scramble;
	var current_scrambler = undefined;
	var current_index = undefined;

	function add(s) {
		scramblers.push(s);
	}
	
	function add_default() {
		add(new scrambler("3x3", scramble_manager.generic([["U","D"],["R","L"],["F","B"]],["","2","'"], 25)));
		add(new scrambler("4x4", scramble_manager.generic([["U","D","u"],["R","L","r"],["F","B","f"]],["","2","'"], 40)));
		set(0);
	}
	
	function set(index) {
		if(current_index)
			scramblers[current_index].unselected();
		current_index = index;
		current = scramblers[index].scramble_func;
		scramblers[index].selected();
	}

	function next() {
		return last_scramble = current();
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
}();
