var timer = function() {
	var state, Waiting = 0, Inspecting = 1, Ready = 2, Running = 3, Delay = 4;
	var start_time, end_time, solve_time;
	var use_inspection = false;

	function set_running() {
		solve_time = undefined;
		start_time = new Date();
		state = Running;
		ui.on_running();
	}

	function set_stopped() {
		end_time = new Date();
		state = Delay;
		solve_time = end_time.getTime() - start_time.getTime();
		session.add(solve_time, scramble_manager.last_scramble());
		ui.on_stop();
		setTimeout(function() { state = Waiting; }, 500);
	}

	return {
		reset: function() {
			state = Waiting;
			session.reset();
		},

		toggle_inspection: function() {
			use_inspection = !use_inspection;
		},

		trigger_down: function(ev) {
			if((Waiting === state && !use_inspection) ||
					Inspecting === state) {
				state = Ready;
			}
			else if(Running === state) {
				set_stopped();
			}
		},

		trigger_up: function(ev) {
			if(use_inspection && Waiting === state && ev)
			{
				state = Inspecting;
				ui.on_inspection();
			}
			else if(Ready === state && ev) {
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
