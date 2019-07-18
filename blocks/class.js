goog.provide("Blockly.Constants.Class");

goog.require("Blockly.Blocks");
goog.require("Blockly");
goog.require("Blockly.Blocks.procedures");

("use strict");
//@Jonas Knerr
Blockly.Blocks["class_get_instance"] = {
  init: function() {
    this.appendDummyInput()
      .appendField("new")
      .appendField(this.id, "NAME");
    this.args = 0;
    this.argNames = [];
    this.setOutput(true, this.getFieldValue("NAME"));
    this.setTooltip("");
    this.setHelpUrl("");
    this.initColour();
  },
  initColour: function() {
    let className = this.inputList[0].fieldRow[1].text_;
    var classBlock = Blockly.Class.getClassByName(Blockly.getMainWorkspace(), className);
    if (classBlock) {
      this.setColour(classBlock.getColour());
    }
  },
  changeOutput: function(newName) {
    this.setOutput(true, newName);
  },
  getClassName: function() {
    return this.getFieldValue("NAME");
  },

  getInstanceDef: function() {
    return [this.getClassName(), this.getFieldValue("INSTANCE")];
  },
  getConstructor: function() {
    return this.constr;
  },
  onchange: function() {
    if (!this.getInputsInline()) {
    }
    this.changeOutput(this.getFieldValue("NAME"));
  },
  /*
   * Upates constructor attributes if control_class gets changed
   */
  update: function() {
    var constr = Blockly.Class.getConstructor(this.workspace, this.getClassName());
    this.constr = constr;
    if (constr) {
      var args = constr.getVars();
      if (this.args != args.length) {
        if (this.args > args.length) {
          while (this.args > args.length) {
            this.args--;
            this.removeInput("ARG" + this.args);
          }
        } else {
          this.appendValueInput("ARG" + this.args).appendField(args[this.args]);
          this.args++;
        }
      }
      var count = Blockly.Class.arraysEqual(this.argNames, args);
      if (typeof count == "number") {
        this.removeInput("ARG" + count);
        this.appendValueInput("ARG" + count).appendField(args[count]);
        var countInc = count + 1;
        if (this.getInput("ARG" + countInc)) this.moveInputBefore("ARG" + count, "ARG" + countInc);
      }
      this.argNames = args;
    }
  },
  /**
   * renames the class, checks the oldName to only rename
   * classes with the same name
   */
  renameClass: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getClassName())) {
      this.setFieldValue(newName, "NAME");
    }
  },
  mutationToDom: function() {
    var container = document.createElement("mutation");
    container.setAttribute("name", this.getClassName());
    return container;
  },
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute("name");
    this.renameClass(this.getClassName(), name);
    this.initColour();
  },
  defType_: "class"
};

/**
 * Class to create a new Class with instances
 * add atrributes with decompose and compose functions
 */

