var btree = require('behavior_tree');

function create_context(actor, game) {
	return {actor : actor, game : game}
}

var push_stack_value = func => btree.builders.context_operation(function(context) {
	if (context.stack) {
		context.stack.push(func(context));
	} else {
		context.stack = [func(context)];
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

function get_nearest_source(context) {
	var target = context.actor.pos.findClosestByPath(FIND_SOURCES);
	return target;
}
function get_nearest_spawn(context) {
	var target = context.actor.pos.findClosestByPath(FIND_MY_SPAWNS);
	return target;
}
function get_room_controller(context) {
	var target = context.actor.room.controller;
	return target;
}
var push_nearest_source = new (push_stack_value(get_nearest_source));
var push_nearest_spawn = new (push_stack_value(get_nearest_spawn));
var push_room_controller  = new (push_stack_value(get_room_controller));

var creep_status = (func) => btree.builders.context_operation(function(context) {
	if (func(context.actor)) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});

var creep_action_stack = (action) => with_stack_value(function(context, target) {
	if (context.actor[action](target) == OK) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});

var creep_resource_action_stack = (action, resource_type) => with_stack_value(function(context, target) {
	if (context.actor[action](target, resource_type) == OK) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
});

var creep_empty_energy = new (creep_status(creep => creep.carry.energy == 0));
var creep_not_full_energy = new (creep_status(creep => creep.carry.energy < creep.carryCapacity));
var creep_harvest_stack = new (creep_action_stack('harvest'));
var creep_upgrade_stack = new (creep_action_stack('upgradeController'));
var creep_transfer_stack = new (creep_resource_action_stack('transfer', RESOURCE_ENERGY));
var creep_withdraw_stack = new (creep_resource_action_stack('withdraw', RESOURCE_ENERGY));
var creep_move_to_stack = new (creep_action_stack('moveTo'));
var creep_succeeding_move_to_stack = new btree.decorators.always_succeed(creep_move_to_stack);
var creep_drop_energy = new (btree.builders.context_operation(function(context) {
	context.actor.drop(RESOURCE_ENERGY);
	return btree.SUCCESS;
}));

var adjacent_to_stack = new (with_stack_value(function(context, target) {
	if (context.actor.pos.getRangeTo(target) <= 1) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

module.exports = {
	create_context : create_context,
	creep : {
		empty_energy : creep_empty_energy,
		not_full_energy : creep_not_full_energy,
		harvest_stack : creep_harvest_stack,
		upgrade_stack : creep_upgrade_stack,
		withdraw_stack : creep_withdraw_stack,
		transfer_stack : creep_transfer_stack,
		move_to_stack : creep_move_to_stack,
		succeeding_move_to_stack : creep_succeeding_move_to_stack,
		drop_energy : creep_drop_energy,
	},
	adjacent_to_stack : adjacent_to_stack,
	push_nearest_spawn : push_nearest_spawn,
	push_nearest_source : push_nearest_source,
	push_room_controller : push_room_controller,
	pop_stack : pop_stack,
};
