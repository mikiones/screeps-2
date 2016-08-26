var sm = require('state_machine');
var base = require('behavior.base');

function harvest_transfer_behavior(actor) {
	var count = _.size(actor.room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == 'harvester'}));
	if (count >= _.size(Game.creeps)) {
		return base.expend_to.transfer_nearest_spawn(actor);
	}
	return base.chain_handlers(base.expend_to.transfer_nearest_container,
		base.expend_to.transfer_nearest_spawn, base.expend_to.transfer_spawn_ground)(actor);

}

var harvest_behavior = sm.energy_tasker('harvest', base.withdraw_from.nearest_source, harvest_transfer_behavior);
var harvester_creep_type = new base.creep_type('harvester', harvest_behavior,
	[
		[WORK, WORK, CARRY, MOVE],
		[WORK, WORK, CARRY, MOVE],
		[WORK, WORK, CARRY, MOVE],
	],
	function(room, state) {
		var c = this.creep_count(room);
		if (c < room.memory.support_miners) {
			return 1.0;
		}
		return 0.0;
	}
);

module.exports = {
	harvest : harvest_behavior,
	harvester_creep : harvester_creep_type,
}
