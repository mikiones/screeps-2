var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');
var tlb = require('top_level_behaviors');

var drop_if_by_stack = new btree.composites.sequence(
	[sbehave.adjacent_to_stack, sbehave.creep.drop_energy]);

var transfer_or_move = new btree.composites.select(
	[sbehave.creep.transfer_stack, drop_if_by_stack, sbehave.creep.succeeding_move_to_stack]);

var transfer_nearest_spawn = new btree.composites.sequence(
	[sbehave.push_nearest_spawn, transfer_or_move, sbehave.pop_stack]);

var transfer_target = new btree.composites.select(
	[tlb.transfer_to_container, transfer_nearest_spawn]);

var simple_harvest_behavior = new btree.composites.select(
	[tlb.harvest, transfer_target]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_harvest_behavior.run(context);
	},
}

