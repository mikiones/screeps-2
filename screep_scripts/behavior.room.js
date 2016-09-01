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
	for (var i in sources) {
		if (sources[i].availablePositions() > 0) {
			return false;
		}
	}
	return true;
}));

var spawn_creep_pop_stack = new btree.builders.context_operation(function(context) {
	if (context.stack.length < 1) {
		return btree.FAILURE;
	}
	var creepDescription = context.stack.pop();
	if (context.actor.spawning) {
		return btree.RUNNING;
	} else if (context.actor.memory.spawning) {
		context.actor.memory.spawning = false;
		return btree.SUCCESS;
	}
	if (context.actor.createCreep(creepDescription.body, creepDescription.name, creepDescription.memory) == OK) {
		context.actor.memory.spawning = true;
		return btree.RUNNING;
	}
	return btree.FAILURE;
	
});

var push_harvester_description = new (sbehave.push_stack_value(function(context) {
	return {
		body : [WORK, WORK, CARRY, MOVE],
		name : 'harvester:' + make_id(16),
		memory : {role : 'harvester'},
	};
}));

var if_not_maxed_out_build_harvesters = new btree.composites.sequence(
	[new btree.decorators.inverter(maxed_out_harvesters), push_harvester_description, spawn_creep_pop_stack]);

module.exports = {
	simple_spawn : function(spawn) {
		var context = sbehave.create_context(spawn, Game);
		if_not_maxed_out_build_harvesters.run(context);
	},
};
