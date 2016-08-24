var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var util = require('util');

module.exports.loop = function () {
	var spawner = Game.spawns['Spawn1'];
	roleSpawner.init(spawner);
	if (spawner.energy >= 300 && Object.keys(Game.creeps).length < max_creeps) {
		roleWorker.spawn(spawner);
	}
	_.forIn(Game.creeps, function(creep, name) {
		roleWorker.run(spawner, creep, roleSpawner.assign_work);
	});
};
