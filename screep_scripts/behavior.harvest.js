var sm = require('state_machine');

var energy_machine = new sm.state_machine({
	'NOTFULL' : [{state_p : 'FULL', cond : (actor, state) => actor.carry.energy >= actor.carryCapacity}],
	'FULL' : [{state_p : 'NOTFULL', cond : (actor, state) => actor.carry.energy < actor.carryCapacity}],
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
		var containers = actor.room.find(FIND_STRUCTURES,
			{filter : (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store < structure.storeCapacity});
		if (_.size(containers) != 0) {
			var target = _.minBy(containers, _.flow([actor.pos.findPath, _.size]));
			if (actor.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				actor.moveTo(target);
			}
		} else {
			var spawners = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_SPAWN);
			if (_.size(spawners) == 1) {
				if (spawners[0].energy < spawners[0].energyCapacity) {
					if (actor.transfer(spawners[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						actor.moveTo(spawners[0]);
					}
				}
			}
		}
	},
});

module.exports = {
	harvest : harvest_behavior,
}
