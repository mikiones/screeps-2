var sm = require('state_machine');
var base = require('behavior.base');

var builder_behavior = sm.energy_tasker('builder',
	base.chain_handlers(base.withdraw_from.non_source, base.withdraw_from.nearest_source),
	base.chain_handlers(
		base.expend_to.build_nearest_container,
		base.expend_to.build_nearest_extension,
		base.expend_to.build_nearest_site,
		base.expend_to.repair_lowest_hit_wall
	)
);
var builder_creep_type = new base.creep_type('builder', builder_behavior,
	[
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
	],
	function(room, state) {
		var c = this.creep_count(room);
		return 1 - (c / 4.0);
	}
);

var upgrader_behavior = sm.energy_tasker('upgrader',
	base.withdraw_from.non_source,
	base.expend_to.upgrade_nearest_rc
);
var upgrader_creep_type = new base.creep_type('upgrader', upgrader_behavior,
	[
		[WORK, CARRY, MOVE, MOVE, MOVE],
		[WORK, CARRY, MOVE, MOVE, MOVE],
		[WORK, CARRY, MOVE, MOVE, MOVE],
	],
	function(room, state) {
		var c = this.creep_count(room);
		return 1 - (c / 2.0);
	}
);

var spawn_filler_behavior = sm.energy_tasker('spawn_filler',
	base.chain_handlers(base.withdraw_from.nearest_dropped_energy, base.withdraw_from.nearest_container),
	base.chain_handlers(
		base.expend_to.transfer_nearest_extension,
		base.expend_to.transfer_nearest_spawn,
		base.expend_to.transfer_nearest_creep_type('upgrader'),
		base.expend_to.transfer_nearest_creep_type('repairer'),
		base.expend_to.transfer_nearest_creep_type('builder')
	)
);
var spawn_filler_creep_type = new base.creep_type('spawn_filler', spawn_filler_behavior,
	[
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
	],
	function(room, state) {
		var c = this.creep_count(room);
		return 1 - (c / 2.0);
	}
);

var repair_urgent_infrastructure = base.chain_handlers(base.expend_to.repair_urgent_lowest_hit_container, base.expend_to.repair_urgent_lowest_hit_road);
var repair_infrastructure = base.chain_handlers(base.expend_to.repair_urgent_lowest_hit_container, base.expend_to.repair_urgent_lowest_hit_road);

var repairer_behavior = sm.energy_tasker('infrastructure_repairer',
	base.withdraw_from.non_source,
	base.chain_handlers(repair_urgent_infrastructure, repair_infrastructure, base.expend_to.repair_lowest_hit_wall, base.expend_to.build_nearest_site)
);
var repairer_creep_type = new base.creep_type('infrastructure_repairer', repairer_behavior,
	[
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
	],
	function(room, state) {
		if (this.creep_count(room) < 2) {
			return 1.0;
		}
		return 0.0;
	}
);

var wall_repairer_behavior = sm.energy_tasker('wall_repairer', base.withdraw_from.non_source,
	base.chain_handlers(base.expend_to.repair_lowest_hit_wall, base.expend_to.build_nearest_wall));
var wall_repairer_creep_type = new base.creep_type('wall_repairer', wall_repairer_behavior,
	[
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
		[WORK, CARRY, CARRY, MOVE, MOVE],
	],
	function(room, state) {
		var wall_count = _.size(room.find(FIND_MY_STRUCTURES, {filter : (struct) => struct.structureType == STRUCTURE_WALL}));
		if (wall_count - this.creep_count(room) * 10 > 10) {
			return 0.7;
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
	wall_repairer_creep : wall_repairer_creep_type,
}
