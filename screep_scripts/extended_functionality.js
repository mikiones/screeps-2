Room.prototype.creeps_of_role = function(role) {
	return this.find(FIND_CREEPS, {filter : creep => creep.memory.role && creep.memory.role == role});
};
