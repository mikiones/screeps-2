var roleHarvester = require('role.simple_harvester');
var roleUpgrader = require('role.simple_upgrader');
var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var util = require('util');
var tasks = require('tasks');

function new_work(creep) {
	var spawner = Game.spawns['Spawn1'];
	var active_creeps = Object.keys(Game.creeps).length;
	if (active_creeps < 3) {
		creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
	} else if (!spawner.memory.upgrader || !Game.getObjectById(spawner.memory.upgrader)) {
		spawner.memory.upgrader = creep.id;
		creep.memory.cmd = tasks.tasks.UPGRADE
	} else if (active_creeps < 7) {
		creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
	} else {
		var target_build = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (target_build) {
			creep.memory.cmd = tasks.tasks.BUILD.make_cmd(target_build.id, {});
		} else {
			creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
		}
	}
}

module.exports.loop = function () {
	var spawner = Game.spawns['Spawn1'];
	roleSpawner.init(spawner);
	if (spawner.energy >= 300 && Object.keys(Game.creeps).length < 5) {
		roleWorker.spawn(spawner);
	}
	_.forIn(Game.creeps, function(creep, name) {
		roleWorker.run(creep, new_work);
	});
};
