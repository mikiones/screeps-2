var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

var upgrade_or_move = new btree.composites.select(
	[sbehave.creep.upgrade_stack, sbehave.creep.succeeding_move_to_stack]);

var withdraw_or_move = new btree.composites.select(
	[sbehave.creep.withdraw_stack, sbehave.creep.succeeding_move_to_stack]);

var upgrade_room_rc = new btree.composites.sequence(
	[sbehave.push_room_controller, upgrade_or_move, sbehave.pop_stack]);

var withdraw_nearest_sapwn = new btree.composites.sequence(
	[sbehave.creep.empty_energy, sbehave.push_nearest_spawn, withdraw_or_move, sbehave.pop_stack]);

var simple_upgrader_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(withdraw_nearest_sapwn), upgrade_room_rc]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_upgrader_behavior.run(context);
	},
}
