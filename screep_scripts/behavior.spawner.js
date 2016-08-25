var sm = require('state_machine');
var util = require('util');

var creep_machine = new sm.state_machine({
	'BUILD_HARVESTER' : [{state_p : 'BUILD_BUILDER', cond : (actor, state) => actor.memory.harvesters && actor.memory.harvesters >= 8}],
	'BUILD_BUILDER' : [
		{state_p : 'RENEW_ALL', cond : (actor, state) => actor.memory.builders && actor.memory.builders >= 4},
		{state_p : 'BUILD_HARVESTER', cond : (actor, state) => actor.memory.harvesters < 8},
	],
	'RENEW_ALL' : [{state_p : 'BUILD_HARVESTER', cond : (actor, state) => actor.room.find(FIND_MY_CREEPS).length < 8}],
});

var spawner_behavior = new sm.behavior('spawner', creep_machine, 'BUILD_HARVESTER', {
	'BUILD_HARVESTER' : function(actor, state) {
		if (actor.energy >= 300) {
			var id = 'HARVESTER:'.concat(util.make_id());
			if (actor.createCreep([WORK, WORK, CARRY, MOVE], id) == OK) {
				Game.memory.creeps[id] = {};
			}
		}
		actor.memory.harvesters = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'HARVESTER'}));
		actor.memory.builders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'BUILDER'}));
	},
	'BUILD_BUILDER' : function(actor, state) {
		if (actor.energy >= 300) {
			var id = 'BUILDER:'.concat(util.make_id());
			if (actor.createCreep([WORK, CARRY, MOVE, MOVE, MOVE], id) == OK) {
				Game.memory.creeps[id] = {};
			}
		}
		actor.memory.harvesters = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'HARVESTER'}));
		actor.memory.builders = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'BUILDER'}));
	},
	'RENEW_ALL' : function(actor, state) {
		_.forEach(actor.room.find(FIND_MY_CREEPS), actor.renew);
	},
});

module.exports = {
	spawner : spawner_behavior,
}
