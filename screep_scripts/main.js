var scbt = require('screeps_behaviors');

module.exports.loop = function() {
	_.forEach(Game.spawns, function(spawn) {
		var context = scbt.create_context(spawn, Game);
		scbt.test.run(context);
	});
}
