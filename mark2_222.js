load("http://www.cubing.net/mark2/inc/scramblers/scramble_222.js")
scrambler.add(["2x2", function() { scramblers["222"].initialize(null, Math);
return scramblers["222"].getRandomScramble().scramble; }]);
ui.plugin_loaded("mark2_222");
