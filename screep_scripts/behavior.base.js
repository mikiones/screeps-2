function move_action_on_target(actor, action, target) {
	if (target && actor[action](target) == ERR_NOT_IN_RANGE) {
		actor.moveTo(target);
		return true;
	}
	return false;
}

function move_transfer_on_target(actor, resource_type, target) {
	if (target && actor.transfer(target, resource_type) == ERR_NOT_IN_RANGE) {
		actor.moveTo(target);
		return true;
	}
	return false;
}

function action_when_adjacent(actor, action, target) {
	if (target) {
		if (actor.pos.getRangeTo(target) <= 1) {
			actor[action](target);
		} else {
			actor.moveTo(target);
		}
	}
}

function drop_resource_when_adjacent(actor, resource_type, target) {
	if (target) {
		if (actor.pos.getRangeTo(target) <= 1) {
			actor.drop(resource_type);
		} else {
			actor.moveTo(target);
		}
	}
}

var get_target = {
	nearest : function(actor, type, cond) {
		return actor.pos.findClosestByPath(type, { filter : cond });
	},
};

function move_action_nearest(actor, action, type, cond) {
	return move_action_on_target(actor, action, get_target.nearest(actor, type, cond));
}
function move_transfer_nearest(actor, resource_type, type, cond) {
	return move_transfer_on_target(actor, resource_type, get_target.nearest(actor, type, cond));
}

var withdraw_from = {
	nearest_container : (actor) => move_action_nearest(actor, 'withdraw', FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store.energy > 0),
	nearest_source : (actor) => move_action_nearest(actor, 'harvest', FIND_SOURCES, (struct) => true),
	nearest_dropped_energy : (actor) => move_action_nearest(actor, 'pickup', FIND_DROPPED_ENERGY, (struct) => true),
	nearest_spawn : (actor) => move_action_nearest(actor, 'withdraw', FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_SPAWN && struct.energy > 0),
};

var expend_energy_to = {
	transfer : (actor, target) => move_transfer_on_target(actor, RESOURCE_ENERGY, target),
	transfer_nearest_container : (actor) => move_transfer_nearest(actor, RESOURCE_ENERGY, FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store.energy < struct.storeCapacity),
	transfer_nearest_spawn : (actor) => move_transfer_nearest(actor, RESOURCE_ENERGY, FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_SPAWN && struct.energy < struct.energyCapacity),
	transfer_spawn_ground : (actor) => drop_resource_when_adjacent(actor, RESOURCE_ENERGY,
		get_target.nearest(actor, FIND_STRUCTURES, (struct) => struct.structureType == STRUCTURE_SPAWN)),
	build_nearest_site : (actor) => move_action_nearest(actor, 'build', FIND_CONSTRUCTION_SITES, (c) => true),
};

function chain_state_handlers(...handlers) {
	return (actor, state) => _.find(handlers, (handle) => handle(actor));
}

module.exports = {
	chain_handlers : chain_state_handlers,
	withdraw_from : withdraw_from,
	expend_to : expend_energy_to,
};
