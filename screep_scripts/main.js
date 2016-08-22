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
	Game.spawns['Spawn1'].createCreep( [WORK, CARRY, MOVE], 'Harvester'.concat(make_id()) );
}

module.exports.loop = function () {

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		roleHarvester.run(creep);
	}
}
