var util = require('util');
var roleUpgrader = require('role.simple_upgrader');

var roleHarvester = {

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
		else if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
			if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.spawns['Spawn1']);
			} else {
				creep.memory.harvest_src = undefined;
			}
		} else {
			var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
			if(target) {
				if(creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		}
	},
	spawn: function(spawner) {
		spawner.createCreep([WORK, CARRY, CARRY, MOVE, MOVE], "HARVESTER:".concat(util.make_id()));
	}
};

module.exports = roleHarvester;
