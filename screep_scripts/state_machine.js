//type actor_id = id
//type initial_state = state
//type transitions = {state : [{cond : condition, state_p : state}]}
//type state = string
//type condition = (actor -> state -> bool)

function state_machine(transitions) {
	this.transitions = transitions;
	this.step_machine = function(actor, state) {
		var state_p = _.find(this.transitions[state], function(transition) {
			return transition.cond(actor, state);
		});
		if (state_p) {
			return state_p.state_p;
		}
		return state;
	};
	this.resolve_machine = function(actor, state) {
		var visited = {state : true};
		while (true) {
			state = this.step_machine(actor, state);
			if (visited[state]) {
				break;
			}
			visited[state] = true;
		}
		return state;
	};
}

function shared_state_machine(initial_state, transitions) {
	this.state = initial_state;
	this.machine = state_machine(transitions);
	this.step_machine = function(actor) {
		this.state = this.machine.step_machine(actor, this.state);
	};
	this.resolve_machine = function(actor) {
		this.state = this.machine.resolve_machine(actor, this.state);
	};
}

function behavior(name, machine, initial_state, handle_states) {
	this.name = name;
	this.machine = machine;
	this.initial_state = initial_state;
	this.handle_states = handle_states;
	this.step = function(actor) {
		var store_str = this.name.concat('_state');
		if (actor.memory.behavior != this.name) {
			if (actor.memory.behavior) {
				actor.memory[actor.memory.behavior.concat('_state')] = null;
			}
			actor.memory.behavior = this.name;
			actor.memory[store_str] = null;
		}
		if (!actor.memory[store_str]) {
			actor.memory[store_str] = this.initial_state;
		}
		var state = actor.memory[store_str];
		return this.machine.resolve_machine(actor, state);
	};
	this.swap = function(actor, state_p) {
		var store_str = this.name.concat('_state');
		actor.memory[store_str] = state_p;
		if (handle_states[state_p]) {
			handle_states[state_p](actor, state_p);
		} else {
			console.log("NO FUNCTION TO HANDLE STATE : ", state_p);
		}
	};
	this.run = function(actor) {
		var state_p = this.step(actor);
		this.swap(actor, state_p);
	};
}

//type behaviors = [behavior]
//type terminal_states = {behavior_name : [state]}
function behavior_loop(name, behaviors, terminal_states) {
	this.current_behavior = 0;
	this.behaviors = behaviors;
	this.terminal_states = terminal_states;
	this.run = function(actor) {
		current_behavior.run(actor);
		var current_behavior = this.behaviors[this.current_behavior % _.size(this.behaviors)];
		var state = actor.memory[current_behavior.name.concat('_state')];
		if (this.terminal_states[current_behavior.name] && _.includes(this.terminal_states[current_behavior.name], state)) {
			this.current_behavior += 1;
		}
		var current_behavior = this.behaviors[this.current_behavior % _.size(this.behaviors)];
	};
}

var energy_state_machine = new state_machine({
	'NOTFULL' : [{state_p : 'FULL', cond : function(actor, state) { return actor.carry.energy >= actor.carryCapacity; } }],
	'FULL' : [{state_p : 'NOTFULL', cond : function(actor, state) { return actor.carry.energy < actor.carryCapacity; } }],
});

var empty_machine = new state_machine({});
var suicide_behavior = new behavior('suicide', empty_machine, 'EMPTY', {
	'EMPTY' : function(actor, state) {
		console.log('SUICIDING ACTOR!');
		actor.suicide();
	},
});

var harvest_behavior = new behavior('harvest', energy_state_machine, 'NOTFULL', {
	'NOTFULL' : function(actor, state) {
		console.log('NOTFULL, MINING');
		var src = actor.pos.findClosestByPath(FIND_SOURCES);
		if (actor.harvest(src) == ERR_NOT_IN_RANGE) {
			actor.moveTo(src);
		}
	},
	'FULL' : function(actor, state) {
		console.log('FULL');
		if (actor.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			actor.moveTo(Game.spawns['Spawn1']);
		}
	},
});

var mine_and_suicide = new behavior_loop('mine->suicide', [harvest_behavior, suicide_behavior], {[harvest_behavior.name] : ['FULL']});

module.exports = {
	behavior_loop : behavior_loop,
	behavior : behavior,
	mine_and_suicide : mine_and_suicide,
	harvest : harvest_behavior.run,
};
