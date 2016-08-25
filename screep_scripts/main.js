var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var behavior_harvest = require('behavior.harvest');
var behavior_spawner = require('behavior.spawner');

module.exports.loop = function () {
	_.forEach(Game.creeps, (creep) => behavior_harvest.harvest.run(creep));
	_.forEach(Game.spawns, (spawn) => behavior_spawner.spawner.run(spawn));
	//var spawner = Game.spawns['Spawn1'];
	//roleSpawner.init(spawner);
	//roleSpawner.spawn_creep(spawner);
	//_.forIn(Game.creeps, function(creep, name) {
	//	roleWorker.run(spawner, creep, roleSpawner.assign_work);
	//});
};
