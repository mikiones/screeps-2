var roleHarvester = require('role.simple_harvester');
var roleUpgrader = require('role.simple_upgrader');
var roleWorker = require('role.generic_worker');
var roleSpawner = require('role.spawner');
var util = require('util');
var tasks = require('tasks');

var test_run = false;

function new_work(creep) {
	var target_build = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
	if (target_build) {
		creep.memory.cmd = tasks.tasks.BUILD.make_cmd(target_build.id, {});
	} else {
		creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
	}
}

if (test_run) {
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
} else {
	module.exports.loop = function () {
		var spawner = Game.spawns['Spawn1'];
		if (!spawner.memory.mining_info) {
			roleSpawner.analyze_sources(spawner);
		}
		if (spawner.energy >= 300 && Object.keys(Game.creeps).length < 10) {
			if (spawner.memory.upgrader_active) {
				roleHarvester.spawn(spawner);
			} else {
				roleUpgrader.spawn(spawner);
			}
		}
		spawner.memory.upgrader_active = false;
		_.forIn(Game.creeps, function(creep, name) {
			var role = name.split(":")[0]
			if (role == "HARVESTER") {
				roleHarvester.run(creep);
			} else if (role == "UPGRADER") {
				spawner.memory.upgrader_active = true;
				roleUpgrader.run(creep);
			}
		});
	};
}
