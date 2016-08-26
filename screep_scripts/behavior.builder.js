var sm = require('state_machine');
var base = require('behavior.base');

var builder_behavior = sm.energy_tasker('builder',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.expend_to.build_nearest_site
);
var builder_creep_type = new base.creep_type('builder', builder_behavior,
	[
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
	],
	function(spawner, state) {
		if (this.creep_count(spawner) < 6) {
			return 1.0;
		}
		return 0.0;
	}
);

var upgrader_behavior = sm.energy_tasker('upgrader',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.expend_to.upgrade_nearest_rc
);
var upgrader_creep_type = new base.creep_type('upgrader', upgrader_behavior,
	[
		[WORK, CARRY, MOVE, MOVE, MOVE],
		[WORK, CARRY, MOVE, MOVE, MOVE],
		[WORK, CARRY, MOVE, MOVE, MOVE],
	],
	function(spawner, state) {
		if (this.creep_count(spawner) < 2) {
			return 1.0;
		}
		return 0.0;
	}
);

var spawn_filler_behavior = sm.energy_tasker('spawn_filler',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.chain_handlers(base.expend_to.transfer_nearest_extension, base.expend_to.transfer_nearest_spawn)
);
var spawn_filler_creep_type = new base.creep_type('spawn_filler', spawn_filler_behavior,
	[
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
	],
	function(spawner, state) {
		if (this.creep_count(spawner) < 2) {
			return 1.0;
		}
		return 0.0;
	}
);

var repairer_behavior = sm.energy_tasker('container_repairer',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.chain_handlers(base.expend_to.repair_lowest_hit_container, base.expend_to.repair_lowest_hit_road, base.expend_to.repair_lowest_hit_wall)
);
var repairer_creep_type = new base.creep_type('repairer', repairer_behavior,
	[
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
	],
	function(spawner, state) {
		if (this.creep_count(spawner) < 6) {
			return 1.0;
		}
		return 0.0;
	}
);

module.exports = {
	build : builder_behavior,
	upgrade : upgrader_behavior,
	builder_creep : builder_creep_type,
	upgrader_creep : upgrader_creep_type,
	spawn_filler_creep : spawn_filler_creep_type,
	repairer_creep : repairer_creep_type,
}
