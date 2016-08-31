require('extended_functionality');

var harvester_behavior = require('behavior.harvesters');

module.exports.loop = function() {
	_.forEach(Game.creeps, harvester_behavior.simple);
}
