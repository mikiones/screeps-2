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
var push_nearest_source = new (push_stack_value(get_nearest_source));
var push_nearest_spawn = new (push_stack_value(get_nearest_spawn));

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
var creep_transfer_stack = new (creep_resource_action_stack('transfer', RESOURCE_ENERGY));
var creep_move_to_stack = new (creep_action_stack('moveTo'));
var creep_succeeding_move_to_stack = new btree.decorators.always_succeed(creep_move_to_stack);

var creep_drop_energy = new (btree.builders.context_operation(function(context) {
	context.actor.drop(RESOURCE_ENERGY);
	return btree.SUCCESS;
}));

var next_to_stack = new (with_stack_value(function(context, target) {
	if (context.actor.pos.getRangeTo(target) <= 1) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

var drop_if_by_stack = new btree.composites.sequence([next_to_stack, creep_drop_energy]);
var creep_harvest_or_move = new btree.composites.select([creep_harvest_stack, creep_succeeding_move_to_stack]);
var creep_transfer_or_move = new btree.composites.select([creep_transfer_stack, drop_if_by_stack, creep_succeeding_move_to_stack]);
var creep_harvest_nearest_source = new btree.composites.sequence([creep_not_full_energy, push_nearest_source, creep_harvest_or_move, pop_stack]);
var creep_transfer_nearest_spawn = new btree.composites.sequence([push_nearest_spawn, creep_transfer_or_move, pop_stack]);

var miner_tree = new btree.composites.sequence([new btree.decorators.inverter(creep_harvest_nearest_source), creep_transfer_nearest_spawn]);

module.exports = {
	create_context : create_context,
	mine : miner_tree,
};
