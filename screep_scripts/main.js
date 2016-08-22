var roleHarvester = require('role.simple_harvester');
var roleUpgrader = require('role.simple_upgrader');

module.exports.loop = function () {
	if (Game.spawns['Spawn1'].energy >= 300 && Object.keys(Game.creeps).length < 10) {
		roleHarvester.spawn(Game.spawns['Spawn1']);
	}
	_.forIn(Game.creeps, function(creep, name) {
		var role = name.split(":")[0]
		if (role == "HARVESTER") {
			roleHarvester.run(creep);
		} else if (role == "UPGRADER") {
			roleUpgrader.run(creep);
		}
	});
}
