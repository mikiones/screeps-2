require('extended_functionality');

var harvester_behavior = require('behavior.harvesters');

module.exports.loop = function() {
	_.forEach(_.filter(Game.creeps, {fatigue : 0}), harvester_behavior.simple);
}
