var SUCCESS = 'SUCCESS';
var INPROGRESS = 'INPROGRESS';
var FAILURE = 'FAILURE';

var HARVEST = 'HARVEST';
function harvest(creep) {
	var harvest_src = creep.memory.harvest_src;
	if (!harvest_src) {
		harvest_src = creep.pos.findClosestByPath(FIND_SOURCES);
		if (!harvest_src) {
			console.log("COULD NOT FIND SOURCE");
			return;
		}
		creep.memory.harvest_src = harvest_src.id;
	} else {
		harvest_src = Game.getObjectById(harvest_src);
	}
	if (creep.harvest(harvest_src) == ERR_NOT_IN_RANGE) {
		creep.moveTo(harvest_src);
	}
}
function default_harvest_work(creep, cmd, work_remaining_func, work_func) {
	var target = Game.getObjectById(cmd.target_id);
	var work_remaining = work_remaining_func(creep, target);
	if (!target) {
		creep.memory.state = null;
		return FAILURE;
	}
	if (work_remaining <= 0) {
		creep.memory.state = null;
		return SUCCESS;
	}
	if (!creep.memory.state) {
		creep.memory.state = cmd.cmd_type;
	}
	if (creep.carry.energy >= creep.carryCapacity) {
		creep.memory.state = cmd.cmd_type;
	} else if (creep.carry.energy <= 0) {
		creep.memory.state = HARVEST;
	}
	if (creep.memory.state == HARVEST) {
		harvest(creep);
	} else if (creep.memory.state == cmd.cmd_type) {
		if(work_func(creep, target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	}
	work_remaining = work_remaining_func(creep, target);
	if (work_remaining <= 0) {
		return SUCCESS;
	}
	return INPROGRESS;
}

var BUILD = 'BUILD';
function default_build(creep, cmd) {
	return default_harvest_work(
		creep, cmd, function(creep, target) {
			if (target) {
				return target.progressTotal - target.progress;
			} else {
				return 0;
			}
		}, function(creep, target) {
			return creep.build(target);
		});
}
var FILL = 'FILL';
function default_fill(creep, cmd) {
	if (!cmd.args.store_type) {
		return FAILURE;
	}
	return default_harvest_work(
		creep, cmd, function(creep, target) {
			var str = cmd.args.store_type;
			var strCapacity = str.concat('Capacity');
			return target[strCapacity] - target[str];
		}, function(creep, target) {
			return creep.transfer(target, RESOURCE_ENERGY);
		});
}
var UPGRADE = 'UPGRADE';
function default_upgrade(creep, cmd) {
	return default_harvest_work(
		creep, cmd, function(creep, target) {
			var progress_remaining = target.progressTotal - target.progress;
			if (progress_remaining > 200) {
				if (!creep.memory.rc_progress) {
					creep.memory.rc_progress = target.progress;
					progress_remaining = 200 + creep.memory.rc_progress - target.progress;
				} else {
					progress_remaining = 200 + creep.memory.rc_progress - target.progress;
				}
			}
			if (progress_remaining <= 0) {
				creep.memory.rc_progress = null;
			}
			return progress_remaining;
		}, function(creep, target) {
			return creep.upgradeController(target);
		});
}

function make_cmd(cmd_type) {
	return function(target_id, args){
		return {
			cmd_type : cmd_type,
			target_id : target_id,
			args : args
		};
	};
}

function make_task(cmd_type, default_behavior) {
	return {
		make_cmd : make_cmd(cmd_type),
		default_behavior : default_behavior
	};
}

var all_tasks = {
	BUILD : make_task(BUILD, default_build),
	FILL : make_task(FILL, default_fill),
	UPGRADE : make_task(UPGRADE, default_upgrade),
};

function default_behavior(creep, cmd) {
	var task = all_tasks[cmd.cmd_type];
	if (task) {
		return task.default_behavior(creep, cmd);
	}
	return FAILURE;
}

module.exports = {
	tasks : all_tasks,
	default_behavior : default_behavior,
	FAILURE : FAILURE,
	INPROGRESS : INPROGRESS,
	SUCCESS : SUCCESS
};
