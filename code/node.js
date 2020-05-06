'use strict';

/***********************************************************************************
************************************ MIT License ***********************************
************************************************************************************
Copyright 2018 Gabor Szauer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***********************************************************************************/

// TODO: documentation

var N_EnableAsserts = true;

function N_AssertHelper(condition, message) {
	if (!N_EnableAsserts) {
		return;
	}

	if (!condition) {
		message = message || "Assertion failed";
		console.log("Assertion: " + message);

		if( typeof N_AssertHelper.counter == 'undefined' ) {
			N_AssertHelper.counter = 0;
		}
		if (N_AssertHelper.counter < 5) {
			alert(message);
		}
		N_AssertHelper.counter++;

		
		if (typeof Error !== "undefined") {
			throw new Error(message);
		}
		throw message;
	}
}

function N_AssertIsNode(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		N_AssertHelper(false, "N_AssertIsNode, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (typeof variable.name == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, variable.name was undefined\n" + message);
		}
		else {
			N_AssertIsString(variable.name, "N_AssertIsNode, Expecting name to be string\n" + message);
		}

		if (typeof variable.localTransform == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, variable.localTransform was undefined\n" + message);
		}
		else {
			N_AssertIsTransform(variable.localTransform, "N_AssertIsNode, Expecting localTransform to be transform\n" + message);
		}

		if (typeof variable.worldTransform == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, variable.worldTransform was undefined\n" + message);
		}
		else if (variable.worldTransform == null) {
			// That's ok, this is optional
		}
		else {
			N_AssertIsTransform(variable.worldTransform, "N_AssertIsNode, Expecting worldTransform to be null or transform\n" + message);
		}

		if (typeof variable.worldTransformDirty == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, variable.worldTransformDirty was undefined\n" + message);
		}
		else {
			N_AssertIsBool(variable.worldTransformDirty, "N_AssertIsNode, Expecting worldTransformDirty to be bool\n" + message);
		}

		if (typeof variable.parent == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, variable.parent was undefined\n" + message);
		}
		else if (variable.parent == null) {
			// That's ok, this is optional
		}
		else {
			N_AssertIsNode(variable.parent, "N_AssertIsNode, Expecting parent to be null or node\n" + message);
		}

		if (typeof variable.children == "undefined") {
			N_AssertHelper(false, "N_AssertIsNode, children are not defines\n" + message);
		}
		else if (variable.children != null) {
			if (variable.children.constructor === Array) {
				const childCount = variable.children.length;
				for (var i = 0; i < childCount; ++i) {
					N_AssertIsNode(variable.children[i], "N_AssertIsNode, All children should be nodes\n" + message);
				}
			}
			else {
				N_AssertHelper(false, "N_AssertIsNode, children are not an array\n" + message);
			}
		}
		else {
			N_AssertHelper(false, "N_AssertIsNode, children are null, should be array\n" + message);
		}

	}
	else {
		N_AssertHelper(false, "N_AssertIsNode, argument is null\n" + message);
	}
}

function N_AssertIsString(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	message = message || "N/A";
	
	if (variable == null) {
		N_AssertHelper(false, "N_AssertIsString: argument is null \n" + message);
	}
	else if (typeof variable != "string") {
		N_AssertHelper(false, "N_AssertIsString: argument is not a string \n" + message);
	}
}

function N_AssertIsBool(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	message = message || "N/A";
	
	if (variable == null) {
		N_AssertHelper(false, "N_AssertIsBool: argument is null \n" + message);
	}
	else if (typeof variable != "boolean") {
		N_AssertHelper(false, "N_AssertIsBool: argument is not a boolean \n" + message);
	}
}

function N_AssertIsTransform(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	TS_AssertIsTransform(variable, message);
}

function N_AssertIsVector3(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	V3_AssertIsVector3(variable, message);
}

function N_AssertIsQuaternion(variable, message) {
	if (!N_EnableAsserts) {
		return;
	}
	Q_AssertIsQuaternion(variable, message);
}

function N_New(optionalName, optionalTransform) {
	if (typeof optionalName == "undefined") {
		optionalName = "Node";
	}
	if (typeof optionalTransform == "undefined") {
		optionalTransform = TS_New();
	}
	N_AssertIsString(optionalName, "N_New, expected first argument to be a string");
	N_AssertIsTransform(optionalTransform, "N_New, optional transform is expected to be a transform");
	
	const result = {
		name: optionalName,
		localTransform: optionalTransform,
		worldTransform: null,
		worldTransformDirty: true,
		parent: null,
		children: []
	}

	return result;
}

