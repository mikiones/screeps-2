var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

function get_most_empty_source(context) {
	var sources = context.actor.room.find(FIND_SOURCES);
	var lowest = -1000;
	var target = null;
	_.forEach(sources, function(source) {
		var ap = source.availablePositions();
		if (ap > lowest) {
			lowest = ap;
			target = source;
		}
	});
	return target;
};

function get_nearest_nonempty_container(context) {
	var target = context.actor.pos.findClosestByPath(FIND_STRUCTURES, {filter : function(struct) {
		return struct.structureType == STRUCTURE_CONTAINER && struct.store.energy < struct.storeCapacity;
	}});
	if (target) {
		return target.id;
	}
	return null;
};

var set_nearest_nonempty_container_container_target = new (sbehave.save_memory_key('container_target', get_nearest_nonempty_container));
var needs_new_container_target = new (sbehave.actor_status(function(creep) {
	if (!creep.memory.container_target) {
		return true;
	}
	var target = Game.getObjectById(creep.memory.container_target);
	return !target || !target.structureType || target.structureType != STRUCTURE_CONTAINER || target.store.energy >= target.storeCapacity;
}));
var transfer_container_target = new (btree.builders.context_operation(function(context) {
	if (context.actor.memory.container_target) {
		var target = Game.getObjectById(context.actor.memory.container_target);
		if (context.actor.transfer(target, RESOURCE_ENERGY) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));
var move_to_container_target = new (btree.builders.context_operation(function(context) {
	if (context.actor.memory.container_target) {
		var target = Game.getObjectById(context.actor.memory.container_target);
		if (context.actor.moveTo(target) == OK) {
			return btree.SUCCESS;
		}
	}
	return btree.FAILURE;
}));
var set_container_target = new btree.composites.sequence(
	[new btree.decorators.always_succeed(needs_new_container_target), set_nearest_nonempty_container_container_target]);
var transfer_or_move_to_container = new btree.composites.select(
	[transfer_container_target, new btree.decorators.always_succeed(move_to_container_target)]);
var transfer_to_container = new btree.composites.sequence(
	[set_container_target, new btree.decorators.inverter(needs_new_container_target), transfer_or_move_to_container]);

var register_harvester_stack = new (sbehave.with_stack_value(function(context, target) {
	target.registerHarvester(context.actor);
	return btree.SUCCESS;
}));

var push_most_empty_source = new (sbehave.push_stack_value(get_most_empty_source));

var target_most_empty_source = new btree.composites.sequence(
	[new btree.decorators.inverter(sbehave.creep.has_target),
	push_most_empty_source,
	register_harvester_stack,
	sbehave.pop_stack_to_target_memory]);

var drop_if_by_stack = new btree.composites.sequence(
	[sbehave.adjacent_to_stack, sbehave.creep.drop_energy]);

var harvest_or_move = new btree.composites.select(
	[sbehave.creep.harvest_target, sbehave.creep.succeeding_move_to_target]);

var transfer_or_move = new btree.composites.select(
	[sbehave.creep.transfer_stack, drop_if_by_stack, sbehave.creep.succeeding_move_to_stack]);

var harvest_target_source = new btree.composites.sequence(
	[sbehave.creep.not_full_energy, new btree.decorators.always_succeed(target_most_empty_source), harvest_or_move]);

var transfer_nearest_spawn = new btree.composites.sequence(
	[sbehave.push_nearest_spawn, transfer_or_move, sbehave.pop_stack]);

var transfer_target = new btree.composites.select(
	[transfer_to_container, transfer_nearest_spawn]);

var simple_harvest_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(harvest_target_source), transfer_target]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_harvest_behavior.run(context);
	},
}

