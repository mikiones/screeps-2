var roleHarvester = require('role.simple_harvester');
var roleUpgrader = require('role.simple_upgrader');

module.exports.loop = function () {
	if (Game.spawns['Spawn1'].energy >= 300 && Object.keys(Game.creeps).length < 10) {
		roleHarvester.spawn(Game.spawns['Spawn1']);
	}
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		roleHarvester.run(creep);
	}
}
