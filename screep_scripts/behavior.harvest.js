var sm = require('state_machine');
var base = require('behavior.base');

var harvest_behavior = sm.energy_tasker('harvest',
	base.withdraw_from.nearest_source,
	base.chain_handlers(base.expend_to.transfer_nearest_container,
		base.expend_to.transfer_nearest_spawn, base.expend_to.transfer_spawn_ground)
);

module.exports = {
	harvest : harvest_behavior,
}
