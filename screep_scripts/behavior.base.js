function move_action_on_target(actor, action, target) {
	if (actor[action](target) == ERR_NOT_IN_RANGE) {
		actor.moveTo(target);
	}
};

var withdraw_from = {
	nearest : function(actor, action, type, cond) {
		var target = actor.pos.findClosestByPath(type, { filter : cond });
		if (target) {
			move_action_on_target(actor, action, target);
			return true;
		}
		return false;
	},
	nearest_container : (actor) => withdraw_from.nearest(actor, 'withdraw', FIND_STRUCTURES, (struct) => struct.store.energy > 0),
	nearest_source : (actor) => withdraw_from.nearest(actor, 'harvest', FIND_SOURCES, (struct) => true),
	nearest_dropped_energy : (actor) => withdraw_from.nearest(actor, 'pickup', FIND_DROPPED_ENERGY, (struct) => true),
};

function chain_state_handlers(...handlers) {
	return (actor, state) => _.find(handlers, (handle) => handle(actor));
}

module.exports = {
	chain_handlers : chain_state_handlers,
	withdraw_from : withdraw_from,
};
