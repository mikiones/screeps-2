var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var pickup_or_move = new btree.composites.select(
	[sbehave.creep.pickup_stack, sbehave.creep.succeeding_move_to_stack]);

var pickup_nearest_dropped_energy = new btree.composites.sequence(
	[sbehave.push_nearest_dropped_energy, pickup_or_move, sbehave.pop_stack]);

var pickup_dropped_energy = new btree.composites.sequence(
	[sbehave.creep.not_full_energy, pickup_nearest_dropped_energy, sbehave.push_nearest_spawn, sbehave.creep.succeeding_move_to_stack, sbehave.pop_stack]);

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
