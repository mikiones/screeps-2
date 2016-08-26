var sm = require('state_machine');
var util = require('util');
var harvester = require('behavior.harvest');
var builder = require('behavior.builder');

var creep_types = [harvester.harvester_creep, builder.builder_creep, builder.upgrader_creep, builder.repairer_creep, builder.spawn_filler_creep];

function spawn(spawner, creep_type) {
	if (creep_type) {
		spawner.createCreep(creep_type.body[spawner.room.controller.level-1], creep_type.type.concat(':').concat(util.make_id()));
	}
}

function spawner_init(spawner) {
	if (spawner.memory.sources_init && spawner.memory.rc_init) {
		return;
	} else if (!spawner.memory.sources_init) {
		analyze_sources(spawner);
		spawner.memory.sources_init = true;
	} else if (!spawner.memory.rc_init) {
		analyze_rc(spawner);
		spawner.memory.rc_init = true;
	}
}

function add_construction_path(src, dst) {
	_.forEach(src.pos.findPathTo(dst.pos, {igoreCreeps : true, ignoreRoads : true}),
		(p) => src.room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD));
}

function countMiningPositions(source) {
	var objs = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
	return _.size(_.filter(objs, (obj) => obj.terrain != 'wall'))
}

function analyze_sources(spawner) {
	var sources = spawner.room.find(FIND_SOURCES);
	_.forEach(sources, (source) => add_construction_path(spawner, source));
	spawner.room.memory.support_miners = _.reduce(sources, (sum, source) => countMiningPositions(source) + sum, 0);
}

function analyze_rc(spawner) {
	add_construction_path(spawner, spawner.room.controller);
	var sources = spawner.room.find(FIND_SOURCES);
	_.forEach(sources, (source) => add_construction_path(spawner.room.controller, source));
}

var behavior = {
	run_spawner : function(spawner) {
		spawner_init(spawner);
		var to_build_type = null;
		var score = 0.0;
		_.forEach(creep_types, function(type) {
			var bp = type.build_priority(spawner, '');
			if (bp > score) {
				score = bp;
				to_build_type = type;
			}
		});
		if (score > 0.0) {
			spawn(spawner, to_build_type);
		}
	},
	run_creep : function(creep) {
		var type = creep.name.split(':')[0];
		var creep_type = _.find(creep_types, (ct) => ct.type == type);
		if (creep_type) {
			creep_type.behavior.run(creep);
		}
	},
};

module.exports = {
	behavior : behavior,
}
