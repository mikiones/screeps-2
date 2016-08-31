Source.prototype.harvestingPositions = function() {
	var objs = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
	return _.size(_.filter(objs, obj => obj.terrain != 'wall'));
};

Source.prototype.cleanHarvesters = function() {
	if (!this.room.memory.sources) {
		this.room.memory.sources = {};
	}
	if (!this.room.memory.sources[this.id]) {
		this.room.memory.sources[this.id] = {};
	}
	_.forEach(this.room.memory.sources[this.id], function(work_count, creep_id) {
		var target = Game.getObjectById(creep_id);
		if (!target || !Game.creeps[target.name]) {
			this.room.memory.sources[this.id][creep_id] = undefined;
		}
	});
};

Source.prototype.registerHarvester = function(creep) {
	if (!this.room.memory.sources) {
		this.room.memory.sources = {};
	}
	if (!this.room.memory.sources[this.id]) {
		this.room.memory.sources[this.id] = {};
	}
	if (!this.room.memory.sources[this.id][creep.id]) {
		var max_allowed = this.harvestingPositions();
		if (max_allowed > _.size(this.room.memory.sources[this.id])) {
			this.room.memory.sources[this.id][creep.id] = creep.getActiveBodyparts(WORK);
			return true;
		}
	}
	return false;
};

Source.prototype.availablePositions = function() {
	if (!this.room.memory.sources) {
		this.room.memory.sources = {};
	}
	if (!this.room.memory.sources[this.id]) {
		this.room.memory.sources[this.id] = {};
	}
	return this.harvestingPositions() - _.size(this.room.memory.sources[this.id]);
}

Room.prototype.creepsOfRole = function(role) {
	return this.find(FIND_CREEPS, {filter : creep => creep.memory.role && creep.memory.role == role});
};

Room.prototype.cleanSources = function() {
	_.forEach(this.find(FIND_SOURCES), source => source.cleanHarvesters());
};
