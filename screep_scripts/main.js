var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var behavior_harvest = require('behavior.harvest');
var behavior_builder = require('behavior.builder');
var behavior_spawner = require('behavior.spawner');

var behaviors = {
	'BUILDER' : behavior_builder.build,
	'HARVESTER' : behavior_harvest.harvest,
};

function run(creep) {
	var type = creep.name.split(':');
	behaviors[type].run(creep);
}

module.exports.loop = function () {
	_.forEach(Game.creeps, run);
	_.forEach(Game.spawns, (spawn) => behavior_spawner.spawner.run(spawn));
	//var spawner = Game.spawns['Spawn1'];
	//roleSpawner.init(spawner);
	//roleSpawner.spawn_creep(spawner);
	//_.forIn(Game.creeps, function(creep, name) {
	//	roleWorker.run(spawner, creep, roleSpawner.assign_work);
	//});
};