Blockly.Blocks["class_class"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameClass);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Klasse")
      .appendField(nameField, "NAME");
    this.appendDummyInput("METHODS").appendField("Methoden");
    // this.appendStatementInput("METHODS0").setCheck([
    //   "class_function_noreturn",
    //   "class_function_return"
    // ]);
    this.setColour(Blockly.Class.colour());
    this.setConstructor(true);
    this.setMutator(new Blockly.Mutator(["class_attribute"], this));
    this.attributeCount = 0;
    this.methods = [];
    this.attributeInputs = [];
    this.oldName = "";
    this.hasConstr = true;
    this.statementConnection_ = null;
    this.setTooltip("");
    this.setHelpUrl("");
  },
  onchange: function(event) {
    if (!this.isInFlyout) {
      var counter = 0;
      var removed;
      var orgBlocks = false;
      var methods = [];
      var isRemoved = false;

      while (this.getInput("METHODS" + counter)) {
        orgBlocks = true;
        if (!this.getInputTargetBlock("METHODS" + counter)) {
          this.removeInput("METHODS" + counter);
          if (!isRemoved) {
            removed = counter;
            isRemoved = true;
          }
        }
        if (this.getInputTargetBlock("METHODS" + counter)) {
          methods.push(this.getInputTargetBlock("METHODS" + counter));
        }
        counter++;
      }

      if (removed) {
        this.appendStatementInput("METHODS" + removed).setCheck([
          "class_function_noreturn",
          "class_function_return"
        ]);
      } else if (!this.getInput("METHODS0")) {
        this.appendStatementInput("METHODS0").setCheck([
          "class_function_noreturn",
          "class_function_return"
        ]);
      } else if (!this.getInput("METHODS" + counter)) {
        this.appendStatementInput("METHODS" + counter).setCheck([
          "class_function_noreturn",
          "class_function_return"
        ]);
      }
      this.methods = methods;
      Blockly.Class.mutateCallers(this);
      this.changeScope();
    }
  },
  changeScope: function() {
    var attributeCount = 0;
    var attributeInputs = [];
    while (attributeCount <= this.attributeCount) {
      attributeCount++;
      if (this.getInputTargetBlock("attribute" + attributeCount)) {
        var type = this.getInputTargetBlock("attribute" + attributeCount).inputList[0].fieldRow[0]
          .variable_.type;
        var name = this.getInputTargetBlock("attribute" + attributeCount).inputList[0].fieldRow[0]
          .variable_.name;
        this.workspace.changeVariableScope(name, this.oldName, this.getClassDef(), type);
        attributeInputs.push(name);
      }
    }
    // set variables to global that are not in the class anymore
    if (this.attributeInputs.length > attributeInputs.length) {
      var changedInput = this.attributeInputs.filter(x => !attributeInputs.includes(x));
      this.workspace.changeVariableScope(changedInput[0], this.oldName, "global");
    }
    this.attributeInputs = attributeInputs;
  },
  setOldName(oldName) {
    this.oldName = oldName;
  },
  decompose: function(workspace) {
    var topBlock = workspace.newBlock("class_mutator", false, this);
    topBlock.initSvg();

    //set field according to constructor
    topBlock.setFieldValue(this.hasConstr ? "TRUE" : "FALSE", "CONSTR");

    var connection = topBlock.getInput("STACK").connection;
    for (var j = 1; j <= this.attributeCount; j++) {
      var attributeBlock = workspace.newBlock("class_attribute", false, this);
      attributeBlock.initSvg();
      connection.connect(attributeBlock.previousConnection);
      connection = attributeBlock.nextConnection;
    }
    return topBlock;
  },
  compose: function(containerBlock) {
    var inputBlocks = [];
    for (var i = this.attributeCount; i > 0; i--) {
      inputBlocks.push(this.getInputTargetBlock("attribute" + i));
      this.removeInput("attribute" + i);
    }
    this.attributeCount = 0;
    var inputLength = inputBlocks.length;
    var itemBlock = containerBlock.getInputTargetBlock("STACK");
    while (itemBlock) {
      if (itemBlock.type == "class_attribute") {
        var inputBlock = inputBlocks[inputLength - 1];
        inputLength--;
        this.attributeCount++;
        var attributeInput = this.appendValueInput("attribute" + this.attributeCount)
          .setCheck(null)
          .appendField("Attribut");
        if (inputBlock) {
          attributeInput.connection.connect(inputBlock.outputConnection);
        }
        if (this.hasConstr) {
          this.moveInputBefore("attribute" + this.attributeCount, "CONSTRUCTOR");
        } else {
          this.moveInputBefore("attribute" + this.attributeCount, "METHODS");
        }
      }
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    var hasConstr = containerBlock.getFieldValue("CONSTR");

    if (hasConstr !== null) {
      hasConstr = hasConstr == "TRUE";

      if (this.hasConstr != hasConstr) {
        if (hasConstr) {
          this.setConstructor(true);

          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, "CONSTRUCTOR");
          this.statementConnection_ = null;
        } else {
          //Save the stack, then disconnect it.
          var stackConnection = this.getInput("CONSTRUCTOR").connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setConstructor(false);
          //this.removeInput("CONSTRUCTOR");
        }
        this.hasConstr = hasConstr;
      }
    }
  },
  setConstructor: function(hasCons) {
    if (hasCons) {
      this.appendStatementInput("CONSTRUCTOR")
        .appendField("Konstruktor")
        .setCheck(["class_constructor"]);
      this.moveInputBefore("CONSTRUCTOR", "METHODS");
    } else {
      this.removeInput("CONSTRUCTOR");
    }
  },
  mutationToDom: function() {
    if (!this.atrributeCount && !this.methods.length) {
      return null;
    }
    var container = document.createElement("mutation");
    if (this.attributeCount) {
      container.setAttribute("attribute", this.attributeCount);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.atrributeCount = parseInt(xmlElement.getAttribute("attribute"), 10) || 0;
    for (var i = 1; i < this.attributeCount; i++) {
      this.appendValueInput("attribute" + i)
        .setCheck(null)
        .appendField("Attribute");
    }
  },
  getAttributeInputs: function() {
    return this.attributeInputs;
  },
  getClassDef: function() {
    return this.getFieldValue("NAME");
  },
  getStatement: function() {
    return this.methods;
  },
  getConstructor: function() {
    return this.getInputTargetBlock("CONSTRUCTOR");
  },
  callType_: "class"
};

