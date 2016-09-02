var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var withdraw_or_move = new btree.composites.select(
	[sbehave.creep.withdraw_stack, sbehave.creep.succeeding_move_to_stack]);

var withdraw_nearest_spawn = new btree.composites.sequence(
	[sbehave.push_nearest_spawn, withdraw_or_move, sbehave.pop_stack]);

var withdraw_energy_from = new btree.composites.select(
	[sbehave.creep.withdraw_from_container, withdraw_nearest_spawn]);

var withdraw_energy = new btree.composites.sequence(
	[sbehave.creep.empty_energy, withdraw_energy_from]);

var pickup_or_move = new btree.composites.select(
	[sbehave.creep.pickup_stack, sbehave.creep.succeeding_move_to_stack]);

var pickup_nearest_dropped_energy = new btree.composites.sequence(
	[sbehave.push_nearest_dropped_energy, pickup_or_move, sbehave.pop_stack]);

var pickup_dropped_energy = new btree.composites.sequence(
	[sbehave.creep.empty_energy, new btree.decorators.always_succeed(pickup_nearest_dropped_energy), withdraw_energy]);

var upgrade_or_move = new btree.composites.select(
	[sbehave.creep.upgrade_stack, sbehave.creep.succeeding_move_to_stack]);

var upgrade_room_rc = new btree.composites.sequence(
	[sbehave.push_room_controller, upgrade_or_move, sbehave.pop_stack]);

var simple_upgrader_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(pickup_dropped_energy), upgrade_room_rc]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_upgrader_behavior.run(context);
	},
}
