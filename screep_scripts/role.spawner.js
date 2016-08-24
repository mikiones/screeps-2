var min_creeps = 7;
var max_creeps = 15;

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
	assign_work : function(spawner, creep) {
		var active_creeps = Object.keys(Game.creeps).length;
		if (active_creeps < min_creeps/2) {
			creep.memory.cmd = tasks.tasks.FILL.make_cmd(Game.spawns['Spawn1'].id, {store_type : 'energy'});
		} else if (!spawner.memory.upgrader || !Game.getObjectById(spawner.memory.upgrader)) {
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
}

module.exports = roleSpawner;
