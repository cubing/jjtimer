"use strict";
var timer = function() {
	var state, Waiting = 0, Inspecting = 1, Ready = 2, Running = 3, Delay = 4;
	var start_time, end_time, solve_time;
	var use_inspection = false;
	var running_timer, inspection_timer, inspection_count = 15;

	function set_inspection() {
		ui.on_inspection(inspection_count);
		inspection_count -= 1;
		inspection_timer = setTimeout(set_inspection, 1000);
	}

	function set_running() {
		solve_time = undefined;
		start_time = new Date().getTime();
		state = Running;
		clearTimeout(inspection_timer);
		ui.on_running();
		running_timer = setInterval(on_running, 10);
	}

	function on_running() {
		ui.update_running(timer.get_time());
	}

	function set_stopped() {
		end_time = new Date().getTime();
		clearInterval(running_timer);
		state = Delay;
		solve_time = end_time - start_time;
		ui.on_stop();
		session.add(solve_time, scramble_manager.last_scramble());
		if(use_inspection && inspection_count < 0) {
			if(inspection_count >= -2) {
				session.toggle_plus_two(null);
			}
			else {
				session.toggle_dnf(null);
			}
		}
		inspection_count = 15;
		setTimeout(function() { state = Waiting; }, 500);
	}

	return {
		reset: function() {
			state = Waiting;
			session.reset();
		},

		use_inspection: function() {
			return use_inspection;
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
			if(use_inspection && Waiting === state)
			{
				state = Inspecting;
				set_inspection();
			}
			else if(Ready === state) {
				set_running();
			}
		},

		is_running: function() {
			return Running === state;
		},
		
		get_time: function() {
			return solve_time || new Date().getTime() - start_time;
		}
	};
}();
