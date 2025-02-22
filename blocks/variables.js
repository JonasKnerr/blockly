/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Variable blocks for Blockly.

 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";

goog.provide("Blockly.Blocks.variables"); // Deprecated.
goog.provide("Blockly.Constants.Variables");

//goog.require("Blockly.Variables");
goog.require("Blockly.Blocks");
goog.require("Blockly");
//goog.require("Blockly.Class");
/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['VARIABLES_HUE']. (2018 April 5)
 */
Blockly.Constants.Variables.HUE = 330;
//@Jonas Knerr
var variable_get_json = {
  message0: "%1",
  args0: [
    {
      type: "field_variable",
      name: "VAR",
      variable: "%{BKY_VARIABLES_DEFAULT_NAME}"
    }
  ],
  output: null,
  variable_scope: "global",
  colour: "%{BKY_VARIABLES_HUE}",
  helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
  tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
  extensions: ["contextMenu_variableSetterGetter"]
};
var object_variable_get_json = {
  message0: "%1",
  args0: [
    {
      type: "field_variable",
      name: "VAR",
      variable: "%{BKY_VARIABLES_DEFAULT_NAME}"
    }
  ],
  output: null,
  variable_scope: "global",
  helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
  tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
  extensions: ["contextMenu_variableSetterGetter"]
};
var variable_set_json = {
  message0: "%{BKY_VARIABLES_SET}",
  args0: [
    {
      type: "field_variable",
      name: "VAR",
      variable: "%{BKY_VARIABLES_DEFAULT_NAME}"
    },
    {
      type: "input_value",
      name: "VALUE"
    }
  ],
  variable_scope: "global",
  previousStatement: null,
  nextStatement: null,
  colour: "%{BKY_VARIABLES_HUE}",
  tooltip: "%{BKY_VARIABLES_SET_TOOLTIP}",
  helpUrl: "%{BKY_VARIABLES_SET_HELPURL}",
  extensions: ["contextMenu_variableSetterGetter"]
};

Blockly.Blocks["variables_set"] = {
  init: function() {
    this.jsonInit(variable_set_json);
    this.setInit = false;
    this.varType = "";
    this.colourIsSet = false;
  },
  onchange: function() {
    if (!this.colourIsSet) {
      var varModel = this.inputList[0].fieldRow[1].getVariable();
      var classBlock = Blockly.Class.getClassByName(Blockly.getMainWorkspace(), varModel.type);
      if (classBlock) {
        this.setColour(classBlock.getColour());
        this.colourIsSet = true;
      }
    }
    if (!this.isInFlyout) {
      var id = this.getFieldValue("VAR");
      var variableModel = this.workspace.getVariableById(id);
      if (!this.setInit) {
        var varType = variableModel.type;
        this.varType = varType;
        if (varType != "") {
          if (this.getInput("VALUE")) {
            this.getInput("VALUE").setCheck(varType);
          }
        }
        var classBlock = Blockly.Class.getClassByName(this.workspace, varType);
        if (classBlock) {
          this.setColour(classBlock.getColour());
        }
        this.setInit = true;
      }
      if (this.getInputTargetBlock("VALUE")) {
        variableModel.typeSet = true;
      }
    }
  }
};
Blockly.Blocks["variables_get"] = {
  init: function() {
    this.jsonInit(variable_get_json);
    this.varType = "";
    this.varTypeIsSet = false;
    this.colourIsSet = false;
  },
  onchange: function() {
    if (!this.colourIsSet) {
      var varModel = this.inputList[0].fieldRow[0].getVariable();
      var classBlock = Blockly.Class.getClassByName(Blockly.getMainWorkspace(), varModel.type);
      if (classBlock) {
        this.setColour(classBlock.getColour());
        this.colourIsSet = true;
      }
    }
    if (!this.isInFlyout && !this.varTypeIsSet) {
      var id = this.getFieldValue("VAR");
      var variableModel = this.workspace.getVariableById(id);
      var varType = variableModel.type;
      this.varType = varType;
      var classBlock = Blockly.Class.getClassByName(this.workspace, varType);
      if (classBlock) {
        this.setColour(classBlock.getColour());
      }
      if (variableModel.typeSet) this.varTypeIsSet = true;
    }
  }
};

