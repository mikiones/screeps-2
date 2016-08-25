var sm = require('state_machine');
var base = require('behavior.base');

var harvest_behavior = new sm.energy_tasker('harvest',
	base.withdraw_from.nearest_source,
	function(actor, state) {
		console.log('FULL, NOTMINING');
		var containers = actor.room.find(FIND_STRUCTURES, {
			filter : (struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store.energy < struct.storeCapacity,
		});
		if (_.size(containers) > 0) {
			var target = containers[0];
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
				} else {
					if (actor.pos.getRangeTo(spawners[0]) <= 1) {
						actor.drop(RESOURCE_ENERGY);
					} else {
						actor.moveTo(spawners[0]);
					}
				}
			}
		}
	}
);

module.exports = {
	harvest : harvest_behavior,
}
