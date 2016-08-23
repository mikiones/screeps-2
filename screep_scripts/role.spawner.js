var roleSpawner = {
	init : function(spawner) {
		if (spawner.memory.init) {
			return;
		}
		roleSpawner.analyze_sources(spawner);
		roleSpawner.analyze_rc(spawner);
		spawner.memory.init = true;
	},
	analyze_sources : function(spawner) {
		var mining_slots = {};
		var sources = spawner.room.find(FIND_SOURCES);
		_.forIn(sources, function(source, source_id) {
			mining_slots[source_id] = {};
			var source_area = spawner.room.lookAtArea(source.pos.y+1, source.pos.x-1, source.pos.y-1, source.pos.x+1, true);
			mining_slots[source_id].slots = _.filter(source_area, (obj) => obj.type == 'terrain' && obj.terrain != 'wall').length;
			mining_slots[source_id].path_from_spawner = spawner.pos.findPathTo(source.pos, {ignoreCreeps : true, ignoreRoads : true});
			_.forIn(mining_slots[source_id].path_from_spawner, function(loc, step) {
				spawner.room.createConstructionSite(loc.x, loc.y, STRUCTURE_ROAD);
			});
		});
		spawner.memory.source_info = mining_slots;
	},
	analyze_rc : function(spawner) {
		var rc_slot = {};
		rc_slot.path_from_spawner = spawner.pos.findPathTo(spawner.room.controller.pos, {ignoreCreeps : true, ignoreRoads : true});
		_.forIn(rc_slot.path_from_spawner, function(loc, step) {
			spawner.room.createConstructionSite(loc.x, loc.y, STRUCTURE_ROAD);
		});
	},
}

module.exports = roleSpawner;
