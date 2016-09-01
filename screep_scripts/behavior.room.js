require('extended_functionality');
var btree = require('behavior_tree');
var sbehave = require('screeps_behaviors');

function make_id(count) {
	var toret = '';
	for (var i = 0; i < count; i++) {
		toret = toret + _.sample('ABCDEF1234567890');
	}
	return toret;
}

var maxed_out_harvesters = new (sbehave.actor_status(function(actor) {
	var sources = actor.room.find(FIND_SOURCES);
	var positions = _.reduce(sources, (result, source) => result + source.availablePositions(), 0);
	return positions <= 0;
}));

var at_least_three_upgraders = new (sbehave.actor_status(function(actor) {
	return actor.room.creepsOfRole('upgrader').length >= 3;
}));

var spawn_creep_pop_stack = new (btree.builders.context_operation(function(context) {
	if (!context.stack || context.stack.length < 1) {
		return btree.FAILURE;
	}
	var creepDescription = context.stack.pop();
	if (context.actor.spawning) {
		return btree.RUNNING;
	} else if (context.actor.memory.spawning) {
		context.actor.memory.spawning = false;
		return btree.SUCCESS;
	}
	if (context.actor.createCreep(creepDescription.body, creepDescription.name, creepDescription.memory) == creepDescription.name) {
		context.actor.memory.spawning = true;
		return btree.RUNNING;
	}
	return btree.FAILURE;
	
}));

var renew_all_adjacent = new (btree.builders.context_operation(function(context) {
	_.forEach(Game.creeps, function(creep) {
		if (creep.ticksToLive < 1000) {
			context.actor.renewCreep(creep);
		}
	});
	return btree.SUCCESS;
}));

var push_harvester_description = new (sbehave.push_stack_value(function(context) {
	return {
		body : [WORK, WORK, CARRY, MOVE],
		name : 'harvester:' + make_id(16),
		memory : {role : 'harvester'},
	};
}));

var push_upgrader_description = new (sbehave.push_stack_value(function(context) {
	return {
		body : [WORK, WORK, CARRY, MOVE],
		name : 'upgrader:' + make_id(16),
		memory : {role : 'upgrader'},
	};
}));

var if_not_maxed_out_build_harvesters = new btree.composites.sequence(
	[new btree.decorators.inverter(maxed_out_harvesters), push_harvester_description, spawn_creep_pop_stack]);

var if_not_three_upgrader_build_upgrader = new btree.composites.sequence(
	[new btree.decorators.inverter(at_least_three_upgraders), push_upgrader_description, spawn_creep_pop_stack]);

var spawn_harvesters_then_upgraders = new btree.composites.select(
	[if_not_maxed_out_build_harvesters, if_not_three_upgrader_build_upgrader, renew_all_adjacent]);

module.exports = {
	simple_spawn : function(spawn) {
		var context = sbehave.create_context(spawn, Game);
		spawn_harvesters_then_upgraders.run(context);
	},
};
