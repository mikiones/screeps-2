var sm = require('state_machine');
var base = require('behavior.base');

var builder_behavior = new sm.energy_tasker('builder',
	base.chain_handlers([base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container]),
	function(actor, state) {
		var target_build = actor.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (target_build && actor.build(target_build) == ERR_NOT_IN_RANGE) {
			actor.moveTo(target_build);
		}
	}
);

module.exports = {
	build : builder_behavior,
}
