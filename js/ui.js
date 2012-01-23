"use strict";
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

	var timer_label, times_label, scramble_label, stats_label, options_label, to_hide;
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
		if(bits < 10) { s = "0" + s; }
		if(bits < 100 && config['use_milli']) { s = "0" + s; }
		s = secs + "." + s;
		if(secs < 10 && (mins > 0 || hours > 0)) { s = "0" + s; }
		if(mins > 0 || hours > 0) { s = mins + ":" + s; }
		if(mins < 20 && hours > 0) { s = "0" + s; }
		if(hours > 0) { s = hours + ":" + s; }
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

	function on_inspection(inspection_time) {
		timer_label.style.color = "red";
		if(inspection_time > 0) {
			t(timer_label, inspection_time);
		}
		else if(inspection_time > -2) {
			t(timer_label, "+2");
		}
		else {
			t(timer_label, "DNF");
		}
	}

	function next_scramble() {
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

	function to_times_list(highlight_index, length, paren_i, paren_j) {
		if(session.length() < 1) return "&nbsp;"
		if(highlight_index === null)
			highlight_index = length = paren_i = paren_j = -1;

		var out = "";
		for(var i = 0; i < session.length(); ++i) {
			if(i != 0) out += ", ";
			if(i === highlight_index) out += "<a href='javascript:;' class='highlighted' onclick='ui.toggle_avg_popup(" + highlight_index + ", " + (highlight_index + length) + ")'>";
			if(i === paren_i || i === paren_j) out += "(";

			var time_str = solve_time(session.solves()[i]);
			if(highlight_index === -1 || (i < highlight_index || i > highlight_index + length)) {
				out += "<a href='javascript:;' onclick='ui.toggle_solve_popup(" + i + ");'>";
				out += time_str;
				out += "</a>";
			}
			else {
				out += time_str;
			}


			if(i === paren_i || i === paren_j) out += ")";
			if(i === highlight_index + length) out += "</a>";
		}
		return out;
	}

	function populate_scramblers_menu() {
		var menu = $('scramble_menu');
		for(var i = 0; i < scramble_manager.scramblers.length; i++) {
			menu.options[i] = new Option(scramble_manager.get_name(i));
		}
	}

	function centre(el) {
		el.style.marginLeft = (el.offsetWidth / -2) + "px";
		el.style.marginTop = (el.offsetHeight / -2) + "px";
	}

	function toggle_options_popup() {
		if(timer.is_running()) return;
		toggle($('options_popup'));
		toggle($('gray_out'));
		centre($('options_popup'));
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
		centre($('solve_popup'));
	}

	function toggle_avg_popup(index, end) {
		if(index !== null) {
			var out = "";
			for(var i = index; i < end + 1; i++) {
				out += solve_time(session.solves()[i]) + " ";
				out += session.solves()[i]['scramble'] + "<br />";
			}
			$('avg_popup_list').innerHTML = out;
			$('avg_popup_header').innerHTML = "solves " + (index + 1) + " - " + (end + 1);
		}
		toggle($('avg_popup'));
		toggle($('gray_out'));
		centre($('avg_popup'));
	}

	function toggle_popup() {
		if(is_visible($('options_popup'))) toggle($('options_popup'));
		else if(is_visible($('solve_popup'))) {
			toggle($('solve_popup'));
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

	function highlight_current(length, paren_i, paren_j) {
		if(timer.is_running()) return;
		if(paren_i === null || paren_j === null) paren_i = paren_j = -1;
		highlight(session.length() - length, length, paren_i, paren_j);
	}

	function spacebar_down(ev) {
		timer.trigger_down(ev);
	}

	function spacebar_up(ev) {
		timer.trigger_up(ev);
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

	function on_close() {
		if(config['auto_save'])
			session.save();
		localStorage.setItem("ui.config", JSON.stringify(config));
	}

	function load_colours() {
		var styles = "";
		if(config['ui_bg_colour']) {
			styles += "#left, #right, .popup { background-color: " + config['ui_bg_colour'] + ";}";
			$('ui_bg_colour').value = config['ui_bg_colour'];
		}
		if(config['ui_text_colour']) {
			styles += "body { color: " + config['ui_text_colour'] + ";}";
			$('ui_text_colour').value = config['ui_text_colour'];
		}
		if(config['ui_link_colour']) {
			styles += "a { color: " + config['ui_link_colour'] + ";}";
			$('ui_link_colour').value = config['ui_link_colour'];
		}
		if(config['ui_highlight_colour']) {
			styles += ".highlighted { background-color: " + config['ui_highlight_colour'] + ";}";
			$('ui_highlight_colour').value = config['ui_highlight_colour'];
		}
		t($('user_styles'), styles);
	}

	function change_font_size(el, delta) {
		var size = parseFloat(el.style.fontSize);
		return el.style.fontSize = (size + delta) + "em";
	}

	return {
		update_stats: update_stats,

		on_inspection: on_inspection,

		on_running: function() {
			timer_label.style.color = "";
			for(var i = 0; i < to_hide.length; i++) {
				to_hide[i].className = to_hide[i].className + " disabled";
			}
		},

		update_running: function(time) {
			t(timer_label, human_time(time));
		},

		on_stop: function() {
			t(timer_label, human_time(timer.get_time()));
			for(var i = 0; i < to_hide.length; i++) {
				to_hide[i].className = to_hide[i].className.replace("disabled", "");
			}
			next_scramble();
		},

		toggle_solve_popup: toggle_solve_popup,
		toggle_avg_popup: toggle_avg_popup,

		reset: function() {
			timer.reset();
			next_scramble();
			t(timer_label, "0.00");
			t(times_label, "&nbsp;");
			update_stats();
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

		init: function() {
			timer_label = $('timer_label');
			scramble_label = $('scramble_label');
			stats_label = $('stats_label');
			times_label = $('times_label');
			options_label = $('options_label');
			to_hide = document.getElementsByClassName("hide_running");

			$('p2').onclick = function() {
				if(timer.is_running()) return;
				session.toggle_plus_two(null);
				t(timer_label, solve_time(session.last()));
			};
			$('dnf').onclick = function() {
				if(timer.is_running()) return;
				session.toggle_dnf(null);
				t(timer_label, solve_time(session.last()));
			};

			$('c_a_5').onclick = function() {
				if(timer.is_running()) return;
				highlight_current(5, null, null);
			};
			$('b_a_5').onclick = function() {
				if(timer.is_running()) return;
				var a = session.best_average(5, true);
				highlight(a['index'], 5, a['best_single_index'], a['worst_single_index']);
			};
			$('c_a_12').onclick = function() {
				if(timer.is_running()) return;
				highlight_current(12, null, null);
			};
			$('b_a_12').onclick = function() {
				if(timer.is_running()) return;
				var a = session.best_average(12, true);
				highlight(a['index'], 12, a['best_single_index'], a['worst_single_index']);
			};
			$('s_a').onclick = function() {
				if(timer.is_running()) return;
				highlight_current(session.length(), null, null);
			};
			$('s_m').onclick = function() {
				if(timer.is_running()) return;
				highlight_current(session.length(), null, null);
			};

			$('toggle_stats').onclick = function() {
				if(timer.is_running()) return;
				toggle($('stats_link'));
				if(is_visible($('stats_link')))
					$('toggle_stats').innerHTML = "hide stats";
				else
					$('toggle_stats').innerHTML = "show stats";
			};

			$('options_label').onclick = toggle_options_popup;
			$('close_options').onclick = toggle_options_popup;
			$('gray_out').onclick = toggle_popup;
			$('scramble_menu').onchange = function() {
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
			$('load_btn').onclick = function() { session.load(); };
			$('auto_save').onchange = function() { config['auto_save'] = $('auto_save').checked; };

			$('ui_bg_colour').onchange = function() {
				config['ui_bg_colour'] = $('ui_bg_colour').value;
				load_colours();
			};
			$('ui_text_colour').onchange = function() {
				config['ui_text_colour'] = $('ui_text_colour').value;
				load_colours();
			};
			$('ui_link_colour').onchange = function() {
				config['ui_link_colour'] = $('ui_link_colour').value;
				load_colours();
			};
			$('ui_highlight_colour').onchange = function() {
				config['ui_highlight_colour'] = $('ui_highlight_colour').value;
				load_colours();
			};

			$('solve_popup_close').onclick = toggle_popup;

			scramble_manager.add_default();
			populate_scramblers_menu();

			ui.reset();

			shortcuts.init();
			shortcuts.add_key_down(shortcuts.space, { 'func': spacebar_down });
			shortcuts.add_key_up(shortcuts.space, { 'func': spacebar_up });
			shortcuts.add_key_up(shortcuts.esc, { 'func': esc_up });

			shortcuts.add_key_up('3'.charCodeAt(), { 'shift': true, 'func': function() { scramble_manager.set($('scramble_menu').selectedIndex = 0); next_scramble(); } });
			shortcuts.add_key_up('4'.charCodeAt(), { 'shift': true, 'func': function() { scramble_manager.set($('scramble_menu').selectedIndex = 1); next_scramble(); } });
			shortcuts.add_key_up('5'.charCodeAt(), { 'shift': true, 'func': function() { scramble_manager.set($('scramble_menu').selectedIndex = 2); next_scramble(); } });
			shortcuts.add_key_up('D'.charCodeAt(), { 'shift': true, 'func': function() { session.del(null); } });

			if(localStorage)
				config = JSON.parse(localStorage.getItem("ui.config"));
			if(config == null)
				config = {};

			if(config['auto_save']) {
				$('auto_save').checked = true;
				session.load();
			}
			if(config['use_inspection']) {
				$('use_inspection').checked = true;
				timer.toggle_inspection();
			}

			$('use_milli').checked = config['use_milli'];

			load_colours();

			$('ui_timer_size_inc').onclick = function() {
				config['timer_label_size'] = change_font_size(timer_label, 1);
			};

			$('ui_timer_size_dec').onclick = function() {
				config['timer_label_size'] = change_font_size(timer_label, -1);
			};

			$('ui_scramble_size_inc').onclick = function() {
				config['scramble_label_size'] = change_font_size(scramble_label, 0.1);
			};

			$('ui_scramble_size_dec').onclick = function() {
				config['scramble_label_size'] = change_font_size(scramble_label, -0.1);
			};

			timer_label.style.fontSize = config['timer_label_size'] || "10em";
			scramble_label.style.fontSize = config['scramble_label_size'] || "1em";

			window.onbeforeunload = on_close;
			window.onblur = function() { timer_label.style.color = "gray"; };
			window.onfocus = function() { timer_label.style.color = ""; };
			window.onresize = function() {
				centre($('options_popup'));
				centre($('solve_popup'));
				centre($('avg_popup'));
			}
		}
	};
})();
window['ui'] = ui;
window.onload = ui.init;
