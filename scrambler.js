function rndEl(x){return x[Math.floor(Math.random()*x.length)];}

function isArray(obj){
	return (obj instanceof Array);
	if(typeof obj=='object'){
  	var test = obj.constructor.toString().match(/array/i); 
  		return (test != null);
  }
 	return false;
}

var scrambler = {
	scramblers: [],
	current: undefined,	

	add: function(s) {
		scrambler.scramblers.push(s);
	},

	set: function(index) {
		scrambler.current = scrambler.scramblers[index][1];
	},

	get_name: function(index) {
		return scrambler.scramblers[index][0];
	},

	generic: function(turns, suffixes, length) {
		return function(){
			var donemoves = [];
			var lastaxis = -1;
			var s = "";

			for(var j = 0; j < length; j++){
				var done = 0;
				while(done == 0) {
					var first = Math.floor(Math.random()*turns.length);
					var second = Math.floor(Math.random()*turns[first].length);

					if(first != lastaxis) {
						for(var k=0; k < turns[first].length; k++) donemoves[k] = 0;
						lastaxis = first;
					}

					if(donemoves[second] == 0) {
						donemoves[second] = 1;
						s += isArray(turns[first][second]) ? rndEl(turns[first][second]) : turns[first][second];
						s += rndEl(suffixes) + " ";
						done = 1;
					}
				}
			}
			return s;
		};
	}
};
