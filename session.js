var session = function() {
	var solves = [];

	function get_trim_count(n) {
		return Math.ceil((n/10)/2);	
	};

	function solve_sort(a, b){
		if(a['DNF']) return -1;
		if(b['DNF']) return 1;

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

		var sum = 0, dnfs = 0;
		for(var i = 0; i < solves.length; ++i)
		{
			var s = solves[i];
			if(s['DNF']) ++dnfs;
			else sum += s['time'];
			if(s['plus_two'] && !s['DNF']) sum += 2000;
		}
		
		if(solves.length - dnfs === 0) return -1;
		return sum / (solves.length - dnfs);
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

		if(copy[0]['DNF']) return -1;

		for(var i = 0; i < copy.length; ++i)
		{
			var s = copy[i];
			sum += s['time'];
			if(s['plus_two']) sum += 2000;
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
		var best = -1, best_index = -1;
		for(var i = 0; i < solves.length - (length - 1); i++)
		{
			var a = session.average(i, length);
			if(a < best || -1 === best) {
				best = a;
				best_index = i;
			}
		}
		return {'avg': best, 'index': best_index};
	},

	load: function() {
		if(localStorage)
		{
			var localSolves = localStorage.getItem('session.solves');
			if(localSolves != null)
				solves = JSON.parse(localSolves);	
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
