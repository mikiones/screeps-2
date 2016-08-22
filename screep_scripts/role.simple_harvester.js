var roleHarvester = {

	/** @param {Creep} creep **/
	run: function(creep) {
		if(creep.carry.energy < creep.carryCapacity) {
			var nearest = creep.pos.findClosestByRange(FIND_SOURCES);
			if(creep.harvest(nearest) == ERR_NOT_IN_RANGE) {
				creep.moveTo(nearest);
			}
		}
		else if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
			if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.spawns['Spawn1']);
			}
		}
	}
};

module.exports = roleHarvester;