function N_GetWorldTransform(node) {
	N_AssertIsNode(node, "N_RecalculateWorldTransform, expected argument to be a node");

	if (!node.worldTransformDirty) {
		for (var iterator = node; iterator != null; iterator = iterator.parent) {
			if (iterator.worldTransformDirty) {
				node.worldTransformDirty = true;
				break;
			}
		}
	}

	if (node.worldTransformDirty || node.worldTransform == null) {
		node.worldTransform = TS_Copy(node.localTransform);
		for (var iterator = node.parent; iterator != null; iterator = iterator.parent) {
			node.worldTransform = TS_Combine(node.worldTransform, N_GetWorldTransform(iterator.parent));
		}
	}

	return node.worldTransform;
}

function N_GetWorldMatrix(node) {
	N_AssertIsNode(node, "N_GetWorldMatrix, expected argument to be a node");

	const worldTransform = N_GetWorldTransform(node);

	const x = V3_Scale(Q_Rotate(worldTransform.rotation, [1, 0, 0]), worldTransform.scale[0])
	const y = V3_Scale(Q_Rotate(worldTransform.rotation, [0, 1, 0]), worldTransform.scale[1])
	const z = V3_Scale(Q_Rotate(worldTransform.rotation, [0, 0, 1]), worldTransform.scale[2])
	const t = worldTransform.position;

	return [
		x[0], x[1], x[2], 0,
		y[0], y[1], y[2], 0,
		z[0], z[1], z[2], 0,
		t[0], t[1], t[2], 1
	]
}

function N_GetWorldPosition(node) {
	N_AssertIsNode(node, "N_GetWorldPosition, expected argument to be a node");
	const worldTransform = N_GetWorldTransform(node);
	return [
		worldTransform.position[0],
		worldTransform.position[1],
		worldTransform.position[2]
	]
}

function N_GetWorldRotation(node) {
	N_AssertIsNode(node, "N_GetWorldRotation, expected argument to be a node");
	const worldTransform = N_GetWorldTransform(node);
	return [
		worldTransform.rotation[0],
		worldTransform.rotation[1],
		worldTransform.rotation[2],
		worldTransform.rotation[3]
	]
}
function N_GetWorldScale(node) {
	N_AssertIsNode(node, "N_GetWorldScale, expected argument to be a node");
	const worldTransform = N_GetWorldTransform(node);
	return [
		worldTransform.scale[0],
		worldTransform.scale[1],
		worldTransform.scale[2]
	]
}

function N_GetLocalPosition(node) {
	N_AssertIsNode(node, "N_GetLocalPosition, expected argument to be a node");
	return [
		node.localTransform.position[0],
		node.localTransform.position[1],
		node.localTransform.position[2]
	]
}

function N_GetLocalRotation(node) {
	N_AssertIsNode(node, "N_GetLocalRotation, expected argument to be a node");
	return [
		node.localTransform.rotation[0],
		node.localTransform.rotation[1],
		node.localTransform.rotation[2],
		node.localTransform.rotation[3]
	]
}
function N_GetLocalScale(node) {
	N_AssertIsNode(node, "N_GetLocalScale, expected argument to be a node");
	return [
		node.localTransform.scale[0],
		node.localTransform.scale[1],
		node.localTransform.scale[2]
	]
}

function N_MarkWorldTransformDirty(node) {
	N_AssertIsNode(node, "N_MarkWorldTransformDirty: expecting argument to be node");

	var childList = [node]
	while(childList.length > 0) {
		var iterator = childList[childList.length - 1];
		childList.pop();

		iterator.worldTransformDirty = true;

		const numChildren = iterator.children.length;
		for (var i = 0; i < numChildren; ++i) {
			childList.push(iterator.children[i]);
		}
	}
}

function N_SetWorldSRT(node, scale, rotation, translation) {
	N_AssertIsNode(node, "N_SetWorldSRT: expecting argument to be node");
	N_AssertIsVector3(translation, "N_SetWorldSRT: expecting translation to be a vec3")
	N_AssertIsQuaternion(rotation, "N_SetWorldSRT: expecting rotation to be a quat")
	N_AssertIsVector3(scale, "N_SetWorldSRT: expecting scale to be a vec3")

	// if node has no parent, local & world transform will be the same
	node.localTransform = TS_New(translation, rotation, scale);
		
	if (node.parent != null) {
		const worldParent = N_GetWorldTransform(node.parent);
		const invWorldParent = TS_GetInverse(worldParent);

		const desiredWorldXForm = TS_New(translation, srotation, scale);
		node.localTransform = TS_Combine(desiredWorldXForm, invWorldParent);
	}

	N_MarkWorldTransformDirty(node);
}

