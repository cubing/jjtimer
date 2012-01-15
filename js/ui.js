function load_external(url) {
	var file = document.createElement('script');
	file.type = "text/javascript";
	file.src = url;
	document.getElementsByTagName("head")[0].appendChild(file);
} 

function $(id) { return document.getElementById(id); }
function t(e, t) { e.innerHTML = t; }

var ui = (function() {
	function toggle(e) { e.style.display = (e.style.display === "none") ? "inline" : "none"; }
	function is_visible(e) { return e.style.display !== "none"; }

	var timer_label, scramble_label, stats_label, options_label, to_hide;
	var update_timer, inspection_timer, inspection_count = 15;
	var config;

	function human_time(time) {
		if(time < 0) return "DNF";

		time = Math.round(time / (config['use_milli'] ? 1 : 10));
		var bits = time % (config['use_milli'] ? 1000 : 100);
		time = (time - bits) / (config['use_milli'] ? 1000 : 100);
		var secs = time % 60;
		var mins = ((time - secs) / 60) % 60;
		var hours = (time - secs - 60 * mins) / 3600;
		var s = "" + bits;
		if (bits < 10) {s = "0" + s;}
		if (bits < 100 && config['use_milli']) {s = "0" + s;}
		s = secs + "." + s;
		if (secs < 10 && (mins > 0 || hours > 0)) {s = "0" + s;}
		if (mins > 0 || hours > 0) {s = mins + ":" + s;}
		if (mins < 20 && hours > 0) {s = "0" + s;}
		if (hours > 0) {s = hours + ":" + s;}
		return s;
	}

	function solve_time(solve) {
		var out = "";
		if(solve['DNF'])
			out += "DNF(";

		out += human_time(solve['time']);
		out += solve['plus_two'] ? "+" : "";

		if(solve['DNF'])
			out += ")";
		return out;
	}

	function on_inspection() {
		timer_label.style.color = "red";
		if(inspection_count > 0) {
			t(timer_label, inspection_count);
		}
		else if(inspection_count > -2) {
			t(timer_label, "+2");
		}
		else {
			t(timer_label, "DNF");
		}
		inspection_count -= 1;
		inspection_timer = setTimeout(on_inspection, 1000);
	}

	function next_scramble()
	{
		t(scramble_label, scramble_manager.next());
	}

	function update_stats() {
		t($('s_t'), session.length());
		t($('c_a_5'), human_time(session.current_average(5)));
		t($('c_a_12'), human_time(session.current_average(12)));
		t($('c_a_100'), human_time(session.current_average(100)));
		t($('b_a_5'), human_time(session.best_average(5, false)['avg']));
		t($('b_a_12'), human_time(session.best_average(12, false)['avg']));
		t($('b_a_100'), human_time(session.best_average(100, false)['avg']));
		t($('s_a'), human_time(session.session_average()));
		t($('s_m'), human_time(session.session_mean()));
		t(times_label, to_times_list(null, null, null, null));
		times_label.scrollTop = times_label.scrollHeight;
	}

	function to_times_list(hilight_index, length, paren_i, paren_j) {
		if(session.length() < 1) return "&nbsp;"
		if(hilight_index === null)
			hilight_index = length = paren_i = paren_j = -1;

		var out = "";
		for(var i = 0; i < session.length(); ++i)
		{
			if(i != 0) out += ", ";
			if(i === hilight_index) out += "<span class='h' onclick='ui.toggle_avg_popup("+hilight_index+", "+(hilight_index + length)+")'>";
			if(i === paren_i || i === paren_j) out += "(";

			if(hilight_index !== -1 && i >= hilight_index)
				out += "<span>";
			else out += "<span onclick='ui.toggle_solve_popup("+i+")'>";
			out += solve_time(session.solves()[i]);
			out += "</span>";

			if(i === paren_i || i === paren_j) out += ")";
			if(i === hilight_index + length) out += "</span>";
		}
		return out;
	}
	
	function populate_scramblers_menu() {
		var menu = $('scramble_menu');
		for(var i = 0; i < scramble_manager.scramblers.length; i++)
		{
			menu.options[i] = new Option(scramble_manager.get_name(i));
		}
	}

	function toggle_options() {
		if(timer.is_running()) return;
		toggle($('options'));
		toggle($('gray_out')); 
	}

	function toggle_solve_popup(index) {
		if(timer.is_running()) return;
		if(index !== null) {
			$('solve_popup_index').innerHTML = index + 1;
			$('solve_popup_time').innerHTML = solve_time(session.solves()[index]);
			$('solve_popup_scramble').innerHTML = session.solves()[index]['scramble'];
			$('solve_popup_p2').onclick = function() {
				session.toggle_plus_two(index);
				$('solve_popup_time').innerHTML = solve_time(session.solves()[index]);
			};
			$('solve_popup_dnf').onclick = function() {
				session.toggle_dnf(index);
				$('solve_popup_time').innerHTML = solve_time(session.solves()[index]);
			};
			$('solve_popup_del').onclick = function() {
				session.del(index);
				toggle_popup();
			};
		}
		toggle($('solve_popup'));
		toggle($('gray_out'));
	}

	function toggle_avg_popup(index, end) {
		if(index !== null) {
			var out = "";
			for(var i = index; i < end+1; i++)
			{
				out += solve_time(session.solves()[i]) + " ";
				out += session.solves()[i]['scramble'] + "<br />";
			}
			$('avg_popup_list').innerHTML = out;
			$('avg_popup_header').innerHTML = "solves " + (index+1) + " - " + (end+1);
		}
		toggle($('avg_popup'));
		toggle($('gray_out'));
	}

	function toggle_popup() {
		if(is_visible($('options'))) toggle($('options'));
		else if(is_visible($('solve_popup'))) {
			toggle($('solve_popup'));
			update_stats();
		}
		else if(is_visible($('avg_popup')))
			toggle($('avg_popup'));
		toggle($('gray_out'));
	}
	
	function highlight(start, length, paren_i, paren_j) {
		if(timer.is_running()) return;
		if(paren_i === null || paren_j === null) paren_i = paren_j = -1;
		t(times_label, to_times_list(start, length - 1, paren_i, paren_j));
	}

	function hilight_current(length, paren_i, paren_j) {
		if(timer.is_running()) return;
		if(paren_i === null || paren_j === null) paren_i = paren_j = -1;
		highlight(session.length() - length, length, paren_i, paren_j);
	}

	function spacebar_down(ev) {
		timer.trigger_down();
	}

	function spacebar_up(ev) {
			timer.trigger_up(true);
	}

	function esc_up(ev) {
		if(is_visible($('gray_out'))) {
			toggle_popup();
		}
		else {
			if(timer.is_running()) timer.trigger_down();
			ui.reset();
		}
	}

	return {
	on_inspection: on_inspection,

	on_running: function() {
		timer_label.style.color = "black";
		clearTimeout(inspection_timer);
		update_timer = setInterval(ui.update_running, 10);
		for(var i = 0; i < to_hide.length; i++)
		{
			to_hide[i].className = to_hide[i].className + " g";
		}
	},

	update_running: function() {
		t(timer_label, human_time(timer.get_time()));
	},

	on_stop: function() {
		clearInterval(update_timer);
		t(timer_label, human_time(timer.get_time()));
		if(timer.use_inspection()) {
			if(inspection_count < 0) {
				if(inspection_count >= -2) {
					session.toggle_plus_two(null);
				}
				else {
					session.toggle_dnf(null);
				}
			}
			inspection_count = 15;
		}
		for(var i = 0; i < to_hide.length; i++)
		{
			to_hide[i].className = to_hide[i].className.substr(0, to_hide[i].className.length-2);
		}
		next_scramble();
		update_stats();
	},

	toggle_solve_popup: toggle_solve_popup,
	toggle_avg_popup: toggle_avg_popup,
	
	reset: function() {
		timer.reset();
		next_scramble();
		update_stats();
		t(timer_label, "0.00");	
		t(times_label, "&nbsp;");
	},

	load_plugin: function() {
		var url = $('plugin_url').value;
		load_external(url);
		$('plugin_url').value = "";
	},

	plugin_loaded: function(name) {
		t($('info'), "loaded " + name);
		populate_scramblers_menu();
		setTimeout(function() {
			t($('info'), "");
		}, 1000);
	},

	on_close: function() {
		if(config['auto_save'])
			session.save();
		localStorage.setItem("ui.config", JSON.stringify(config));
	},

	render_body: function() {
		document.body.innerHTML = '<div id="left"><div id="info"></div>'+
              '<div id="timer_label">0.00</div>'+
              '<div class="hide_running" id="scramble_label"></div>'+
              '<div id="penalty" class="a hide_running">that time was: <span id="p2">+2</span> <span id="dnf">DNF</span></div>'+
              '<div id="bottom_bar" class="hide_running"><div id="stats_label">'+
              'times: <span id="s_t">0</span><br />'+
              '<span id="stats_link" class="a">'+
              'current average: <span id="c_a_5"></span>, <span id="c_a_12"></span>, <span id="c_a_100"></span><br />'+
              'best average: <span id="b_a_5"></span>, <span id="b_a_12"></span>, <span id="b_a_100"></span><br />'+
              'session average: <span id="s_a"></span>, mean: <span id="s_m"></span></span></div>'+
              '<span class="a"><span id="toggle_stats">hide stats</span> | <span id="options_label">options</span></span></div></div>'+

              '<div id="right"><div id="times_label" class="hide_running a"></div></div>'+
              '<div id="options" style="display: none;"><h2>options</h2>'+
              '<p><select id="scramble_menu"></select></p>'+
              '<p><input type="input" id="plugin_url" /><input type="submit" onclick="ui.load_plugin()" value="load"/></p>'+
              '<h3>timer</h3>'+
              '<p><input type="checkbox" id="use_inspection"><label for="use_inspection">use inspection</label>'+
              '<input type="checkbox" id="use_milli"><label for="use_milli">use milliseconds</label></p>'+
              '<h3>session</h3>'+
              '<p><input type="submit" id="save_btn" value="save" /> <input type="submit" id="load_btn" value="load" /></p>'+
              '<p><input type="checkbox" id="auto_save"><label for="auto_save">automatically save/load</label></p>'+
              '<span class="a"><span id="close_options">close</span></span></div>'+

              '<div id="solve_popup" style="display: none;">'+
              '<h3>solve <span id="solve_popup_index"></span></h3>'+
              '<span id="solve_popup_time"></span>'+
              '<br /><span id="solve_popup_scramble"></span>'+
              '<br /><span class="a">'+
              '<span id="solve_popup_p2">+2</span> <span id="solve_popup_dnf">DNF</span> <span id="solve_popup_del">delete</span>'+
              '<span id="solve_popup_close">close</span>'+
              '</span></div>'+

              '<div id="avg_popup" style="display: none;">'+
              '<h3 id="avg_popup_header"></h3>'+
              '<span id="avg_popup_list"></span>'+
              '</div>'+

              '<div id="gray_out" style="display: none;"></div>';
	},

	init: function() {
		ui.render_body();

		timer_label = $('timer_label');
		scramble_label = $('scramble_label');
		stats_label = $('stats_label');
		times_label = $('times_label');
		options_label = $('options_label');
		to_hide = document.getElementsByClassName("hide_running");

		$('p2').onclick = function() {
			if(timer.is_running()) return;
			session.toggle_plus_two(null);
			update_stats();
			t(timer_label, solve_time(session.last()));
		};
		$('dnf').onclick = function() {
			if(timer.is_running()) return;
			session.toggle_dnf(null);
			update_stats();
			t(timer_label, solve_time(session.last()));
		};

		$('c_a_5').onclick = function() {
			if(timer.is_running()) return;
			hilight_current(5, null, null);
		};
		$('b_a_5').onclick = function() {
			if(timer.is_running()) return;
			var a = session.best_average(5, true);
			highlight(a['index'], 5, a['best_single_index'], a['worst_single_index']);
		};
		$('c_a_12').onclick = function() {
			if(timer.is_running()) return;
			hilight_current(12, null, null);
		};
		$('b_a_12').onclick = function() {
			if(timer.is_running()) return;
			var a = session.best_average(12, true);
			highlight(a['index'], 12, a['best_single_index'], a['worst_single_index']);
		};
		$('s_a').onclick = function() {
			if(timer.is_running()) return;
			hilight_current(session.length(), null, null);
		};
		$('s_m').onclick = function() {
			if(timer.is_running()) return;
			hilight_current(session.length(), null, null);
		};

		$('toggle_stats').onclick = function() {
			if(timer.is_running()) return;
			toggle($('stats_link'));
			if(is_visible($('stats_link')))
				$('toggle_stats').innerHTML = "hide stats";
			else
				$('toggle_stats').innerHTML = "show stats";
		};

		$('options_label').onclick = toggle_options;
		$('close_options').onclick = toggle_options;
		$('gray_out').onclick = toggle_popup;
		$('scramble_menu').onchange = function(s) {
			scramble_manager.set($('scramble_menu').selectedIndex);
			next_scramble();
		};
		$('use_inspection').onchange = function() {
			timer.toggle_inspection();
			config['use_inspection'] = $('use_inspection').checked;
		}
		$('use_milli').onchange = function() {
			config['use_milli'] = $('use_milli').checked;
			update_stats();
			t(timer_label, human_time(timer.get_time()));
		}
		$('save_btn').onclick = session.save;
		$('load_btn').onclick = function() { session.load(); update_stats(); };
		$('auto_save').onchange = function() { config['auto_save'] = $('auto_save').checked;  };

		$('solve_popup_close').onclick = toggle_popup;

		scramble_manager.add_default();
		populate_scramblers_menu();

		ui.reset();
		
		shortcuts.init();
		shortcuts.add_key_down(32, {'func': spacebar_down});
		shortcuts.add_key_up(32, {'func': spacebar_up});
		shortcuts.add_key_up(27, {'func': esc_up});

		if(localStorage)
			config = JSON.parse(localStorage.getItem("ui.config"));
		if(config == null)
			config = {};

		if(config['auto_save']) {
			$('auto_save').checked = true;
			session.load();
			update_stats();
		}
		if(config['use_inspection']) {
			$('use_inspection').checked = true;
			timer.toggle_inspection();
		}

		$('use_milli').checked = config['use_milli'];
	}
	};
})();
window['ui'] = ui;
window.onload = ui.init;
window.onbeforeunload = ui.on_close;
