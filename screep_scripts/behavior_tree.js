var _ = require('lodash');
//

var SUCCESS = 'SUCCESS';
var RUNNING = 'RUNNING';
var FAILURE = 'FAILURE';

class Leaf {
	constructor(behavior) {
		this.type = 'Leaf';
		this.behavior = behavior;
	}
	run(context) {
		return this.behavior(context);
	}
};

class Decorator extends Leaf {
	constructor(behavior, child) {
		super(behavior);
		this.child = child;
		this.type = 'Decorator';
	}
};

class Composite extends Leaf {
	constructor(behavior, children) {
		super(behavior);
		this.children = children;
		this.type = 'Composite';
		this.index = 0;
	}
	tree_path_push(context) {
		if (context.tree_path == null) {
			context.tree_path = [];
		}
		context.tree_path.push(this.index);
	}
	tree_path_pop(context) {
		if (context.tree_path && context.tree_path.length > 0) {
			context.tree_path.pop();
		}
	}
};

class sequence extends Composite {
	constructor(children) {
		var behavior = function(context) {
			if(this.children.length == 0) {
				return SUCCESS;
			}
			for (var i = this.index; i < this.children.length; i++) {
				this.tree_path_push(context);
				var branch_res = this.children[i].run(context);
				this.tree_path_pop(context);
				if (branch_res == RUNNING) {
					this.index = i;
					return RUNNING;
				} else if (branch_res == FAILURE) {
					this.index = 0;
					return FAILURE;
				}
			}
			return SUCCESS;
		};
		super(behavior, children);
		this.index = 0;
	}
};

class select extends Composite {
	constructor(children) {
		var behavior = function(context) {
			if(this.children.length == 0) {
				return SUCCESS;
			}
			for (var i = this.index; i < this.children.length; i++) {
				var branch_res = this.children[i].run(context);
				if (branch_res == RUNNING) {
					this.index = i;
					return RUNNING;
				} else if (branch_res == SUCCESS) {
					this.index = 0;
					return SUCCESS;
				}
			}
			this.index = 0;
			return FAILURE;
		};
		super(behavior, children);
	}
};

function node_builder(constructor, func) {
	return _.partial(constructor, func);
}
function context_operation(func) {
	return node_builder(Leaf, context => func(context));
}

var inverter = node_builder(Decorator, function(context) {
	var result = this.child.run(context);
	if (result == SUCCESS) {
		return FAILURE;
	} else if (result == FAILURE) {
		return SUCCESS;
	}
	return RUNNING;
});
var repeat_until_success = node_builder(Decorator, function(context) {
	if (this.child.run(context) != SUCCESS) {
		return RUNNING;
	}
	return SUCCESS;
});
var repeat_until_failure = node_builder(Decorator, function(context) {
	if (this.child.run(context) != FAILURE) {
		return RUNNING;
	}
	return SUCCESS;
});

var success = new (node_builder(Leaf, context => SUCCESS));
var failure = new (node_builder(inverter, success));
var print_context = new (context_operation(console.log));

module.exports = {
	leafs : {
		success : success,
		failure : failure,
		print_context : print_context,
	},
	decorators : {
		inverter : inverter,
		repeat_until_success : repeat_until_success,
		repeat_until_failure : repeat_until_failure,
	},
	composites : {
		select : select,
		sequence : sequence,
	},
	builders : {
		node_builder : node_builder,
		context_operation : context_operation,
	},
	Leaf : Leaf,
	Decorator : Decorator,
	Composite : Composite,
	SUCCESS : SUCCESS,
	RUNNING : RUNNING,
	FAILURE : FAILURE,
}
