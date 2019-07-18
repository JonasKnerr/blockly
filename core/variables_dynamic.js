/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Utility functions for handling variables dynamic.
 *
 * @author duzc2dtw@gmail.com (Du Tian Wei)
 */
"use strict";

goog.provide("Blockly.VariablesDynamic");

goog.require("Blockly.Variables");
goog.require("Blockly.Blocks");
goog.require("Blockly.constants");
goog.require("Blockly.VariableModel");
// TODO Fix circular dependencies
// goog.require('Blockly.Workspace');
goog.require("Blockly.Xml");

Blockly.VariablesDynamic.onCreateVariableButtonClick_String = function(button) {
  Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, "String");
};
Blockly.VariablesDynamic.onCreateVariableButtonClick_Number = function(button) {
  Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, "Number");
};
Blockly.VariablesDynamic.onCreateVariableButtonClick_Colour = function(button) {
  Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, "Colour");
};
/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML elements.
 */
Blockly.VariablesDynamic.flyoutCategory = function(workspace) {
  var classes = Blockly.Class.allUsedClasses(workspace);
  var xmlList = [];
  var button = document.createElement("button");
  button.setAttribute("text", Blockly.Msg["NEW_STRING_VARIABLE"]);
  button.setAttribute("callbackKey", "CREATE_VARIABLE_STRING");
  xmlList.push(button);
  button = document.createElement("button");
  button.setAttribute("text", Blockly.Msg["NEW_NUMBER_VARIABLE"]);
  button.setAttribute("callbackKey", "CREATE_VARIABLE_NUMBER");
  xmlList.push(button);
  button = document.createElement("button");
  button.setAttribute("text", Blockly.Msg["NEW_COLOUR_VARIABLE"]);
  button.setAttribute("callbackKey", "CREATE_VARIABLE_COLOUR");
  xmlList.push(button);

  workspace.registerButtonCallback(
    "CREATE_VARIABLE_STRING",
    Blockly.VariablesDynamic.onCreateVariableButtonClick_String
  );
  workspace.registerButtonCallback(
    "CREATE_VARIABLE_NUMBER",
    Blockly.VariablesDynamic.onCreateVariableButtonClick_Number
  );
  workspace.registerButtonCallback(
    "CREATE_VARIABLE_COLOUR",
    Blockly.VariablesDynamic.onCreateVariableButtonClick_Colour
  );

  for (var i = 0; i < classes.length; i++) {
    let className = classes[i];

    var objectButton = document.createElement("button");
    var buttonString = "Create " + className + " variable...";
    objectButton.setAttribute("text", buttonString);
    objectButton.setAttribute("callbackKey", className);
    workspace.registerButtonCallback(className, function(objectButton) {
      Blockly.Variables.createVariableButtonHandler(
        objectButton.getTargetWorkspace(),
        null,
        className
      );
    });
    xmlList.push(objectButton);
  }

  var blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.VariablesDynamic.flyoutCategoryBlocks = function(workspace) {
  var variableModelList = workspace.getAllVariables();
  variableModelList.sort(Blockly.VariableModel.compareByName);

  var varTypes = workspace.getVariableTypes();
  var xmlList = [];
  var primitive_type = false;
  for (var i = 0; i < varTypes.length; i++) {
    if (
      varTypes[i] == "Number" ||
      varTypes[i] == "String" ||
      varTypes[i] == "Colour" ||
      varTypes[i] == ""
    )
      primitive_type = true;

    var variableList = workspace.getVariablesOfType(varTypes[i]);
    if (variableList.length > 0) {
      var firstVariable = variableList[0];

      if (Blockly.Blocks["variables_set"]) {
        var blockText =
          "<xml>" +
          '<block type="variables_set" gap="' +
          8 +
          '">' +
          Blockly.Variables.generateVariableFieldXmlString(firstVariable) +
          "</block>" +
          "</xml>";
        var block = Blockly.Xml.textToDom(blockText).firstChild;
        xmlList.push(block);
      }

      if (Blockly.Blocks["variables_get"]) {
        var blockText =
          "<xml>" +
          '<block type="variables_get" gap="8">' +
          Blockly.Variables.generateVariableFieldXmlString(firstVariable) +
          "</block>" +
          "</xml>";
        var block = Blockly.Xml.textToDom(blockText).firstChild;
        xmlList.push(block);
      }

      if (primitive_type) {
        for (var j = 1, variable; (variable = variableList[j]); j++) {
          if (Blockly.Blocks["variables_get"]) {
            var blockText =
              "<xml>" +
              '<block type="variables_get" gap="8">' +
              Blockly.Variables.generateVariableFieldXmlString(variable) +
              "</block>" +
              "</xml>";
            var block = Blockly.Xml.textToDom(blockText).firstChild;
            xmlList.push(block);
          }
        }
      } else {
        for (var j = 0, variable; (variable = variableList[j]); j++) {
          var gap = 8;
          if (j == variableList.length - 1) {
            gap = 20;
          }

          if (Blockly.Blocks["object_variables_get"]) {
            var blockText =
              "<xml>" +
              '<block type="object_variables_get" gap="' +
              gap +
              '">' +
              Blockly.Variables.generateVariableFieldXmlString(variable) +
              "</block>" +
              "</xml>";
            var block = Blockly.Xml.textToDom(blockText).firstChild;
            xmlList.push(block);
          }
        }
      }
    }
  }
  return xmlList;
};
