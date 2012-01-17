var session = (function() {
	var solves = [];

	function get_trim_count(n) {
		return Math.ceil((n/10)/2);	
	}

	function solve_sort(a, b){
		if(a['DNF']) return 1;
		if(b['DNF']) return -1;

		return a['time'] - b['time'];
	}

	function mean() {
		if(solves.length < 1) return -1;

		var sum = 0, dnfs = 0;
		for(var i = 0; i < solves.length; ++i)
		{
			var s = solves[i];
			s['DNF'] ? ++dnfs : sum += s['time'];
		}
		
		if(solves.length - dnfs === 0) return -1;
		return sum / (solves.length - dnfs);
	}

	function average(start, length) {
		if(solves.length < 3) return -1;

		start = start || 0;
		length = length || solves.length;
		if(length - start > solves.length) return -1;
		var end = start + length;

		var trim = get_trim_count(length);

		var copy = solves.slice(start, end);
		copy.sort(solve_sort);
		copy.splice(0, trim);
		copy.splice(copy.length - trim, trim);

		if(copy[copy.length-1]['DNF']) return -1;

		var sum = 0;
		for(var i = 0; i < copy.length; ++i)
		{
			sum += copy[i]['time'];
		}
		return sum / (length - (2 * trim));
	}

	return {
	solves: function() { return solves; },
	length: function() { return solves.length; },
	last: function() { return solves[solves.length - 1]; },

	reset: function() {
		solves = [];
	},

	add: function(time, scramble) {
		solves.push({'time': time, 'scramble': scramble});
		ui.update_stats();
	},

	del: function(index) {
		if(index === null) index = solves.length - 1;
		solves.splice(index, 1);
		ui.update_stats();
	},

	toggle_dnf: function(index) {
		if(index === null) index = solves.length - 1;
		solves[index]['DNF'] = !solves[index]['DNF'];
		ui.update_stats();
	},

	toggle_plus_two: function(index) {
		if(index === null) index = solves.length - 1;
		solves[index]['plus_two'] = !solves[index]['plus_two'];
		solves[index]['time'] += solves[index]['plus_two'] ? 2000 : -2000;
		ui.update_stats();
	},

	mean: mean,

	average: average,
	
	current_average: function(length) {
		return average(solves.length - length, length);
	},

	session_average: function() {
		return average(0, solves.length);
	},

	session_mean: function() {
		return mean();
	},

	best_average: function(length, find_best_singles) {
		var best = Infinity, best_index;
		for(var i = 0; i < solves.length - (length - 1); i++) {
			var a = average(i, length);
			if(a < best) {
				best = a;
				best_index = i;
			}
		}
		
		if(find_best_singles && best_index !== -1) {
			var best_single = Infinity, worst_single = -Infinity;
			var best_single_index, worst_single_index;

			for(var i = best_index; i < (best_index + length); i++) {
				if(solves[i]['time'] < best_single) {
					best_single = solves[i]['time'];
					best_single_index = i;
				}
				if(solves[i]['time'] > worst_single) {
					worst_single = solves[i]['time'];
					worst_single_index = i;
				}
			}
		}

		if(best === Infinity) best = -1;
		return {'avg': best, 'index': best_index,
			'best_single_index': best_single_index, 'worst_single_index': worst_single_index};
	},

	load: function() {
		if(localStorage)
		{
			var localSolves = localStorage.getItem('session.solves');
			if(localSolves != null)
				solves = JSON.parse(localSolves);	
			ui.update_stats();
		}
	},

	save: function() {
		if(localStorage)
		{
			localStorage.setItem('session.solves', JSON.stringify(solves));
		}
	}
	};
})();
