var sm = require('state_machine');
var util = require('util');
var harvester = require('behavior.harvest');
var builder = require('behavior.builder');

var creep_types = [harvester.harvester_creep, builder.builder_creep, builder.upgrader_creep, spawn_filler_creep];

function spawn(spawner, creep_type) {
	if (creep_type) {
		spawner.createCreep(creep_type.body[spawner.room.controller.level-1], creep_type.type.concat(':').concat(util.make_id()));
	}
}

var behavior = {
	run_spawner : function(spawner) {
		var to_build_type = null;
		var score = 0.0;
		_.forEach(creep_types, function(type) {
			var bp = type.build_priority(spawner, '');
			if (bp > score) {
				score = bp;
				to_build_type = type;
			}
		});
		spawn(spawner, to_build_type);
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
