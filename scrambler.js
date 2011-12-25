function scrambler_(name, scramble_func, init, dinit) {
	this.name = name;
	this.scramble_func = scramble_func;
	this.init = init || function() {};
	this.dinit = dinit || function() {};
}

var scrambler = {
	scramblers: [],
	current: undefined,
	current_index: 0,

	add: function(s) {
		scrambler.scramblers.push(s);
	},

	add_default: function() {
		scrambler.add(new scrambler_("3x3", scrambler.generic([["U","D"],["R","L"],["F","B"]],["","2","'"], 25)));
		scrambler.add(new scrambler_("4x4", scrambler.generic([["U","D","u"],["R","L","r"],["F","B","f"]],["","2","'"], 40)));
		scrambler.set(0);
	},

	set: function(index) {
		if(scrambler.current)
			scrambler.scramblers[scrambler.current_index].dinit();
		scrambler.current_index = index;
		scrambler.current = scrambler.scramblers[index].scramble_func;
		scrambler.scramblers[index].init();
	},

	get_name: function(index) {
		return scrambler.scramblers[index].name;
	},

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
