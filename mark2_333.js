load_external("http://www.cubing.net/mark2/inc/scramblers/scramble_333.js")
scrambler.add(new scrambler_("3x3-random-state", function() { scramblers["333"].initialize(null, Math);
return scramblers["333"].getRandomScramble().scramble; }));
ui.plugin_loaded("mark2_333");
