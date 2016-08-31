require('extended_functionality');

var harvester_behavior = require('behavior.harvesters');
var upgrader_behavior = require('behavior.upgraders');

function cleanCreepMemory() {
	_.forEach(Memory.creeps, function(creep_mem, key) {
		if (!Game.creeps[key]) {
			Memory.creeps[key] = undefined;
		}
	});
};

module.exports.loop = function() {
	cleanCreepMemory();
	_.forEach(Game.rooms, room => room.cleanSources());
	_.forEach(_.filter(Game.creeps, {fatigue : 0}), harvester_behavior.simple);
}
