require('extended_functionality');

var harvester_behavior = require('behavior.harvesters');
var upgrader_behavior = require('behavior.upgraders');

module.exports.loop = function() {
	_.forEach(_.filter(Game.creeps, {fatigue : 0}), upgrader_behavior.simple);
}
