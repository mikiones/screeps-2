var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var sm = require('state_machine');

module.exports.loop = function () {
	var spawner = Game.spawns['Spawn1'];
	roleSpawner.init(spawner);
	roleSpawner.spawn_creep(spawner);
	_.forIn(Game.creeps, function(creep, name) {
		roleWorker.run(spawner, creep, roleSpawner.assign_work);
	});
};
