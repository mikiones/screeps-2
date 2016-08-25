function move_action_on_target(actor, action, target) {
	if (target && actor[action](target) == ERR_NOT_IN_RANGE) {
		actor.moveTo(target);
	}
};

var get_target = {
	nearest : function(actor, action, type, cond) {
		return actor.pos.findClosestByPath(type, { filter : cond });
	},
};

function move_action_nearest(actor, action, type, cond) {
	return move_action_on_target(actor, action, get_target.nearest(actor, action, type, cond));
}

var withdraw_from = {
	nearest_container : (actor) => move_action_nearest(actor, 'withdraw', FIND_STRUCTURES, (struct) => struct.store.energy > 0),
	nearest_source : (actor) => move_action_nearest(actor, 'harvest', FIND_SOURCES, (struct) => true),
	nearest_dropped_energy : (actor) => move_action_nearest(actor, 'pickup', FIND_DROPPED_ENERGY, (struct) => true),
};

var expend_energy = {
};

function chain_state_handlers(...handlers) {
	return (actor, state) => _.find(handlers, (handle) => handle(actor));
}

module.exports = {
	chain_handlers : chain_state_handlers,
	withdraw_from : withdraw_from,
};
