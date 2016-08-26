var sm = require('state_machine');
var util = require('util');
var harvester = require('behavior.harvest');
var builder = require('behavior.builder');

var creep_types = [harvester.harvester_creep, builder.builder_creep, builder.upgrader_creep];

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
			creep_type.behavior(creep);
		}
	},
};

//var creep_machine = new sm.state_machine({
//	'BUILD_HARVESTER' : [{state_p : 'BUILD_UPGRADER', cond : (actor, state) => actor.memory.harvesters && actor.memory.harvesters >= 8}],
//	'BUILD_UPGRADER' : [{state_p : 'BUILD_BUILDER', cond : (actor, state) => actor.memory.upgraders && actor.memory.upgraders >= 1}],
//	'BUILD_BUILDER' : [
//		{state_p : 'RENEW_ALL', cond : (actor, state) => actor.memory.builders && actor.memory.builders >= 4},
//		{state_p : 'BUILD_HARVESTER', cond : (actor, state) => actor.memory.harvesters < 8},
//	],
//	'RENEW_ALL' : [{state_p : 'BUILD_HARVESTER', cond : (actor, state) => actor.room.find(FIND_MY_CREEPS).length < 8}],
//});
//
//var spawner_behavior = new sm.behavior('spawner', creep_machine, 'BUILD_HARVESTER', {
//	'BUILD_HARVESTER' : function(actor, state) {
//		if (actor.energy >= 300) {
//			var id = 'HARVESTER:'.concat(util.make_id());
//			if (actor.createCreep([WORK, WORK, CARRY, MOVE], id) == OK) {
//				Game.memory.creeps[id] = {};
//			}
//		}
//		actor.memory.harvesters = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'HARVESTER'}));
//		actor.memory.builders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'BUILDER'}));
//		actor.memory.upgraders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'UPGRADER'}));
//	},
//	'BUILD_UPGRADER' : function(actor, state) {
//		if (actor.energy >= 300) {
//			var id = 'UPGRADER:'.concat(util.make_id());
//			if (actor.createCreep([WORK, CARRY, MOVE, MOVE, MOVE], id) == OK) {
//				Game.memory.creeps[id] = {};
//			}
//		}
//		actor.memory.harvesters = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'HARVESTER'}));
//		actor.memory.builders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'BUILDER'}));
//		actor.memory.upgraders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'UPGRADER'}));
//	},
//	'BUILD_BUILDER' : function(actor, state) {
//		if (actor.energy >= 300) {
//			var id = 'BUILDER:'.concat(util.make_id());
//			if (actor.createCreep([WORK, CARRY, MOVE, MOVE, MOVE], id) == OK) {
//				Game.memory.creeps[id] = {};
//			}
//		}
//		actor.memory.harvesters = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'HARVESTER'}));
//		actor.memory.builders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'BUILDER'}));
//		actor.memory.upgraders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'UPGRADER'}));
//	},
//	'RENEW_ALL' : function(actor, state) {
//		_.forEach(actor.room.find(FIND_MY_CREEPS), actor.renew);
//	},
//});

module.exports = {
	behavior : behavior,
}
