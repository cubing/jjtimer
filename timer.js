function $(id) { return document.getElementById(id); }
function t(e, t) { e.innerHTML = t; }
function toggle(e) { e.style.display = (e.style.display == "none") ? "" : "none"; }
var timer = function() {
	var state, Waiting = 0, Ready = 1, Running = 2;
	var start_time, end_time, solve_time;
	var update_timer;

	function set_running() {
		solve_time = undefined;
		start_time = new Date();
		state = Running;
		update_timer = setInterval(ui.update_running, 10);
		ui.on_running();
	}

	function set_stopped() {
		end_time = new Date();
		clearInterval(update_timer);
		state = Waiting;
		solve_time = end_time.getTime() - start_time.getTime();
		session.add(solve_time, scramble_label.innerHTML);
		ui.on_stop();
	}

	return {
		reset: function() {
			state = Waiting;
			session.reset();
		},

		key_down: function(ev) {
			if(Waiting == state) { state = Ready;  }
			else if(Running == state) {
				set_stopped();
			}
		},

		key_up: function(ev) {
			if(Ready == state && ev.keyCode == 32) {
				set_running();
			}
		},

		is_running: function() {
			return Running == state;
		},
		
		current_time: function() {
			return solve_time || new Date().getTime() - start_time.getTime();
		}
	};
}();
