var session = function() {
	var times = [];
	var scrambles = [];

	return {
	times: function() { return times; },
	scrambles: function() { return scrambles; },
	length: function() { return times.length; },	

	reset: function() {
		times = [];
		scrambles = [];
	},

	add: function(time, scramble) {
		times.push(time);
		scrambles.push(scramble);
	},

	del: function(index) {
		times.splice(index, 1);
		scrambles.splice(index, 1);
	},

	mean: function() {
		if(times.length < 1) return -1;

		var sum = 0;
		for(var i = 0; i < times.length; ++i)
		{
			sum += times[i];
		}
		return sum / times.length;
	},

	average: function(start, length) {
		if(times.length < 3) return -1;

		start = start || 0;
		length = length || times.length;
		if(length - start > times.length) return -1;
		var end = start + length;

		var min = -1, max = -1, sum = 0;
		for(var i = start; i < end; ++i)
		{
			var t = times[i];
			if(t < min || -1 === min) min = t;
			if(t > max || -1 === max) max = t;
			sum += t;
		}
		sum -= min + max;
		return sum / (length - 2);
	},
	
	current_average: function(length) {
		return session.average(times.length - length, length);
	},

	session_average: function() {
		return session.average(0, times.length);
	},

	session_mean: function() {
		return session.mean(0, times.length);
	},

	best_average: function(length) {
		var best = -1;
		for(var i = 0; i < times.length - (length - 1); i++)
		{
			var a = session.average(i, length);
			if(a < best || -1 === best) best = a;
		}
		return best;
	}
	};
}();
