var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var source_target = {
	condition_node : null,
	update_node : null,
	action_node : null,
	move_node : null,
};

var actor_status_key = (key, func) => sbehave.actor_status(actor => func(actor.memory[key]));
var transfer_container_nonfull = new (actor_status_key('transfer_container', function(container_id) {
	var tc = Game.getObjectById(container_id);
	return tc.store.energy < tc.storeCapacity;
}));

var least_harvested_source_as_assigned_source = new (sbehave.save_memory_key('assigned_source', function (context) {
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
	return target.id;
}));

var valid_transfer_container = new btree.composites.sequence(
	[new (sbehave.key_is_object_id('transfer_container')), transfer_container_nonfull]);

var update_transfer_container = new (sbehave.save_memory_key('transfer_container', function(context) {
	var val = sbehave.get_nearest_nonfull_container(context);
	if (val) {
		return val.id;
	}
	return null;
}));

var register_harvester_stack = new btree.composites.sequence(
	[new (sbehave.push_func_on_memory_key('assigned_source', Game.getObjectById)),
	new (sbehave.with_pop_stack_value(function(context, source) {
		source.registerHarvester(context.actor);
		return btree.SUCCESS;
	}))
]);

var update_assigned_source = new btree.composites.sequence(
	[least_harvested_source_as_assigned_source, register_harvester_stack]);

var assign_source = new btree.composites.select(
	[new (sbehave.key_is_object_id('assigned_source')), update_assigned_source]);

var transfer_container = new btree.composites.select(
	[valid_transfer_container, update_transfer_container]);

function key_action_or_move_node(key, action, resource_type=null) {
	var action_node = new (sbehave.actor_action_key(key, action, resource_type));
	return new btree.composites.select_skip_running([action_node, sbehave.creep.succeeding_move_to_key(key)]);
}

function create_target_action(key, action, condition_node, update_target_node, resource_type = null) {
	var action_node = key_action_or_move_node(key, action, resource_type);
	var children = [update_target_node, action_node];
	if (condition_node) {
		children.unshift(condition_node);
	}
	return new btree.composites.sequence(children);
}

var assign_and_harvest_source = create_target_action('assigned_source', 'harvest', sbehave.creep.not_full_energy, assign_source);
var transfer_container_and_transfer = create_target_action('transfer_container', 'transfer', null, transfer_container, RESOURCE_ENERGY);

module.exports = {
	harvest : assign_and_harvest_source,
	transfer_to_container : transfer_container_and_transfer,
};
