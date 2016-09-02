var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

function get_nearest_contstruction_site(context) {
	var target = context.actor.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
	if (target) {
		return target.id;
	}
	return null;
};
var set_nearest_construction_target = new (sbehave.save_memory_key('target', get_nearest_contstruction_site));

function has_no_target(actor) {
	if (!actor.memory.target) {
		return true;
	}
	var target = Game.getObjectById(actor.memory.target);
	if (target) {
		return false;
	}
	return true;
}

var needs_target = new (sbehave.actor_status(has_no_target));

var set_construction_target = new btree.composites.sequence(
	[new btree.decorators.always_succeed(needs_target), set_nearest_construction_target]);

var build_or_move_to_target = new btree.composites.select(
	[sbehave.creep.build_target, sbehave.creep.succeeding_move_to_target]);

var build_construction_site = new btree.composites.sequence(
	[set_construction_target, new btree.decorators.inverter(needs_target), build_or_move_to_target]);

var simple_builder_behavior = new btree.composites.sequence(
	[new btree.decorators.inverter(sbehave.creep.nonharvest_get_energy), build_construction_site]);

module.exports = {
	simple : function(creep) {
		var context = sbehave.create_context(creep, Game);
		simple_builder_behavior.run(context);
	},
}
