var timer = function() {
	var state, Waiting = 0, Ready = 1, Running = 2;
	var start_time, end_time, solve_time;

	function set_running() {
		solve_time = undefined;
		start_time = new Date();
		state = Running;
		ui.on_running();
	}

	function set_stopped() {
		end_time = new Date();
		state = Waiting;
		solve_time = end_time.getTime() - start_time.getTime();
		session.add(solve_time, scramble_manager.last_scramble());
		ui.on_stop();
	}

	return {
		reset: function() {
			state = Waiting;
			session.reset();
		},

		trigger_down: function(ev) {
			if(Waiting === state) { state = Ready; }
			else if(Running === state) {
				set_stopped();
			}
		},

		trigger_up: function(ev) {
			if(Ready === state && ev) {
				set_running();
			}
		},

		is_running: function() {
			return Running === state;
		},
		
		current_time: function() {
			return solve_time || new Date().getTime() - start_time.getTime();
		}
	};
}();
