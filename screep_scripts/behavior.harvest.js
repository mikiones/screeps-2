var sm = require('state_machine');
var base = require('behavior.base');

var harvest_behavior = sm.energy_tasker('harvest',
	base.withdraw_from.nearest_source,
	base.chain_handlers(base.expend_to.transfer_nearest_container,
		base.expend_to.transfer_nearest_spawn, base.expend_to.transfer_spawn_ground)
);
var harvester_creep_type = new base.creep_type('harvester', harvest_behavior,
	[
		[WORK, WORK, CARRY, MOVE],
		[WORK, WORK, CARRY, MOVE],
		[WORK, WORK, CARRY, MOVE],
	],
	function(spawner, state) {
		var c = this.creep_count(spawner);
		return 1 - (c / 8.0);
	}
);

module.exports = {
	harvest : harvest_behavior,
	harvester_creep : harvester_creep_type,
}
