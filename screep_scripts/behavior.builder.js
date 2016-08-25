var sm = require('state_machine');

var builder_behavior = new sm.energy_tasker('builder',
	function(actor, state) {
		var containers = actor.room.find(FIND_STRUCTURES);
		if (_.size(containers) > 0) {
		} else {
			//Scavenge
			var droppedEnergy = actor.room.find(FIND_DROPPED_ENERGY);
			var target = _.minBy(droppedEnergy, _.flow([actor.pos.findPath, _.size]));
			if (actor.pickup(target) == ERR_NOT_IN_RANGE) {
				actor.moveTo(target);
			}
		}
	},
	function(actor, state) {
		var target_build = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (target_build && actor.build(target_build) == ERR_NOT_IN_RANGE) {
			actor.moveTo(target_build);
		}
	}
);

module.exports = {
	build : builder_behavior,
}
