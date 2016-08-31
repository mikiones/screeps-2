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

var creep_empty_energy = new (btree.builders.context_operation(function(context) {
	if (context.actor.carry && context.actor.carry.energy == 0) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

var creep_not_full_energy = new (btree.builders.context_operation(function(context) {
	if (context.actor.carry && context.actor.carry.energy < context.actor.carryCapacity) {
		return btree.SUCCESS;
	}
	return btree.FAILURE;
}));

var creep_harvest_stack = new (with_stack_value(function(context, source) {
	if (context.actor.harvest) {
		if (context.actor.harvest(source) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));

var creep_transfer_stack = new (with_stack_value(function(context, source) {
	if (context.actor.transfer) {
		if (context.actor.transfer(source, RESOURCE_ENERGY) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));

var creep_move_to_stack = new (with_stack_value(function(context, source) {
	context.actor.moveTo(source);
	return btree.SUCCESS;
}));

var creep_harvest_or_move = new btree.composites.select([creep_harvest_stack, creep_move_to_stack]);
var creep_transfer_or_move = new btree.composites.select([creep_transfer_stack, creep_move_to_stack]);
var creep_harvest_nearest_source = new btree.composites.sequence([creep_not_full_energy, push_nearest_source, creep_harvest_or_move, pop_stack]);
var creep_transfer_nearest_spawn = new btree.composites.sequence([push_nearest_spawn, creep_transfer_or_move, pop_stack]);

var miner_tree = new btree.composites.sequence([new btree.decorators.inverter(creep_harvest_nearest_source), creep_transfer_nearest_spawn]);

module.exports = {
	create_context : create_context,
	mine : miner_tree,
};
