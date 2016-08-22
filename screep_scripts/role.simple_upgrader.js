var util = require('util');

var roleUpgrader = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.carry.energy == 0) {
			creep.memory.upgrading = false;
		}
		if (creep.carry.energy < creep.carryCapacity && !creep.memory.upgrading) {
			var harvest_src = creep.memory.harvest_src;
			if (!harvest_src) {
				harvest_src = creep.pos.findClosestByPath(FIND_SOURCES);
				if (harvest_src == null) {
					creep.moveTo(Game.spawns['Spawn1']);
					return
				}
				creep.memory.harvest_src = harvest_src.id;
			} else {
				harvest_src = Game.getObjectById(harvest_src);
			}
			if(creep.harvest(harvest_src) == ERR_NOT_IN_RANGE) {
				creep.moveTo(harvest_src);
			}
		}
		else {
			creep.memory.upgrading = true;
			if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller);
			} else {
				creep.memory.harvest_src = undefined;
			}
		}
	},
	spawn: function(spawner) {
		spawner.createCreep([WORK, CARRY, MOVE, MOVE, MOVE], "UPGRADER:".concat(util.make_id()));
	}
};

module.exports = roleUpgrader;
