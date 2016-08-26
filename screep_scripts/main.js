var spawner = require('behavior.spawner');

module.exports.loop = function () {
	_.forEach(Game.creeps, spawner.behavior.run_creep);
	_.forEach(Game.spawns, spawner.behavior.run_spawner);
};
