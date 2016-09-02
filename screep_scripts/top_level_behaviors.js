var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

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

var harvest_or_move = new btree.composites.select(
	[sbehave.creep.harvest_key('assigned_source'), sbehave.creep.succeeding_move_to_key('assigned_source')]);

var assign_and_harvest_source = new btree.composites.sequence(
	[sbehave.creep.not_full_energy, assign_source, harvest_or_move]);

module.exports = {
	harvest : assign_and_harvest_source,
};
