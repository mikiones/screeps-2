var tasks = require('tasks');
var roleWorker = require('role.generic_worker');

var min_creeps = 7;
var max_creeps = 15;

var ASSIGNED = 'ASSIGNED';
var UNASSIGNED = 'UNASSIGNED';
var SPAWN_MODE = 'SPAWN_MODE';
var UPGRADE_MODE = 'UPGRADE_MODE';
var NORMAL_MODE = 'NORMAL_MODE';

var roleSpawner = {
	init : function(spawner) {
		if (spawner.memory.sources_init && spawner.memory.rc_init) {
			return;
		} else if (!spawner.memory.sources_init) {
			roleSpawner.analyze_sources(spawner);
			spawner.memory.sources_init = true;
		} else if (!spawner.memory.rc_init) {
			roleSpawner.analyze_rc(spawner);
			spawner.memory.rc_init = true;
		} else if (!spawner.memory.tasks_init) {
			roleSpawner.initialize_tasks(spawner);
			spawner.memory.tasks_init = true;
			spawner.memory.task_mode = SPAWN_MODE;
		}
	},
	add_construction_path : function(src, dst) {
		var path = src.pos.findPathTo(dst.pos, {ignoreCreeps : true, ignoreRoads : true});
		_.forIn(path, function(loc, step) {
			src.room.createConstructionSite(loc.x, loc.y, STRUCTURE_ROAD);
		});
	},
	analyze_sources : function(spawner) {
		var mining_slots = {};
		var sources = spawner.room.find(FIND_SOURCES);
		_.forIn(sources, function(source, source_id) {
			mining_slots[source_id] = {};
			var source_area = spawner.room.lookAtArea(source.pos.y+1, source.pos.x-1, source.pos.y-1, source.pos.x+1, true);
			mining_slots[source_id].slots = _.filter(source_area, (obj) => obj.type == 'terrain' && obj.terrain != 'wall').length;
			roleSpawner.add_construction_path(spawner, source);
		});
		spawner.memory.source_info = mining_slots;
	},
	analyze_rc : function(spawner) {
		roleSpawner.add_construction_path(spawner, spawner.room.controller);
		//var sources = spawner.room.find(FIND_SOURCES);
		//_.forIn(sources, function(source, source_id) {
		//	roleSpawner.add_construction_path(spawner.room.controller, source);
		//});
	},
	initialize_tasks : function(spawner) {
		spawner.memory.task_list = {}; // {target_id : [{cmd, args, status}]
		spawner.memory.task_mode = SPAWN_MODE;
	},
	assign_work : function(spawner, creep) {
		var active_creeps = Object.keys(Game.creeps).length;
		if (active_creeps < min_creeps/2) {
			creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
		} else if (!spawner.memory.upgrader || !Game.getObjectById(spawner.memory.upgrader) || creep.id == spawner.memory.upgrader) {
			spawner.memory.upgrader = creep.id;
			creep.memory.cmd = tasks.tasks.UPGRADE.make_cmd(creep.room.controller.id, {});
		} else if (active_creeps < min_creeps) {
			creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
		} else {
			var target_build = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
			if (target_build) {
				creep.memory.cmd = tasks.tasks.BUILD.make_cmd(target_build.id, {});
			} else {
				creep.memory.cmd = tasks.tasks.UPGRADE.make_cmd(creep.room.controller.id, {});
			}
		}
	},
	energy_deficit : function(spawner) {
		var deficit = spawner.energyCapacity - spawner.energy;
		var extensions = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_EXTENSION);
		for(var ext in extensions) {
			deficit += ext.energyCapacity - ext.energy;
		}
	},
	assign_work_2 : function(spawner, creep) {
		if (spawner.memory.task_mode == SPAWN_MODE) {
			var next_cmd = [];
			if (spawner.energy < spawner.energyCapacity) {
				next_cmd.push(tasks.tasks.FILL.make_cmd(spawner.id, {store_type : 'energy'}));
			}
			var extensions = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_EXTENSION);
			for(var ext in extensions) {
				if (ext.energy < ext.energyCapacity) {
					next_cmd.push(tasks.tasks.FILL.make_cmd(ext.id, {store_type : 'energy'}));
				}
			}
			if (next_cmd.length == 0) {
				creep.memory.cmd = tasks.tasks.FILL.make_cmd(spawner.id, {store_type : 'energy'});
			} else {
				creep.memory.cmd = util.choice(next_cmd);
			}
		} else if (spawner.memory.task_mode == UPGRADE_MODE) {
		}
	},
	spawn_creep : function(spawner) {
		if (spawner.energy >= 300 && Object.keys(Game.creeps).length < max_creeps) {
			roleWorker.spawn(spawner);
		}
	},
	spawn_creep_2 : function(spawner) {
		var deficit_energy = roleSpawner.energy_deficit(spawner);
		if (deficit_energy <= 0 && Object.keys(Game.creeps).length < max_creeps) {
			roleWorker.spawn(spawner);
		}
	},
}

module.exports = roleSpawner;
