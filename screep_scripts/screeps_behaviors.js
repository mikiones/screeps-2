var btree = require('behavior_tree');

function create_context(actor, game) {
	return {actor : actor, game : game}
}

var push_stack_value = func => btree.builders.context_operation((context) => {
	if (context.stack) {
		context.stack.push(func(context));
	} else {
		context.stack = [func(context)];
	}
	return btree.SUCCESS;
});

var with_stack_value = func => btree.builders.context_operation((context) => {
	if (context.stack && context.stack.length > 0) {
		return func(context, context.stack[context.stack.length-1]);
	}
	return btree.FAILURE;
});

var pop_stack_value = func => btree.builders.context_operation((context) => {
	if (context.stack && context.stack.length > 0) {
		return func(context, context.stack.pop());
	}
	return btree.FAILURE;
});

function get_nearest_source(context) {
	var target = context.actor.pos.findClosestByPath(FIND_SOURCES);
	return target;
}

var push_nearest_source = new (push_stack_value(get_nearest_source));

var push_path_to_nearest_source = new (with_stack_value(function(context, source) {
	var path = context.actor.pos.findPathTo(source.pos);
}));

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

var creep_harvest_source = new (with_stack_value(function(context, source) {
	if (context.actor.harvest) {
		if (context.actor.harvest(source) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));

var creep_move_to = new (with_stack_value(function(context, source) {
	context.actor.moveTo(source);
	return btree.FAILURE;
}));

var creep_harvest = new btree.composites.select([creep_harvest_source, creep_move_to]);
var creep_mine = new btree.composites.sequence([push_nearest_source, creep_not_full_energy, creep_harvest]);


module.exports = {
	create_context : create_context,
	mine : creep_mine,
};
