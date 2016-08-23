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
}

module.exports = roleSpawner;
