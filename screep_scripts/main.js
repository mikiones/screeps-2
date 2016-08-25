var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var sm = require('state_machine');

module.exports.loop = function () {
	Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], _.uniqueId());
	_.forEach(Game.creeps, function(creep) {
		sm.mine_and_suicide(creep);
	});
	//var spawner = Game.spawns['Spawn1'];
	//roleSpawner.init(spawner);
	//roleSpawner.spawn_creep(spawner);
	//_.forIn(Game.creeps, function(creep, name) {
	//	roleWorker.run(spawner, creep, roleSpawner.assign_work);
	//});
};
