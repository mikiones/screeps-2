var tasks = require('tasks')
var util = require('util')

var genericWorker = {
	run : function (creep, new_work_func) {
		if (!creep.memory.cmd) {
			new_work_func(creep);
		}
		var res = tasks.default_behavior(creep, creep.memory.cmd);
		if (res == tasks.SUCCESS || res == tasks.FAILURE) {
			creep.memory.cmd = null;
		}
	},
	spawn : function (spawner) {
		spawner.createCreep([WORK, WORK, CARRY, MOVE], "WORKER:".concat(util.make_id()));
	}
};

module.exports = genericWorker;
