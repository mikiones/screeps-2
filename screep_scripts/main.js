var roleHarvester = require('role.simple_harvester');

function make_id() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 8; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function spawn_screep() {
	Game.spawns['Spawn1'].createCreep( [WORK, WORK, CARRY, MOVE], 'HARVESTER.'.concat(make_id()) );
}

module.exports.loop = function () {
	if (Game.spawns['Spawn1'].energy >= 300) {
		spawn_screep();
	}
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		roleHarvester.run(creep);
	}
}
