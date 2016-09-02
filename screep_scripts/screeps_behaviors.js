var btree = require('behavior_tree');

function create_context(actor, game) {
	return {actor : actor, game : game, stack : []}
}

var push_stack_value = func => btree.builders.context_operation(function(context) {
	var val = func(context);
	if (val == null) {
		return btree.FAILURE;
	}
	if (context.stack) {
		context.stack.push(val);
	} else {
		context.stack = [val];
	}
	return btree.SUCCESS;
});

var with_stack_value = func => btree.builders.context_operation(function(context) {
	if (context.stack && context.stack.length > 0) {
		return func(context, context.stack[context.stack.length-1]);
	}
	return btree.FAILURE;
});

var with_pop_stack_value = func => btree.builders.context_operation(function(context) {
	if (context.stack && context.stack.length > 0) {
		return func(context, context.stack.pop());
	}
	return btree.FAILURE;
});

var pop_stack = new (btree.builders.context_operation(function(context) {
	if (context.stack && context.stack.length > 0) {
		context.stack.pop();
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

var save_memory_key = (key, func) => btree.builders.context_operation(function(context) {
	var res = func(context);
	if (res) {
		context.actor.memory[key] = res;
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});

var clear_memory_key = (key) => btree.builders.context_operation(function(context) {
	context.actor.memory[key] = null;
	return btree.SUCCESS;
});

var push_func_on_memory_key = (key, func) => btree.builders.context_operation(function(context) {
	if (context.actor.memory[key]) {
		var val = func(context.actor.memory[key]);
		if (val) {
			context.stack.push(val);
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
});

var get_nearest = (type, filter = null) => function(context) {
	var target;
	if (filter == null) {
		target = context.actor.pos.findClosestByPath(type);
	} else {
		target = context.actor.pos.findClosestByPath(type, {filter : filter});
	}
	return target;
}

var get_nearest_source = get_nearest(FIND_SOURCES);
var get_nearest_spawn = get_nearest(FIND_MY_SPAWNS);
var get_nearest_dropped_energy = get_nearest(FIND_DROPPED_ENERGY);
function get_room_controller(context) {
	var target = context.actor.room.controller;
	return target;
}

var push_nearest_source = new (push_stack_value(get_nearest_source));
var push_nearest_spawn = new (push_stack_value(get_nearest_spawn));
var push_room_controller = new (push_stack_value(get_room_controller));
var push_nearest_dropped_energy = new (push_stack_value(get_nearest_dropped_energy));

var actor_status = (func) => btree.builders.context_operation(function(context) {
	if (func(context.actor)) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});

var actor_action_stack = (action) => with_stack_value(function(context, target) {
	if (context.actor[action](target) == OK) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});
var actor_action_key = (key, action) => btree.builders.context_operation(function(context) {
	if (context.actor.memory[key]) {
		var target = Game.getObjectById(context.actor.memory[key]);
		if (target && context.actor[action](target) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
});
var actor_action_target = _.partial(actor_action_key, 'target');
var actor_resource_action_stack = (action, resource_type) => with_stack_value(function(context, target) {
	if (context.actor[action](target, resource_type) == OK) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});
var actor_resource_action_key = (key, action, resource_type) => btree.builders.context_operation(function(context) {
	if (context.actor.memory[key]) {
		var target = Game.getObjectById(context.actor.memory[key]);
		if (context.actor[action](target, resource_type) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
});
var actor_resource_action_target = _.partial(actor_resource_action_key, 'target');

var creep_empty_energy = new (actor_status(creep => creep.carry.energy == 0));
var creep_not_full_energy = new (actor_status(creep => creep.carry.energy < creep.carryCapacity));
var creep_has_target = new (actor_status(creep => creep.memory.target != undefined && Game.getObjectById(creep.memory.target)));
var creep_harvest_stack = new (actor_action_stack('harvest'));
var creep_pickup_stack = new (actor_action_stack('pickup'));
var creep_upgrade_stack = new (actor_action_stack('upgradeController'));
var creep_transfer_stack = new (actor_resource_action_stack('transfer', RESOURCE_ENERGY));
var creep_withdraw_stack = new (actor_resource_action_stack('withdraw', RESOURCE_ENERGY));
var creep_move_to_stack = new (actor_action_stack('moveTo'));
var creep_succeeding_move_to_stack = new btree.decorators.always_succeed(creep_move_to_stack);

var creep_harvest_target = new (actor_action_target('harvest'));
var creep_harvest_key = key => new (actor_action_key(key, 'harvest'));
var creep_upgrade_target = new (actor_action_target('upgradeController'));
var creep_build_target = new (actor_action_target('build'));
var creep_transfer_target = new (actor_resource_action_target('transfer', RESOURCE_ENERGY));
var creep_transfer_key = key => new (actor_resource_action_key(key, 'transfer', RESOURCE_ENERGY));
var creep_withdraw_target = new (actor_resource_action_target('withdraw', RESOURCE_ENERGY));
var creep_pickup_target = new (actor_action_target('pickup'));
var creep_move_to_target = new (actor_action_target('moveTo'));
var creep_move_to_key = key => new (actor_action_key(key, 'moveTo'));
var creep_succeeding_move_to_target = new btree.decorators.always_succeed(creep_move_to_target);
var creep_succeeding_move_to_key = key => new btree.decorators.always_succeed(creep_move_to_key(key));

var creep_drop_energy = new (btree.builders.context_operation(function(context) {
	context.actor.drop(RESOURCE_ENERGY);
	return btree.SUCCESS;
}));

var pop_stack_id_to_key = (key) => with_pop_stack_value(function(context, target) {
	if (target && target.id) {
		context.actor.memory[key] = target.id;
		btree.SUCCESS;
	}
	btree.FAILURE;
});

var adjacent_to_stack = new (with_stack_value(function(context, target) {
	if (context.actor.pos.inRangeTo(target, 1)) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

var get_nearest_nonfull_container = get_nearest(FIND_STRUCTURES, function(struct) {
	return struct.structureType == STRUCTURE_CONTAINER && struct.store.energy < struct.storeCapacity;
});

function get_nearest_nonempty_container(context) {
	var target = context.actor.pos.findClosestByPath(FIND_STRUCTURES, {filter : function(struct) {
		return struct.structureType == STRUCTURE_CONTAINER && struct.store.energy > 50;
	}});
	if (target) {
		return target.id;
	}
	return null;
};

var set_nearest_nonfull_container_target = new (save_memory_key('container_target', get_nearest_nonfull_container));
var set_nearest_nonempty_container_target = new (save_memory_key('container_target', get_nearest_nonempty_container));

var key_is_object_id = (key) => actor_status(function(actor) {
	return actor.memory[key] && Game.getObjectById(actor.memory[key]);
});

var needs_new_nonfull_container_store_target = new (actor_status(function(creep) {
	if (!creep.memory.container_target) {
		return true;
	}
	var target = Game.getObjectById(creep.memory.container_target);
	return !target || !target.structureType || target.structureType != STRUCTURE_CONTAINER || target.store.energy >= target.storeCapacity;
}));
var needs_new_nonempty_container_store_target = new (actor_status(function(creep) {
	if (!creep.memory.container_target) {
		return true;
	}
	var target = Game.getObjectById(creep.memory.container_target);
	return !target || !target.structureType || target.structureType != STRUCTURE_CONTAINER || target.store.energy <= 0;
}));

var set_nonfull_container_target = new btree.composites.sequence(
	[new btree.decorators.always_succeed(needs_new_nonfull_container_store_target), set_nearest_nonfull_container_target]);
var set_nonempty_container_target = new btree.composites.sequence(
	[new btree.decorators.always_succeed(needs_new_nonempty_container_store_target), set_nearest_nonempty_container_target]);

var move_to_container_target = new (btree.builders.context_operation(function(context) {
	if (context.actor.memory.container_target) {
		var target = Game.getObjectById(context.actor.memory.container_target);
		if (context.actor.moveTo(target) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));

var withdraw_container_target = new (actor_resource_action_key('target', 'withdraw', RESOURCE_ENERGY));

var withdraw_or_move_to_container = new btree.composites.select(
	[withdraw_container_target, new btree.decorators.always_succeed(move_to_container_target)]);

var withdraw_from_container = new btree.composites.sequence(
	[set_nonempty_container_target, new btree.decorators.inverter(needs_new_nonempty_container_store_target), withdraw_or_move_to_container]);

var withdraw_or_move = new btree.composites.select(
	[creep_withdraw_stack, creep_succeeding_move_to_stack]);

var withdraw_nearest_spawn = new btree.composites.sequence(
	[push_nearest_spawn, withdraw_or_move, pop_stack]);

var pickup_or_move = new btree.composites.select(
	[creep_pickup_stack, creep_succeeding_move_to_stack]);

var pickup_nearest_dropped_energy = new btree.composites.sequence(
	[push_nearest_dropped_energy, pickup_or_move, pop_stack]);

var collect_energy_from = new btree.composites.select(
	[pickup_nearest_dropped_energy, withdraw_from_container, withdraw_nearest_spawn]);

var collect_energy = new btree.composites.sequence(
	[creep_empty_energy, collect_energy_from]);

var nonharvest_get_energy = new btree.composites.sequence(
	[creep_empty_energy, collect_energy]);

module.exports = {
	create_context : create_context,
	creep : {
		empty_energy : creep_empty_energy,
		not_full_energy : creep_not_full_energy,
		has_target : creep_has_target,
		harvest_stack : creep_harvest_stack,
		pickup_stack : creep_pickup_stack,
		upgrade_stack : creep_upgrade_stack,
		withdraw_stack : creep_withdraw_stack,
		transfer_stack : creep_transfer_stack,
		move_to_stack : creep_move_to_stack,
		succeeding_move_to_stack : creep_succeeding_move_to_stack,
		harvest_target : creep_harvest_target,
		harvest_key : creep_harvest_key,
		upgrade_target : creep_upgrade_target,
		build_target : creep_build_target,
		withdraw_target : creep_withdraw_target,
		pickup_target : creep_pickup_target,
		transfer_target : creep_transfer_target,
		transfer_key : creep_transfer_key,
		move_to_target : creep_move_to_target,
		move_to_key: creep_move_to_key,
		succeeding_move_to_target : creep_succeeding_move_to_target,
		succeeding_move_to_key: creep_succeeding_move_to_key,
		drop_energy : creep_drop_energy,
		withdraw_from_container: withdraw_from_container,
		nonharvest_get_energy : nonharvest_get_energy,
	},
	room : {
	},
	actor_status : actor_status,
	adjacent_to_stack : adjacent_to_stack,
	save_memory_key : save_memory_key,
	clear_memory_key : clear_memory_key,
	push_func_on_memory_key : push_func_on_memory_key,
	with_stack_value : with_stack_value,
	with_pop_stack_value : with_stack_value,
	push_nearest_spawn : push_nearest_spawn,
	push_nearest_source : push_nearest_source,
	push_nearest_dropped_energy : push_nearest_dropped_energy,
	push_room_controller : push_room_controller,
	push_stack_value : push_stack_value,
	pop_stack : pop_stack,
	set_nonfull_container_target : set_nonfull_container_target,
	needs_new_nonfull_container_store_target : needs_new_nonfull_container_store_target,
	get_nearest_nonfull_container : get_nearest_nonfull_container,
	move_to_container_target : move_to_container_target,
	pop_stack_id_to_key : pop_stack_id_to_key,
	key_is_object_id : key_is_object_id,
};
