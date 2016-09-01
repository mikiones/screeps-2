var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var target_nearest_dropped_energy = new btree.composites.sequence(
	[new btree.decorators.inverter(sbehave.creep.has_target),
	sbehave.push_nearest_dropped_energy,
	sbehave.pop_stack_to_target_memory]);

var target_nearest_spawn = new btree.composites.sequence(
	[new btree.decorators.inverter(sbehave.creep.has_target),
	sbehave.push_nearest_spawn,
	sbehave.pop_stack_to_target_memory]);

var get_energy_target = new btree.composites.select(
	[target_nearest_dropped_energy, target_nearest_spawn]);

var pickup_or_move = new btree.composites.sequence(
	[sbehave.creep.pickup_target, sbehave.creep.succeeding_move_to_target]);

var pickup_target_source = new btree.composites.sequence(
	[sbehave.creep.not_full_energy, new btree.decorators.always_succeed(target_nearest_dropped_energy), pickup_or_move]);

var upgrade_or_move = new btree.composites.select(
	[sbehave.creep.upgrade_stack, sbehave.creep.succeeding_move_to_stack]);

var withdraw_or_move = new btree.composites.select(
	[sbehave.creep.withdraw_stack, sbehave.creep.succeeding_move_to_stack]);

var upgrade_room_rc = new btree.composites.sequence(
	[sbehave.push_room_controller, upgrade_or_move, sbehave.pop_stack]);

var withdraw_nearest_sapwn = new btree.composites.sequence(
	[sbehave.creep.empty_energy, pickup_target_source]);

var simple_upgrader_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(withdraw_nearest_sapwn), upgrade_room_rc]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_upgrader_behavior.run(context);
	},
}