Blockly.Blocks["object_variables_get"] = {
  init: function() {
    this.jsonInit(object_variable_get_json);
    this.varType = "";
    this.varTypeIsSet = false;
    this.methods = [];
    this.classVariables = [];
    this.args = 0;
    this.argNames = [];
    this.colourIsSet = false;
    this.setInputsInline(true);
  },
  onchange: function() {
    if (!this.colourIsSet) {
      var varModel = this.inputList[0].fieldRow[0].getVariable();
      var classBlock = Blockly.Class.getClassByName(Blockly.getMainWorkspace(), varModel.type);
      if (classBlock) {
        this.setColour(classBlock.getColour());
        this.colourIsSet = true;
      }
    }
    if (!this.isInFlyout) {
      if (!this.varTypeIsSet) {
        var id = this.getFieldValue("VAR");
        var variableModel = this.workspace.getVariableById(id);
        var varType = variableModel.type;
        this.varType = varType;
        var classBlock = Blockly.Class.getClassByName(this.workspace, varType);
        if (classBlock) {
          this.setColour(classBlock.getColour());
        }
        if (variableModel.typeSet) this.varTypeIsSet = true;
      }
    }
    if (this.varType != "" && this.varTypeIsSet) {
      var isVar;
      if (this.classVariables) {
        isVar = this.classVariables.includes(this.getFieldValue("METHODS"));
      }
      if (this.getFieldValue("METHODS") && !this.isInFlyout && !isVar) {
        this.typeOfValue = "method";
        var method = this.getFieldValue("METHODS");
        //check if Method has return value and adjust block
        var blocks = this.workspace.getAllBlocks();
        for (var i = 0; i < blocks.length; i++) {
          if (blocks[i].getMethodDef) {
            if (blocks[i].getMethodDef()[0] == method) {
              var methodBlock = blocks[i];
            }
          }
        }
        var isReturn;
        if (methodBlock) {
          if (methodBlock.type == "class_function_return") {
            isReturn = true;
          } else if (methodBlock.type == "class_function_noreturn") {
            isReturn = false;
          }
          this.isReturn = isReturn;
          this.setType(isReturn);
        }
        this.curValue = method;
        var args = Blockly.Class.getMethodAttributes(this.workspace, method);
        if (this.args != args.length) {
          if (this.args > args.length) {
            while (this.args > args.length) {
              this.args--;
              this.removeInput("ARG" + this.args);
            }
          } else {
            while (this.args < args.length) {
              this.appendValueInput("ARG" + this.args).appendField(args[this.args]);
              this.moveInputBefore("ARG" + this.args, null);
              this.args++;
            }
          }
        }
        var count = Blockly.Class.arraysEqual(this.argNames, args);
        if (typeof count == "number") {
          this.removeInput("ARG" + count);
          this.appendValueInput("ARG" + count).appendField(args[count]);
          var countInc = count + 1;
          if (this.getInput("ARG" + countInc))
            this.moveInputBefore("ARG" + count, "ARG" + countInc);
        }
        this.argNames = args;
      } else {
        this.typeOfValue = "attribute";
        this.setType(true);

        var variable_ = this.getFieldValue("METHODS");
        this.curValue = variable_;
        while (this.args > 0) {
          this.args--;
          this.removeInput("ARG" + this.args);
        }
      }
    }
  },
  setType: function(isReturn) {
    if (this.varType != "" && this.varTypeIsSet) {
      if (isReturn) {
        //remove Previous and Next Connections before removing the Statement
        if (this.nextConnection) {
          if (this.nextConnection.isConnected()) {
            this.nextConnection.disconnect();
          }
        }
        if (this.previousConnection) {
          if (this.previousConnection.isConnected()) {
            this.previousConnection.disconnect();
          }
        }
        this.setNextStatement(false);
        this.setPreviousStatement(false);
        this.setOutput(true);
      } else {
        this.setOutput(false);
        this.setNextStatement(true);
        this.setPreviousStatement(true);
      }
    }
  },
  getInstanceName: function() {
    if (this.varTypeIsSet) {
      return this.name;
    }
  },
  getClassName: function() {
    if (this.varTypeIsSet) {
      return this.varType;
    }
  },
  getCurrentMethod: function() {
    if (this.varTypeIsSet) {
      return this.curValue;
    }
  },
  renameClass: function(oldName, newName) {
    if (this.varTypeIsSet) {
      if (Blockly.Names.equals(oldName, this.varType)) {
        this.varType = newName;
      }
    }
  },
  update: function(oldName, legalName) {
    if (this.varTypeIsSet) {
      this.getDropDown(oldName, legalName);
      this.setInputsInline(this.getInputsInline());
    }
  },
  getDropDown: function(oldName, newName) {
    if (!this.isInFlyout) {
      var methods = Blockly.Class.getMethods(Blockly.getMainWorkspace(), this.getClassName());
      var classVariables =
        Blockly.Class.getClassVariables(Blockly.getMainWorkspace(), this.getClassName()) || [];
      if (
        this.methods.length != methods.length ||
        oldName ||
        this.classVariables.length != classVariables.length
      ) {
        console.log(methods);
        //remove previous Dropdown
        if (this.getInput("Data")) {
          this.removeInput("Data");
        }
        this.methods = methods;
        this.classVariables = classVariables;

        if (this.methods.length != 0 || this.classVariables.length != 0) {
          var options = [];

          //make array of method names, if a mehtod gets renamed we need to
          // store the new Value newName
          var methodNames = methods.map(method => {
            if (method.getFieldValue("NAME") == oldName) return newName;
            return method.getFieldValue("NAME");
          });
          if (this.curValue == oldName) {
            this.curValue = newName;
          }

          //remove current value if block is not in the class anymore
          if (
            !methodNames.includes(this.curValue) &&
            !this.classVariables.includes(this.curValue)
          ) {
            this.curValue = "";
            this.typeOfValue = "";
          }
          if (this.curValue) {
            if (this.classVariables.includes(this.curValue)) {
              this.typeOfValue = "attribute";
              options.push([this.curValue, this.curValue]);
            } else {
              this.typeOfValue = "method";
              options.push([this.curValue + "()", this.curValue]);
            }
          }
          for (var i = 0; i < this.classVariables.length; i++) {
            if (classVariables[i] == this.curValue && this.typeOfValue == "attribute") continue;
            options.push([classVariables[i], classVariables[i]]);
          }
          for (var i = 0; i < methodNames.length; i++) {
            if (methodNames[i] == this.curValue && this.typeOfValue == "method") continue;
            options.push([
              this.methods[i].getFieldValue("NAME") + "()",
              this.methods[i].getFieldValue("NAME")
            ]);
          }
          var dropdown = new Blockly.FieldDropdown(options);
          this.appendDummyInput("Data").appendField(dropdown, "METHODS");
          if (this.getInput("ARG0")) {
            this.moveInputBefore("Data", "ARG0");
          }
        }
      }
    }
  }
};

