function load_external(url) {
	var file = document.createElement('script');
	file.type = "text/javascript";
	file.src = url;
	document.getElementsByTagName("head")[0].appendChild(file);
} 

function $(id) { return document.getElementById(id); }
function t(e, t) { e.innerHTML = t; }
function toggle(e) { e.style.display = (e.style.display === "none") ? "" : "none"; }

var ui = function() {
	var timer_label, scramble_label, stats_label, options_label;
	var update_timer, inspection_timer, inspection_count = 15;

	function human_time(time) {
		if(time < 0) return "DNF";
		var useMilli = false;
		time = Math.round(time / (useMilli ? 1 : 10));
		var bits = time % (useMilli ? 1000 : 100);
		time = (time - bits) / (useMilli ? 1000 : 100);
		var secs = time % 60;
		var mins = ((time - secs) / 60) % 60;
		var hours = (time - secs - 60 * mins) / 3600;
		var s = "" + bits;
		if (bits < 10) {s = "0" + s;}
		if (bits < 100 && useMilli) {s = "0" + s;}
		s = secs + "." + s;
		if (secs < 10 && (mins > 0 || hours > 0)) {s = "0" + s;}
		if (mins > 0 || hours > 0) {s = mins + ":" + s;}
		if (mins < 20 && hours > 0) {s = "0" + s;}
		if (hours > 0) {s = hours + ":" + s;}
		return s;
	}

	function on_inspection() {
		t(timer_label, inspection_count);
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
		t($('b_a_5'), human_time(session.best_average(5)));
		t($('b_a_12'), human_time(session.best_average(12)));
		t($('b_a_100'), human_time(session.best_average(100)));
		t($('s_a'), human_time(session.session_average()));
		t($('s_m'), human_time(session.session_mean()));
		t(times_label, to_times_list());
	}

	function time_link(index) {
		var out = "<span onclick='ui.del("+index+")'>";
		var solve = session.solves()[index];
		if(solve['DNF'])
			out += "DNF";
		else 
			out += human_time(solve['time'] + (solve['plus_two'] ? 2000 : 0));
		return out + "</span>";
	}

	function to_times_list(hilight_index, length) {
		hilight_index = hilight_index || -1;
		length = length ||-1;

		if(session.length() < 1) return "&nbsp;"
		var out = "";
		for(var i = 0; i < session.length(); ++i)
		{
			if(i != 0) out += ", ";
			if(i === hilight_index) out += "<span class='h'>";
			out += time_link(i);
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

	return {
	key_down: function(ev) {
		timer.trigger_down();
	},

	key_up: function(ev) {
		if(ev.keyCode === 27 && !timer.is_running()) {
			ui.reset(); return;
		}
		timer.trigger_up(ev.keyCode === 32);
	},

	hilight_current: function(length)
	{
		if(timer.is_running()) return;
		t(times_label, to_times_list(session.length() - length, length));
	},

	on_inspection: on_inspection,

	on_running: function() {
		clearTimeout(inspection_timer);
		inspection_count = 15;
		update_timer = setInterval(ui.update_running, 10);
		scramble_label.className = "g";
		stats_label.className = "g";
		times_label.className = "g";
		options_label.className = "g";
	},

	update_running: function() {
		t(timer_label, human_time(timer.current_time()));
	},

	on_stop: function() {
		clearInterval(update_timer);
		t(timer_label, human_time(timer.current_time()));
		scramble_label.className = "";
		stats_label.className = "";
		times_label.className = "a";
		options_label.className = "a";
		next_scramble();
		update_stats();
	},

	
	del: function(index) {
		if(timer.is_running()) return;
		session.del(index);
		t(times_label, to_times_list());
		update_stats();
	},

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

	render_body: function() {
		var out = '<div id="centre_div">'+
              '<div id="info"></div>'+
              '<div id="timer_label">0.00</div><div class="a"><span id="p2">+2</span> <span id="dnf">DNF</span></div>'+
              '<div id="scramble_label"></div>'+
              '<div id="times_label" class="a"></div>'+
              '<div id="stats_label">'+
              'times: <span id="s_t">0</span><br />'+
              'current average: <span id="c_a_5"></span>, <span id="c_a_12"></span>, <span id="c_a_100"></span><br />'+
              'best average: <span id="b_a_5"></span>, <span id="b_a_12"></span>, <span id="b_a_100"></span><br />'+
              'session average: <span id="s_a"></span>, mean: <span id="s_m"></span></div>'+
              '<div id="options_label" class="a"><span>options</span>: </div>'+
              '<div id="options_panel" style="display: none;">'+
              '<select id="scramble_menu"></select>'+
              '<input type="input" id="plugin_url" /><input type="submit" onclick="ui.load_plugin()" value="load"/><input type="checkbox" id="use_inspection">use inspection <input type="submit" id="save_btn" value="save" /> <input type="submit" id="load_btn" value="load" /></div></div>';
		document.body.innerHTML = out;
	},

	init: function() {
		ui.render_body();

		timer_label = $('timer_label');
		scramble_label = $('scramble_label');
		stats_label = $('stats_label');
		times_label = $('times_label');
		options_label = $('options_label');

		$('p2').onclick = function() { session.toggle_plus_two(); update_stats(); };
		$('dnf').onclick = function() { session.toggle_dnf(); update_stats(); };

		$('c_a_5').onclick = function() { ui.hilight_current(5); };
		$('c_a_12').onclick = function() { ui.hilight_current(12); };
		$('s_a').onclick = function() { ui.hilight_current(session.length()); };
		$('s_m').onclick = function() { ui.hilight_current(session.length()); };

		$('options_label').onclick = function() { toggle($('options_panel')); };
		$('scramble_menu').onchange = function(s) { scramble_manager.set($('scramble_menu').selectedIndex); next_scramble(); };
		$('use_inspection').onchange = timer.toggle_inspection;
		$('load_btn').onclick = function() { session.save(); };
		$('load_btn').onclick = function() { session.load(); update_stats(); };
	
		scramble_manager.add_default();
		populate_scramblers_menu();

		ui.reset();
		
		document.onkeydown = ui.key_down;	
		document.onkeyup = ui.key_up;
	}
	};
}();
window['ui'] = ui;
window.onload = ui.init;
