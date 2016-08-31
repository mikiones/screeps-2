Room.prototype.creepsOfRole = function(role) {
	return this.find(FIND_CREEPS, {filter : creep => creep.memory.role && creep.memory.role == role});
};

Source.prototype.harvestingPositions = function() {
	var objs = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
	return _.size(_.filter(objs, obj => obj.terrain != 'wall'));
};