Blockly.Blocks["class_constructor"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField("Konstruktor")
      .appendField("", "PARAMS");
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]);
    }
    this.setNextStatement(false);
    this.setPreviousStatement(true);
    this.setColour(Blockly.Msg["PROCEDURES_HUE"]);
    this.setTooltip(Blockly.Msg["PROCEDURES_DEFNORETURN_TOOLTIP"]);
    this.setHelpUrl(Blockly.Msg["PROCEDURES_DEFNORETURN_HELPURL"]);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput("STACK").appendField(Blockly.Msg["PROCEDURES_DEFNORETURN_DO"]);
      if (this.getInput("RETURN")) {
        this.moveInputBefore("STACK", "RETURN");
      }
    } else {
      this.removeInput("STACK", true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    // Merge the arguments into a human-readable list.
    var paramString = "";
    if (this.arguments_.length) {
      paramString = Blockly.Msg["PROCEDURES_BEFORE_PARAMS"] + " " + this.arguments_.join(", ");
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, "PARAMS");
    } finally {
      Blockly.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function(opt_paramIds) {
    var container = document.createElement("mutation");
    if (opt_paramIds) {
      container.setAttribute("name", this.getFieldValue("NAME"));
    }
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      var parameter = document.createElement("arg");
      var argModel = this.argumentVarModels_[i];
      parameter.setAttribute("name", argModel.name);
      parameter.setAttribute("varid", argModel.getId());
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute("paramId", this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute("statements", "false");
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() == "arg") {
        var varName = childNode.getAttribute("name");
        var varId = childNode.getAttribute("varid") || childNode.getAttribute("varId");
        this.arguments_.push(varName);
        var variable = Blockly.Variables.getOrCreateVariablePackage(
          this.workspace,
          varId,
          varName,
          ""
        );
        if (variable != null) {
          this.argumentVarModels_.push(variable);
        } else {
          console.log("Failed to create a variable with name " + varName + ", ignoring.");
        }
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute("statements") !== "false");
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock("procedures_mutatorcontainer", false, this);
    containerBlock.initSvg();

    // Check/uncheck the allow statement box.
    if (this.getInput("RETURN")) {
      containerBlock.setFieldValue(this.hasStatements_ ? "TRUE" : "FALSE", "STATEMENTS");
    } else {
      containerBlock.getInput("STATEMENT_INPUT").setVisible(false);
    }

    // Parameter list.
    var connection = containerBlock.getInput("STACK").connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var paramBlock = workspace.newBlock("procedures_mutatorarg");
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[i], "NAME");
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    this.argumentVarModels_ = [];
    var paramBlock = containerBlock.getInputTargetBlock("STACK");
    while (paramBlock) {
      var varName = paramBlock.getFieldValue("NAME");
      this.arguments_.push(varName);
      var variable = this.workspace.getVariable(varName, "");
      if (variable != null) {
        this.argumentVarModels_.push(variable);
      } else {
        console.log("Failed to get variable named " + varName + ", ignoring.");
      }

      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show/hide the statement input.
    var hasStatements = containerBlock.getFieldValue("STATEMENTS");
    if (hasStatements !== null) {
      hasStatements = hasStatements == "TRUE";
      if (this.hasStatements_ != hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, "STACK");
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          var stackConnection = this.getInput("STACK").connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this Blockly.Block
   */
  getConstructorDef: function() {
    return ["Constructor", this.arguments_, false];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<!Blockly.VariableModel>} List of variable models.
   * @this Blockly.Block
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },
  /**
   * Notification that a variable is renaming.
   * If the ID matches one of this block's variables, rename it.
   * @param {string} oldId ID of variable to rename.
   * @param {string} newId ID of new variable.  May be the same as oldId, but
   *     with an updated name.  Guaranteed to be the same type as the old
   *     variable.
   * @override
   * @this Blockly.Block
   */
  renameVarById: function(oldId, newId) {
    var oldVariable = this.workspace.getVariableById(oldId);
    if (oldVariable.type != "") {
      // Procedure arguments always have the empty type.
      return;
    }
    var oldName = oldVariable.name;
    var newVar = this.workspace.getVariableById(newId);

    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == oldId) {
        this.arguments_[i] = newVar.name;
        this.argumentVarModels_[i] = newVar;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newVar.name);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Notification that a variable is renaming but keeping the same ID.  If the
   * variable is in use on this block, rerender to show the new name.
   * @param {!Blockly.VariableModel} variable The variable being renamed.
   * @package
   * @override
   * @this Blockly.Block
   */
  updateVarName: function(variable) {
    var newName = variable.name;
    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == variable.getId()) {
        var oldName = this.arguments_[i];
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newName);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Update the display to reflect a newly renamed argument.
   * @param {string} oldName The old display name of the argument.
   * @param {string} newName The new display name of the argument.
   * @private
   */
  displayRenamedVar_: function(oldName, newName) {
    this.updateParams_();
    // Update the mutator's variables if the mutator is open.
    if (this.mutator.isVisible()) {
      var blocks = this.mutator.workspace_.getAllBlocks(false);
      for (var i = 0, block; (block = blocks[i]); i++) {
        if (
          block.type == "procedures_mutatorarg" &&
          Blockly.Names.equals(oldName, block.getFieldValue("NAME"))
        ) {
          block.setFieldValue(newName, "NAME");
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    // Add option to create caller.
    var option = { enabled: true };
    var name = this.getFieldValue("NAME");
    option.text = Blockly.Msg["PROCEDURES_CREATE_DO"].replace("%1", name);
    var xmlMutation = document.createElement("mutation");
    xmlMutation.setAttribute("name", name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = document.createElement("arg");
      xmlArg.setAttribute("name", this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = document.createElement("block");
    xmlBlock.setAttribute("type", this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var i = 0; i < this.argumentVarModels_.length; i++) {
        var option = { enabled: true };
        var argVar = this.argumentVarModels_[i];
        var name = argVar.name;
        option.text = Blockly.Msg["VARIABLES_SET_CREATE_GET"].replace("%1", name);

        var xmlField = Blockly.Variables.generateVariableFieldDom(argVar);
        var xmlBlock = document.createElement("block");
        xmlBlock.setAttribute("type", "variables_get");
        xmlBlock.appendChild(xmlField);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
  callType_: "class_constructor"
};

Blockly.Blocks["class_function_return"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameMethod);
    nameField.setSpellcheck(false);
    this.setInput(nameField);
    this.appendValueInput("RETURN")
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(Blockly.Msg["PROCEDURES_DEFRETURN_RETURN"]);
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFRETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFRETURN_COMMENT"]);
    }
    this.setNextStatement(false);
    this.setPreviousStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setColour(Blockly.Msg["PROCEDURES_HUE"]);
    this.setTooltip(Blockly.Msg["PROCEDURES_DEFRETURN_TOOLTIP"]);
    this.setHelpUrl(Blockly.Msg["PROCEDURES_DEFRETURN_HELPURL"]);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setInput: function(nameField) {
    if (this.isInFlyout) {
      this.appendDummyInput()
        .appendField("Methode")
        .appendField(nameField, "NAME")
        .appendField("", "PARAMS");
    } else {
      this.appendDummyInput()
        .appendField(nameField, "NAME")
        .appendField("", "PARAMS");
    }
  },
  setStatements_: Blockly.Blocks["class_constructor"].setStatements_,
  updateParams_: Blockly.Blocks["class_constructor"].updateParams_,
  mutationToDom: Blockly.Blocks["class_constructor"].mutationToDom,
  domToMutation: Blockly.Blocks["class_constructor"].domToMutation,
  decompose: Blockly.Blocks["class_constructor"].decompose,
  compose: Blockly.Blocks["class_constructor"].compose,
  getVars: Blockly.Blocks["class_constructor"].getVars,
  getMethodDef: function() {
    return [this.getFieldValue("NAME"), this.arguments_, true];
  },
  getVarModels: Blockly.Blocks["class_constructor"].getVarModels,
  renameVarById: Blockly.Blocks["class_constructor"].renameVarById,
  updateVarName: Blockly.Blocks["class_constructor"].updateVarName,
  displayRenamedVar_: Blockly.Blocks["class_constructor"].displayRenamedVar_,
  customContextMenu: Blockly.Blocks["class_constructor"].customContextMenu,
  callType_: "class_function_return"
};

Blockly.Blocks["class_function_noreturn"] = {
  init: function() {
    var nameField = new Blockly.FieldTextInput("", Blockly.Class.renameMethod);
    nameField.setSpellcheck(false);
    this.setInput(nameField);
    this.setMutator(new Blockly.Mutator(["procedures_mutatorarg"]));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]
    ) {
      this.setCommentText(Blockly.Msg["PROCEDURES_DEFNORETURN_COMMENT"]);
    }
    this.setNextStatement(false);
    this.setPreviousStatement(true, ["class_function_noreturn", "class_function_return"]);
    this.setColour(Blockly.Msg["PROCEDURES_HUE"]);
    this.setTooltip(Blockly.Msg["PROCEDURES_DEFNORETURN_TOOLTIP"]);
    this.setHelpUrl(Blockly.Msg["PROCEDURES_DEFNORETURN_HELPURL"]);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setInput: Blockly.Blocks["class_function_return"].setInput,
  setStatements_: Blockly.Blocks["class_constructor"].setStatements_,
  updateParams_: Blockly.Blocks["class_constructor"].updateParams_,
  mutationToDom: Blockly.Blocks["class_constructor"].mutationToDom,
  domToMutation: Blockly.Blocks["class_constructor"].domToMutation,
  decompose: Blockly.Blocks["class_constructor"].decompose,
  compose: Blockly.Blocks["class_constructor"].compose,
  getVars: Blockly.Blocks["class_constructor"].getVars,
  getMethodDef: function() {
    return [this.getFieldValue("NAME"), this.arguments_, false];
  },
  getVarModels: Blockly.Blocks["class_constructor"].getVarModels,
  renameVarById: Blockly.Blocks["class_constructor"].renameVarById,
  updateVarName: Blockly.Blocks["class_constructor"].updateVarName,
  displayRenamedVar_: Blockly.Blocks["class_constructor"].displayRenamedVar_,
  customContextMenu: Blockly.Blocks["class_constructor"].customContextMenu,
  callType_: "class_function_noreturn"
};
Blockly.Blocks["class_attribute"] = {
  init: function() {
    this.appendValueInput("NAME")
      .setCheck(null)
      .appendField("attribute");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.initColour();
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  },
  initColour: function() {
    if (this.mutatorParentBlock) {
      var currentBlock = this.mutatorParentBlock;
      var className = currentBlock.getClassDef();
      var classBlock = Blockly.Class.getClassByName(currentBlock.workspace, className);
      this.setColour(classBlock.getColour());
    } else {
      this.setColour(20);
    }
  }
};
Blockly.Blocks["class_mutator"] = {
  init: function() {
    this.appendDummyInput().appendField("class");
    this.appendStatementInput("STACK");
    this.appendDummyInput("CONSTR_INPUT")
      .appendField("Konstruktor")
      .appendField(new Blockly.FieldCheckbox("FALSE"), "CONSTR");
    this.initColour();
    this.setTooltip("");
    this.setHelpUrl("");
    this.contextMenu = false;
  },
  initColour: function() {
    var currentBlock = this.mutatorParentBlock;
    var className = currentBlock.getClassDef();
    var classBlock = Blockly.Class.getClassByName(currentBlock.workspace, className);
    this.setColour(classBlock.getColour());
  }
};
