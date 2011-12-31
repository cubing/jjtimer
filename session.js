var session = function() {
	var solves = [];

	return {
	solves: function() { return solves; },
	length: function() { return solves.length; },	

	reset: function() {
		solves = [];
	},

	add: function(time, scramble) {
		solves.push({'time': time, 'scramble': scramble, 'DNF': false, 'plus_two': false});
	},

	del: function(index) {
		solves.splice(index, 1);
	},

	toggle_dnf: function(index) {
		if(typeof index != 'Number') index = solves.length - 1;
		solves[index]['DNF'] = !solves[index]['DNF']; 
	},

	toggle_plus_two: function(index) {
		if(typeof index != 'Number') index = solves.length - 1;
		solves[index]['plus_two'] = !solves[index]['plus_two'];
	},

	mean: function() {
		if(solves.length < 1) return -1;

		var sum = 0;
		for(var i = 0; i < solves.length; ++i)
		{
			sum += solves[i]['time'];
		}
		return sum / solves.length;
	},

	average: function(start, length) {
		if(solves.length < 3) return -1;

		start = start || 0;
		length = length || solves.length;
		if(length - start > solves.length) return -1;
		var end = start + length;

		var min = -1, max = -1, sum = 0;
		for(var i = start; i < end; ++i)
		{
			var t = solves[i]['time'];
			if(t < min || -1 === min) min = t;
			if(t > max || -1 === max) max = t;
			sum += t;
		}
		sum -= min + max;
		return sum / (length - 2);
	},
	
	current_average: function(length) {
		return session.average(solves.length - length, length);
	},

	session_average: function() {
		return session.average(0, solves.length);
	},

	session_mean: function() {
		return session.mean(0, solves.length);
	},

	best_average: function(length) {
		var best = -1;
		for(var i = 0; i < solves.length - (length - 1); i++)
		{
			var a = session.average(i, length);
			if(a < best || -1 === best) best = a;
		}
		return best;
	},

	load: function() {
		session.solves = JSON.parse(localStorage.getItem('session.solves'));	
	},

	save: function() {
		if(localStorage)
		{
			localStorage.setItem('session.solves', JSON.stringify(solves));
		}
	}
	};
}();
