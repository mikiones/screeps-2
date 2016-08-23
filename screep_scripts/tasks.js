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
	var work_remaining = work_remaining_func(target);
	if (!target) {
		creep.memory.state = null;
		return FAILURE;
	}
	if (work_remaining <= 0) {
		creep.memory.state = null;
		return SUCCESS;
	}
	if (!target.memory.state) {
		target.memory.state = cmd.cmd_type;
	}
	if (target.memory.state == HARVEST && (creep.carry.energy >= work_remaining || creep.carry.energy >= creep.carryCapacity)) {
		target.memory.state = cmd.cmd_type;
	} else if (target.memory.state == cmd.cmd_type && creep.carry.energy <= 0) {
		target.memory.state = HARVEST;
	}
	if (target.memory.state == HARVEST) {
		harvest(creep);
	} else if (target.memory.state == cmd.cmd_type) {
		if(work_func(creep, target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	}
	work_remaining = target.progressTotal - target.progress;
	if (work_remaining <= 0) {
		return SUCCESS;
	}
	return INPROGRESS;
}

var BUILD = 'BUILD';
function default_build(creep, cmd) {
	return default_harvest_work(
		creep, cmd, function(target) {
			return target.progressTotal - target.progress;
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
		creep, cmd, function(target) {
			var str = cmd.args.store_type;
			var strCapacity = str.concat('Capacity');
			return target[strCapacity] - target[str];
		}, function(creep, target) {
			return creep.transfer(target, RESOURCE_ENERGY);
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
