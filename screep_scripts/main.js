var roleHarvester = require('role.simple_harvester');
var roleUpgrader = require('role.simple_upgrader');
var util = require('util');

module.exports.loop = function () {
	if (Game.spawns['Spawn1'].energy >= 300 && Object.keys(Game.creeps).length < 10) {
		if (Game.spawns['Spawn1'].memory.upgrader_active) {
			roleHarvester.spawn(Game.spawns['Spawn1']);
		} else {
			roleUpgrader.spawn(Game.spawns['Spawn1']);
		}
	}
	Game.spawns['Spawn1'].memory.upgrader_active = false;
	_.forIn(Game.creeps, function(creep, name) {
		var role = name.split(":")[0]
		if (role == "HARVESTER") {
			roleHarvester.run(creep);
		} else if (role == "UPGRADER") {
			Game.spawns['Spawn1'].memory.upgrader_active = true;
			roleUpgrader.run(creep);
		}
	});
}
