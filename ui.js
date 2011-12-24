var ui = {
	human_time: function (time) {
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
	},

	key_down: function(ev) {
		timer.key_down(ev);
	},

	key_up: function(ev) {
		if(ev.keyCode == 27 && !timer.is_running()) {
			ui.reset(); return;
		}
		timer.key_up(ev);
	},

	time_link: function(index) {
		var out = "<span onclick='ui.delete("+index+")'>";
		out += ui.human_time(session.times[index]) + "</span>";
		return out;
	},

	to_times_list: function(hilight_index, length) {
		if(session.times.length < 1) return "&nbsp;"
		var out = "";
		for(var i = 0; i < session.times.length; ++i)
		{
			if(i != 0) { out += ", "; }
			if(i == hilight_index) out += "<span class='h'>";
			out += ui.time_link(i);
			if(i == hilight_index + length) out += "</span>";
		}
		return out;
	},
	
	hilight_current: function(length)
	{
		if(timer.is_running()) return;
		t($('times_label'), ui.to_times_list(session.times.length - length, length));
	},

	next_scramble: function()
	{
		t($('scramble_label'), scrambler.current());
	},

	on_running: function() {
		$('scramble_label').className = "g";
		$('stats_label').className = "g";
		$('times_label').className = "g";
		$('options_label').className = "g";
	},

	update_running: function() {
		t($('timer_label'), ui.human_time(timer.current_time()));
	},

	on_stop: function() {
		t($('timer_label'), ui.human_time(timer.current_time()));
		$('scramble_label').className = "";
		$('stats_label').className = "";
		$('times_label').className = "a";
		$('options_label').className = "a";
		ui.next_scramble();
		ui.update_stats();
	},

	update_stats: function() {
		t($('s_t'), session.times.length);
		t($('c_a_5'), ui.human_time(session.current_average(5)));
		t($('c_a_12'), ui.human_time(session.current_average(12)));
		t($('s_a'), ui.human_time(session.session_average()));
		t($('s_m'), ui.human_time(session.session_mean()));
		t($('times_label'), ui.to_times_list());
	},

	delete: function(index) {
		if(timer.is_running()) return;
		session.del(index);
		t($('times_label'), ui.to_times_list());
		ui.update_stats();
	},

	reset: function() {
		ui.next_scramble();
		ui.update_stats();
		t($('timer_label'), "0.00");	
		t($('times_label'), "&nbsp;");
		timer.reset();
	},

	populate_scramblers_menu: function() {
		var menu = $('scramblers');
		for(var i = 0; i < scrambler.scramblers.length; i++)
		{
			menu.options[i] = new Option(scrambler.scramblers[i][0]);
		}
	},

	render_body: function() {
		var out = '<div id="centre_div">\
               <div id="timer_label">0.00</div>\
               <div id="scramble_label"></div>\
               <div id="times_label" class="a"></div>\
               <div id="stats_label">\
               times: <span id="s_t">0</span><br />\
               current average: <span id="c_a_5"></span>, <span id="c_a_12"></span><br />\
               session average: <span id="s_a"></span>, mean: <span id="s_m"></span>\
               </div>\
               <div id="options_label" class="a"><span>options</span>: </div>\
               <div id="options_panel" style="display: none;"><select id="scramblers"></select></div>\
               </div>';
		document.body.innerHTML = out;
	},

	init: function() {
		ui.render_body();

		$('c_a_5').onclick = function() { timer.hilight_current(5); };
		$('c_a_12').onclick = function() { timer.hilight_current(12); };
		$('s_a').onclick = function() { ui.hilight_current(session.times.length); };
		$('s_m').onclick = function() { ui.hilight_current(session.times.length); };

		$('options_label').onclick = function() { toggle($('options_panel')); };
		$('scramblers').onchange = function(s) { scrambler.set($('scramblers').selectedIndex); ui.next_scramble(); };
	
		scrambler.add(["3x3", scrambler.generic([["U","D"],["R","L"],["F","B"]],["","2","'"], 25)]);
		scrambler.add(["4x4", scrambler.generic([["U","D","u"],["R","L","r"],["F","B","f"]],["","2","'"], 40)]);
		scrambler.set(0);
		ui.populate_scramblers_menu();

		ui.reset();
		
		document.onkeydown = ui.key_down;	
		document.onkeyup = ui.key_up;
	}
};
window.onload = ui.init;