/**
 * Mixin to add context menu items to create getter/setter blocks for this
 * setter/getter.
 * Used by blocks 'variables_set' and 'variables_get'.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN = {
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (!this.isInFlyout) {
      // Getter blocks have the option to create a setter block, and vice versa.
      if (this.type == "variables_get") {
        var opposite_type = "variables_set";
        var contextMenuMsg = Blockly.Msg["VARIABLES_GET_CREATE_SET"];
      } else {
        var opposite_type = "variables_get";
        var contextMenuMsg = Blockly.Msg["VARIABLES_SET_CREATE_GET"];
      }

      var option = { enabled: this.workspace.remainingCapacity() > 0 };
      var name = this.getField("VAR").getText();
      option.text = contextMenuMsg.replace("%1", name);
      var xmlField = document.createElement("field");
      xmlField.setAttribute("name", "VAR");
      xmlField.appendChild(document.createTextNode(name));
      var xmlBlock = document.createElement("block");
      xmlBlock.setAttribute("type", opposite_type);
      xmlBlock.appendChild(xmlField);
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
      // Getter blocks have the option to rename or delete that variable.
    } else {
      if (this.type == "variables_get" || this.type == "variables_get_reporter") {
        var renameOption = {
          text: Blockly.Msg.RENAME_VARIABLE,
          enabled: true,
          callback: Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this)
        };
        var name = this.getField("VAR").getText();
        var deleteOption = {
          text: Blockly.Msg.DELETE_VARIABLE.replace("%1", name),
          enabled: true,
          callback: Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this)
        };
        options.unshift(renameOption);
        options.unshift(deleteOption);
      }
    }
  }
};

/**
 * Callback for rename variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to rename.
 * @return {!function()} A function that renames the variable.
 */
Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField("VAR").getVariable();
    Blockly.Variables.renameVariable(workspace, variable);
  };
};

/**
 * Callback for delete variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to delete.
 * @return {!function()} A function that deletes the variable.
 */
Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    var workspace = block.workspace;
    var variable = block.getField("VAR").getVariable();
    workspace.deleteVariableById(variable.getId());
    workspace.refreshToolboxSelection();
  };
};

Blockly.Extensions.registerMixin(
  "contextMenu_variableSetterGetter",
  Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN
);
