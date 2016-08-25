var sm = require('state_machine');
var base = require('behavior.base');

var builder_behavior = new sm.energy_tasker('builder',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.expend_to.build_nearest_site
);

module.exports = {
	build : builder_behavior,
}
