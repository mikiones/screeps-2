var sm = require('state_machine');

var energy_machine = new sm.state_machine({
	'NOTFULL' : [{state_p : 'FULL', cond : function(actor, state) { return actor.carry.energy >= actor.carryCapacity; } }],
	'FULL' : [{state_p : 'NOTFULL', cond : function(actor, state) { return actor.carry.energy < actor.carryCapacity; } }],
});

var harvest_behavior = new sm.behavior('harvest', energy_machine, 'NOTFULL', {
	'NOTFULL' : function(actor, state) {
		console.log('NOTFULL, MINING');
		var src = actor.pos.findClosestByPath(FIND_SOURCES);
		if (actor.harvest(src) == ERR_NOT_IN_RANGE) {
			actor.moveTo(src);
		}
	},
	'FULL' : function(actor, state) {
		console.log('FULL, NOTMINING');
		if (actor.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			actor.moveTo(Game.spawns['Spawn1']);
		}
	},
});

module.exports = {
	harvest : harvest_behavior,
}
