var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var behavior_harvest = require('behavior.harvest');

module.exports.loop = function () {
	Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], _.uniqueId());
	_.forEach(Game.creeps, function(creep) {
		behavior_harvest.harvest.run(creep);
	});
	//var spawner = Game.spawns['Spawn1'];
	//roleSpawner.init(spawner);
	//roleSpawner.spawn_creep(spawner);
	//_.forIn(Game.creeps, function(creep, name) {
	//	roleWorker.run(spawner, creep, roleSpawner.assign_work);
	//});
};
