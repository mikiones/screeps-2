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
	this.get_state = function(actor) {
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
		return state;
	};
	this.step = function(actor, state) {
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
		var state = this.get_state(actor);
		var state_p = this.step(actor, state);
		this.swap(actor, state_p);
	};
}

//type behaviors = [behavior]
//type terminal_states = {behavior_name : [state]}
function behavior_loop(name, behaviors, terminal_states) {
	this.name = name;
	this.behaviors = behaviors;
	this.terminal_states = terminal_states;
	this.run = function(actor) {
		var store_str = this.name.concat('_index');
		if (!actor.memory[store_str]) {
			actor.memory[store_str] = 0;
		}
		var current_index = actor.memory[store_str];
		var current_behavior = this.behaviors[current_index % _.size(this.behaviors)];
		var state = current_behavior.get_state(actor);
		state = current_behavior.step(actor, state);
		if (this.terminal_states[current_behavior.name] && _.includes(this.terminal_states[current_behavior.name], state)) {
			current_index += 1;
			current_behavior = this.behaviors[current_index % _.size(this.behaviors)];
			current_behavior.run(actor, state);
			actor.memory[store_str] = current_index;
		} else {
			current_behavior.swap(actor, state);
		}
	};
}

var energy_machine = new state_machine({
	'NOTFULL' : [{state_p : 'FULL', cond : (actor, state) => actor.carry.energy >= actor.carryCapacity}],
	'FULL' : [{state_p : 'NOTFULL', cond : (actor, state) => actor.carry.energy < actor.carryCapacity}],
});

//var empty_machine = new state_machine({});
//var suicide_behavior = new behavior('suicide', empty_machine, 'EMPTY', {'EMPTY' : (actor, state) => actor.suicide()});
//});
//
//var mine_and_suicide = new behavior_loop('mine->suicide', [harvest_behavior, suicide_behavior], {[harvest_behavior.name] : ['FULL']});
//
module.exports = {
	state_machine : state_machine,
	behavior : behavior,
	behavior_loop : behavior_loop,
	energy_machine : energy_machine,
};
