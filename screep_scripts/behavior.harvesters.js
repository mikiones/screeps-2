var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var target_nearest_source = new btree.composites.sequence(
	[sbehave.push_nearest_source, sbehave.pop_stack_to_target_memory]);

var drop_if_by_stack = new btree.composites.sequence(
	[sbehave.adjacent_to_stack, sbehave.creep.drop_energy]);

var harvest_or_move = new btree.composites.select(
	[sbehave.creep.harvest_target, sbehave.creep.succeeding_move_to_target]);

var transfer_or_move = new btree.composites.select(
	[sbehave.creep.transfer_stack, drop_if_by_stack, sbehave.creep.succeeding_move_to_stack]);

var harvest_nearest_source = new btree.composites.sequence(
	[sbehave.creep.not_full_energy, target_nearest_source, harvest_or_move]);

var transfer_nearest_spawn = new btree.composites.sequence(
	[sbehave.push_nearest_spawn, transfer_or_move, sbehave.pop_stack]);

var simple_harvest_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(harvest_nearest_source), transfer_nearest_spawn]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_harvest_behavior.run(context);
	},
}

