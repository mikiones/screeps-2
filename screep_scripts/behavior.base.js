function move_action_on_target(actor, action, target) {
	if (target) {
		var result = actor[action](target);
		if (result == OK) {
			return true;
		} else if (result == ERR_NOT_IN_RANGE) {
			actor.moveTo(target);
			return true;
		}
	}
	return false;
}

function move_resource_action_on_target(actor, action, resource_type, target) {
	if (target) {
		var result = actor[action](target, resource_type);
		if (result == OK) {
			return true;
		} else if (result == ERR_NOT_IN_RANGE) {
			actor.moveTo(target);
			return true;
		}
	}
	return false;
}

function action_when_in_range(actor, action, target, range) {
	if (target) {
		if (actor.pos.getRangeTo(target) <= range) {
			actor[action](target);
		} else {
			actor.moveTo(target);
		}
		return true;
	}
	return false;
}

function drop_resource_when_in_range(actor, resource_type, target, range) {
	if (target) {
		if (actor.pos.getRangeTo(target) <= range) {
			actor.drop(resource_type);
		} else {
			actor.moveTo(target);
		}
		return true;
	}
	return false;
}

var get_target = {
	nearest : function(actor, type, cond) {
		return actor.pos.findClosestByPath(type, { filter : cond });
	},
	lowest_hits : function(actor, type, cond) {
		var targets = actor.room.find(type, { filter : cond });
		var min = null;
		var score = 100000000;
		_.forEach(targets, function(target) {
			if (target.hits < score) {
				score = target.hits;
				min = target;
			}
		});
		return min;
	},
};

function move_action_nearest(actor, action, type, cond) {
	return move_action_on_target(actor, action, get_target.nearest(actor, type, cond));
}
function move_resource_action_nearest(actor, action, resource_type, type, cond) {
	return move_resource_action_on_target(actor, action, resource_type, get_target.nearest(actor, type, cond));
}

function chain_state_handlers(...handlers) {
	return (actor, state) => _.find(handlers, (handle) => handle(actor));
}

var withdraw_from = {
	nearest_container : (actor) => move_resource_action_nearest(actor, 'withdraw', RESOURCE_ENERGY, FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store.energy > 0),
	nearest_source : (actor) => move_action_nearest(actor, 'harvest', FIND_SOURCES, (source) => source.energy > 0),
	nearest_dropped_energy : (actor) => move_action_nearest(actor, 'pickup', FIND_DROPPED_ENERGY, (struct) => true),
	nearest_spawn : (actor) => move_resource_action_nearest(actor, 'withdraw', RESOURCE_ENERGY, FIND_STRUCTURES,
		(struct) => struct.structureType == STRUCTURE_SPAWN && struct.energy > 0),
};
withdraw_from.non_source = chain_state_handlers(withdraw_from.nearest_dropped_energy, withdraw_from.nearest_container);

var expend_energy_to = {
	transfer : (actor, target) => move_transfer_on_target(actor, RESOURCE_ENERGY, target),
	transfer_nearest_type : (actor, struct_type) => move_resource_action_nearest(actor, 'transfer', RESOURCE_ENERGY, FIND_STRUCTURES,
		(struct) => struct.structureType == struct_type
			&& ((struct.store && struct.store.energy < struct.storeCapacity) || (struct.energy && struct.energy < struct.energyCapacity))),
	transfer_spawn_ground : (actor) => drop_resource_when_in_range(actor, RESOURCE_ENERGY,
		get_target.nearest(actor, FIND_STRUCTURES, (struct) => struct.structureType == STRUCTURE_SPAWN), 2),
	build_nearest_site : (actor) => move_action_nearest(actor, 'build', FIND_CONSTRUCTION_SITES, (c) => true),
	build_nearest_type : (actor, struct_type) => move_action_nearest(actor, 'build', FIND_CONSTRUCTION_SITES,
		(const_site) => const_site.structureType == struct_type),
	upgrade_nearest_rc : (actor) => move_action_on_target(actor, 'upgradeController', actor.room.controller),
	repair_urgent_lowest_hit : (actor) => move_action_on_target(actor, 'repair', get_target.lowest_hits(actor, FIND_STRUCTURES,
		(struct) => struct.hits < struct.hitsMax/2)),
	repair_urgent_lowest_hit_type : (actor, struct_type) => move_action_on_target(actor, 'repair', get_target.lowest_hits(actor, FIND_STRUCTURES,
		(struct) => struct.hits < struct.hitsMax/2 && struct.structureType == struct_type)),
	repair_lowest_hit : (actor) => move_action_on_target(actor, 'repair', get_target.lowest_hits(actor, FIND_STRUCTURES, (c) => true)),
	repair_lowest_hit_type : (actor, struct_type) => move_action_on_target(actor, 'repair', get_target.lowest_hits(actor, FIND_STRUCTURES,
		(struct) => struct.structureType == struct_type)),
};
expend_energy_to.transfer_nearest_container = (actor) => expend_energy_to.transfer_nearest_type(actor, STRUCTURE_CONTAINER);
expend_energy_to.transfer_nearest_spawn = (actor) => expend_energy_to.transfer_nearest_type(actor, STRUCTURE_SPAWN);
expend_energy_to.transfer_nearest_extension = (actor) => expend_energy_to.transfer_nearest_type(actor, STRUCTURE_EXTENSION);
expend_energy_to.build_nearest_container = (actor) => expend_energy_to.build_nearest_type(actor, STRUCTURE_CONTAINER);
expend_energy_to.build_nearest_wall = (actor) => expend_energy_to.build_nearest_type(actor, STRUCT_WALL);
expend_energy_to.build_nearest_road = (actor) => expend_energy_to.build_nearest_type(actor, STRUCT_ROAD);
expend_energy_to.repair_lowest_hit_container = (actor) => expend_energy_to.repair_lowest_hit_type(actor, STRUCTURE_CONTAINER);
expend_energy_to.repair_lowest_hit_wall = (actor) => expend_energy_to.repair_lowest_hit_type(actor, STRUCTURE_WALL);
expend_energy_to.repair_lowest_hit_road = (actor) => expend_energy_to.repair_lowest_hit_type(actor, STRUCTURE_ROAD);
expend_energy_to.repair_urgent_lowest_hit_container = (actor) => expend_energy_to.repair_urgent_lowest_hit_type(actor, STRUCTURE_CONTAINER);
expend_energy_to.repair_urgent_lowest_hit_wall = (actor) => expend_energy_to.repair_urgent_lowest_hit_type(actor, STRUCTURE_WALL);
expend_energy_to.repair_urgent_lowest_hit_road = (actor) => expend_energy_to.repair_urgent_lowest_hit_type(actor, STRUCTURE_ROAD);

function creep_type(type, behavior, body, build_priority) {
	this.type = type;
	this.behavior = behavior;
	this.body = body;
	this.build_priority = build_priority;
	this.creep_count = function(room) {
		return  _.size(room.find(FIND_MY_CREEPS, {filter : (creep) => creep.name.split(':')[0] == this.type}));
	};
};

module.exports = {
	chain_handlers : chain_state_handlers,
	withdraw_from : withdraw_from,
	expend_to : expend_energy_to,
	creep_type : creep_type,
};
