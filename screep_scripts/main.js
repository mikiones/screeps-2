require('extended_functionality');

var scbt = require('screeps_behaviors');

module.exports.loop = function() {
	_.forEach(Game.creeps, function(creep) {
		var context = scbt.create_context(creep, Game);
		scbt.mine.run(context);
	});
}
