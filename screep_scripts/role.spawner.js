var roleSpawner = {
	analyze_sources : function(spawner) {
		var mining_slots = {};
		var sources = spawner.room.find(FIND_SOURCES);
		_.forIn(sources, function(source, source_id) {
			mining_slots[source_id] = {};
			source_area = spawner.room.lookAtArea(source.pos.y+1, source.pos.x-1, source.pos.y-1, source.pos.x+1, true);
			mining_slots[source_id].slots = _.filter(source_area, (obj) => obj.type == 'terrain' && obj.terrain != 'wall').length;
			mining_slots[source_id].path_from_spawner = spawner.pos.findPathTo(source.pos, {ignoreCreeps : true, ignoreRoads : true})
		});
		spawner.memory.source_info = mining_slots;
	},
}

module.exports = roleSpawner;