function N_SetWorldPosition(node, position) {
	N_AssertIsNode(node, "N_SetWorldPosition: expecting argument to be node");
	N_AssertIsVector3(translation, "N_SetWorldPosition: expecting position to be a vec3")
	const worldTransform = N_GetWorldTransform(node);
	N_SetWorldSRT(node, worldTransform.scale, worldTransform.rotation, position);
}

function N_SetWorldRotation(node, rotation) {
	N_AssertIsNode(node, "N_SetWorldRotation: expecting argument to be node");
	N_AssertIsQuaternion(rotation, "N_SetWorldRotation: expecting rotation to be a quat")
	const worldTransform = N_GetWorldTransform(node);
	N_SetWorldSRT(node, worldTransform.scale, rotation, worldTransform.position);
}

function N_SetWorldScale(node, scale) {
	N_AssertIsNode(node, "N_SetWorldScale: expecting argument to be node");
	N_AssertIsVector3(scale, "N_SetWorldScale: expecting scale to be a vec3")
	const worldTransform = N_GetWorldTransform(node);
	N_SetWorldSRT(node, scale, worldTransform.rotation, worldTransform.position);
}

function N_SetLocalPosition(node, position) {
	N_AssertIsNode(node, "N_SetLocalPosition: expecting argument to be node");
	N_AssertIsVector3(translation, "N_SetLocalPosition: expecting position to be a vec3")
	node.localTransform.position = [
		position[0],
		position[1],
		position[2]
	]
	N_MarkWorldTransformDirty(node);
}

function N_SetLocalRotation(node, rotation) {
	N_AssertIsNode(node, "N_SetLocalRotation: expecting argument to be node");
	N_AssertIsQuaternion(rotation, "N_SetLocalRotation: expecting rotation to be a quat")
	node.localTransform.rotation = [
		rotation[0],
		rotation[1],
		rotation[2],
		rotation[3]
	]
	N_MarkWorldTransformDirty(node);
}

function N_SetLocalScale(node, scale) {
	N_AssertIsNode(node, "N_SetLocalScale: expecting argument to be node");
	N_AssertIsVector3(scale, "N_SetLocalScale: expecting scale to be a vec3")
	node.localTransform.scale = [
		scale[0],
		scale[1],
		scale[2]
	]
	N_MarkWorldTransformDirty(node);
}

function N_TransformPoint(node, point) {
	N_AssertIsNode(node, "N_TransformPoint: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
	return TS_TransformPoint(worldTransform, point);
}

function N_UnTransformPoint(node, point) { 
	N_AssertIsNode(node, "N_UnTransformPoint: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
	return TS_UnTransformPoint(worldTransform, point);
}

function N_TransformOrientation(node, orientation) {
	N_AssertIsNode(node, "N_TransformPoint: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
}

function N_UnTransformOrientation(node, orientation) { 
	N_AssertIsNode(node, "N_UnTransformOrientation: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
	TS_UnTransformOrientation(worldTransform, orientation);
}

function N_TransformRotation(node, rotation) {
	N_AssertIsNode(node, "N_UnTransformOrientation: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
	TS_TransformRotation(worldTransform, orientation);
}

function N_UnTransformRotation(node, rotation) {
	N_AssertIsNode(node, "N_UnTransformOrientation: expecting argument to be node");

	const worldTransform = N_GetWorldTransform(node);
	TS_UnTransformRotation(worldTransform, orientation);
}

function N_SetParent(node, parent) { // Maintain global position by default
	N_SetParentMaintainingGlobalPosition(node, parent);
}

function N_AddChildIgnoringGlobalPosition(parent, child) {
	N_SetParentIgnoringGlobalPosition(child, parent);
}

function N_AddChildMaintainingGlobalPosition(parent, child) {
	N_SetParentMaintainingGlobalPosition(child, parent);
}

function N_AddChild(child, parent) { // Maintain global position by default
	N_SetParentMaintainingGlobalPosition(child, parent);
}

function N_SetParentIgnoringGlobalPosition(node, parent) {
	// TODO
}

function N_SetParentMaintainingGlobalPosition(node, parent) {
	// TODO
}