goog.provide("Blockly.JavaScript.class");

goog.require("Blockly.JavaScript");
//goog.require("Blockly.Class");

Blockly.JavaScript["class_function_return"] = function(block) {
  //Blockly.JavaScript["procedures_defreturn"];
};
Blockly.JavaScript["class_function_noreturn"] = function(block) {
  //Blockly.JavaScript["procedures_defreturn"];
};
/* Generates code for a class */
Blockly.JavaScript["class_class"] = function(block) {
  console.log(Blockly.Xml.workspaceToDom(block.workspace));
  var className = block.getClassDef();
  var code = "class " + className + "{\n";
  var attributes = [];
  for (var i = 1; i < block.attributeCount + 1; i++) {
    attributes[i - 1] =
      Blockly.JavaScript.valueToCode(block, "attribute" + i, Blockly.JavaScript.ORDER_COMMA) ||
      "null";
  }

  var constr = block.getConstructor();
  if (constr) {
    var constructor_vars = constr.getVars();
    var branch = Blockly.JavaScript.statementToCode(constr, "STACK");

    //generate code for the constructor
    code += " constructor (" + constructor_vars.join(", ") + "){\n";
    for (var i = 0; i < attributes.length; i++) {
      code += "  " + attributes[i] + ";\n";
    }
    code += branch + " }\n\n";
  } else {
    /*TODO: Was passiert wenn kein Konstruktor existiert???*/
    code += " /*default Constructor */\n constructor(){\n";
    for (var i = 0; i < attributes.length; i++) {
      code += "  " + attributes[i] + ";\n";
    }
    code += "}\n\n";
  }

  //generates code for all methods
  var methods = Blockly.Class.getMethods(block.workspace, className);
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].getMethodDef()[0];
    var branch = Blockly.JavaScript.statementToCode(methods[i], "STACK");
    var vars = methods[i].getVars();

    var returnValue =
      Blockly.JavaScript.valueToCode(methods[i], "RETURN", Blockly.JavaScript.ORDER_NONE) || "";
    if (returnValue) {
      returnValue = Blockly.JavaScript.INDENT + "return " + returnValue + ";\n";
    }

    code += " " + name + "(" + vars.join(", ") + "){\n" + branch + returnValue + "}\n\n";
  }
  code += "}\n";
  code = Blockly.JavaScript.scrub_(block, code);

  Blockly.JavaScript.definitions_["%" + className] = code;
  return null;
};

Blockly.JavaScript["class_get_instance"] = function(block) {
  var className = block.getInstanceDef()[0];
  var args = [];
  for (var i = 0; i < block.args; i++) {
    args[i] =
      Blockly.JavaScript.valueToCode(block, "ARG" + i, Blockly.JavaScript.ORDER_COMMA) || "null";
  }
  var code = "new " + className + "(" + args.join(", ") + ")";
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["class_constructor"] = function(block) {
  var code = "/*Konstruktoren sollten Klassen zugewiesen werden*/\n constructor(){\n }\n";
  return code;
};
