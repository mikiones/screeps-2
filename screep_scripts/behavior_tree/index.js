var behavior_tree = require("./behavior_tree/behavior_tree");

var context = {};
var repeat_print_context = new behavior_tree.composites.sequence([behavior_tree.leafs.print_context, behavior_tree.leafs.print_context]);
var fail_print_context = new behavior_tree.decorators.inverter(repeat_print_context);
var inf_loop = new behavior_tree.decorators.repeat_until_success(fail_print_context);
console.log(inf_loop.run(context));
