var session = function() {
	var solves = [];

	function get_trim_count(n) {
		return Math.ceil((n/10)/2);	
	};

	function solve_sort(a, b){
		var at = a['time'], bt = b['time'];
		at = a['plus_two'] ? at + 2000 : at;		
		bt = b['plus_two'] ? bt + 2000 : bt;		
		return at - bt;
	};

	return {
	solves: function() { return solves; },
	length: function() { return solves.length; },	
	last: function() { return solves[solves.length - 1]; },

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
		
		var trim = get_trim_count(length);

		var copy = solves.slice(start, end);
		copy.sort(solve_sort);
		copy.splice(0, trim);
		copy.splice(copy.length - trim, trim);

		for(var i = 0; i < copy.length; ++i)
		{
			sum += copy[i]['time'];
		}
		return sum / (length - (2 * trim));
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
		if(localStorage)
		{
			solves = JSON.parse(localStorage.getItem('session.solves'));	
		}
	},

	save: function() {
		if(localStorage)
		{
			localStorage.setItem('session.solves', JSON.stringify(solves));
		}
	}
	};
}();
