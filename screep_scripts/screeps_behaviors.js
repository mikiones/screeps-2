var btree = require('behavior_tree');

function create_context(actor, game) {
	return {actor : actor, game : game}
}

var push_stack_value = func => btree.builders.context_operation((context) => {
	if (context.stack) {
		context.stack.push(func(context));
	} else {
		context.stack = [func(context)];
	}
	return btree.SUCCESS;
});

var with_stack_value = func => btree.builders.context_operation((context) => {
	if (context.stack && context.stack.length > 0) {
		return func(context, context.stack.pop());
	}
	return btree.FAILURE;
});

function get_nearest_source(context) {
	var target = context.actor.pos.findClosestByPath(FIND_SOURCES);
	return target.pos;
}

var push_nearest_source = new (push_stack_value(get_nearest_source));
var check_push_nearest_source = new btree.composites.sequence([push_nearest_source, btree.leafs.print_context]);

module.exports = {
	create_context : create_context,
	test : check_push_nearest_source,
};
