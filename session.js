var session = {
	times: [],
	scrambles: [],

	reset: function() {
		session.times = [];
		session.scrambles = [];
	},

	add: function(time, scramble) {
		session.times.push(time);
		session.scrambles.push(scramble);
	},

	del: function(index) {
		session.times.splice(index, 1);
	},

	mean: function() {
		if(session.times.length < 1) return -1;

		var sum = 0;
		for(var i = 0; i < session.times.length; ++i)
		{
			sum += session.times[i];
		}
		return sum / session.times.length;
	},

	average: function(start, length) {
		if(session.times.length < 3) return -1;

		start = start || 0;
		length = length || session.times.length;
		if(length - start > session.times.length) return -1;
		var end = start + length;

		var min = -1, max = -1, sum = 0;
		for(var i = start; i < end; ++i)
		{
			var t = session.times[i];
			if(t < min || -1 === min) min = t;
			if(t > max || -1 === max) max = t;
			sum += t;
		}
		sum -= min + max;
		return sum / (length - 2);
	},
	
	current_average: function(length) {
		return session.average(session.times.length - length, length);
	},

	session_average: function() {
		return session.average(0, session.times.length);
	},

	session_mean: function() {
		return session.mean(0, session.times.length);
	}
};
