var util = require('util');

var roleUpgrader = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if(creep.carry.energy < creep.carryCapacity) {
			var harvest_src = creep.memory.harvest_src;
			if (!harvest_src) {
				harvest_src = creep.pos.findClosestByPath(FIND_SOURCES);
				creep.memory.harvest_src = harvest_src.id;
			} else {
				harvest_src = Game.getObjectById(harvest_src);
			}
			if(creep.harvest(harvest_src) == ERR_NOT_IN_RANGE) {
				creep.moveTo(harvest_src);
			}
		}
		else {
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
