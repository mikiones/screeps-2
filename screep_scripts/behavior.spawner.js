var sm = require('state_machine');
var util = require('util');

var creep_machine = new sm.state_machine({
	'BUILD_HARVESTER' : [{state_p : 'RENEW_ALL', cond : (actor, state) => actor.room.find(FIND_MY_CREEPS).length > 7}],
	'RENEW_ALL' : [{state_p : 'BUILD_HARVESTER', cond : (actor, state) => actor.room.find(FIND_MY_CREEPS). length <= 7}],
});

var spawner_behavior = new sm.behavior('spawner', creep_machine, 'BUILD_HARVESTER', {
	'BUILD_HARVESTER' : function(actor, state) {
		if (actor.energy >= 200) {
			var id = 'HARVESTER'.concat(util.make_id());
			if (actor.createCreep([WORK, CARRY, MOVE], id))) == OK) {
				Game.memory.creeps[id] = {};
			}
		}
	},
	'RENEW_ALL' : function(actor, state) {
		_.forEach(actor.room.find(FIND_MY_CREEPS), actor.renew);
	},
});

module.exports = {
	spawner : spawner_behavior,
}
