load_external("http://www.cubing.net/mark2-test/inc/raphael-min.js")
load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_222.js")
scramble_manager.add(new scrambler("2x2", function() { scramblers["222"].initialize(null, Math);
var s =scramblers["222"].getRandomScramble(); 
t($('info'), "");
scramblers["222"].drawScramble($('info'), s.state, 100, 80);
return s.scramble;
}, function(){}, function(){t($('info'), "");}));
ui.plugin_loaded("mark2_222");

