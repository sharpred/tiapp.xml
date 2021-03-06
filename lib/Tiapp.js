var constants = require('./constants'),
    fs = require('fs'),
    pretty = require('pretty-data2').pd,
    U = require('./util'),
    xml = require('./xml'),
    _ = require("underscore");

function Tiapp(file, doc) {
    var self = this,
        android,
        ios,
        application,
        manifest;

    this.file = file;
    this.doc = doc;
    this.android = {
        application: {
            activities: []
        }
    };

    function getterSetter(xmlRoot, child) {
        var obj = child ? self[child] : self;
        return function (prop) {
            var topLevelObject = {
                get: function () {
                    //console.log("get", prop);
                    return xml.getTagText(xmlRoot, prop);
                },
                set: function (val) {
                    //console.log("set", prop, val);
                    xml.setNodeText(xml.ensureElement(xmlRoot, prop), val);
                }
            };

            // create property based on property name
            Object.defineProperty(obj, prop, topLevelObject);

            // see if we need a camel case version as well
            if (prop.indexOf('-') !== -1) {
                //console.log("dasherized ",  U.dashToCamelCase(prop));
                Object.defineProperty(obj, U.dashToCamelCase(prop), topLevelObject);
            }
        };
    }

    // set default doc for xml.js
    xml.doc = this.doc;
    //default items
    android = getItem(self.doc.documentElement, "android");
    if (!android) {
        android = self.doc.createElement("android");
    }
    manifest = getItem(self.doc.documentElement, "manifest");
    if (!manifest) {
        manifest = self.doc.createElement("manifest");
    }
    xml.ensureElement(android, "manifest");
    application = getItem(self.doc.documentElement, "application");
    if (!application) {
        application = self.doc.createElement("application");
    }
    xml.ensureElement(manifest, "application");

    //ios
    this.ios = {

    };
    ios = getItem(self.doc.documentElement, "ios");
    if (!ios) {
        ios = self.doc.createElement("ios");
    }


    // create top-level element getters/setters
    var topLevelGetterSetter = getterSetter(self.doc.documentElement);
    constants.topLevelElements.forEach(topLevelGetterSetter);

    var iosGetterSetter = getterSetter(ios, "ios");
    ["min-ios-ver", "team-id", "default-background-color", "enable-launch-screen-storyboard"].forEach(iosGetterSetter);

    // create android manifest attribute getters / setters in the form tiapp.android.versionCode etc.
    constants.androidManifestElements.forEach(function (prop) {
        var topLevelObject,
            attributeString,
            element,
            parent;
        if (prop.attribute !== "package") {
            attributeString = "android:" + prop.attribute;
        } else {
            attributeString = prop.attribute;
        }
        topLevelObject = {
            get: function () {
                var attr;
                element = getItem(self.doc.documentElement, prop.element);
                if (element) {
                    attr = element.getAttribute(attributeString);
                    if (attr) {
                        return attr;
                    }
                }
            },
            set: function (val) {
                parent = getItem(self.doc.documentElement, prop.parent);
                element = getItem(self.doc.documentElement, prop.element);
                if (!parent) {
                    parent = self.doc.createElement(prop.parent);
                }
                if (!element) {
                    //create the element and then add the attribute
                    element = self.doc.createElement(prop.element);
                    element.setAttribute(attributeString, val);
                    parent.appendChild(element);
                } else {
                    element.setAttribute(attributeString, val);
                }
            }
        };
        Object.defineProperty(self.android, prop.attribute, topLevelObject);
        // see if we need a camel case version as well
        if (prop.attribute.indexOf('-') !== -1) {
            Object.defineProperty(self.android, U.dashToCamelCase(prop.attribute), topLevelObject);
        }
    });
}

Tiapp.prototype.toString = function toString() {
    return pretty.xml(xml.nodeToString(this.doc));
};

Tiapp.prototype.write = function write(file) {
    file = file || this.file;
    fs.writeFileSync(file, this.toString());
};

Tiapp.prototype.getDeploymentTarget = function getDeploymentTarget(platform) {
    if (!platform) {
        return this.getDeploymentTargets();
    }

    // make sure we have <deployment-targets>
    var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
    if (!targetsContainer) {
        return null;
    }

    // get the <target>
    var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
    if (target) {
        return xml.getNodeText(target) === 'true' ? true : false;
    }
    return null;
};

Tiapp.prototype.getAndroidUsesPermissions = function getAndroidUserPermissions() {
    var permissions = getPermissions(this.doc.documentElement);
    if (permissions) {
        return permissions;
    }
};

Tiapp.prototype.setAndroidPermissions = function setAndroidPermissions(permission) {
    var permissions,
        element,
        manifest;
    permissions = getPermissions(this.doc.documentElement);
    manifest = getItem(this.doc.documentElement, "manifest");
    if (permission.name && permissions) {
        //add a new element if it does not exist
        if (permissions.indexOf(permission.name) === -1) {
            element = this.doc.createElement("uses-permission");
            element.setAttribute('android:name', permission.name);
            if (permission.maxSdkVersion) {
                element.setAttribute('android:maxSdkVersion', permission.maxSdkVersion);
            }
            manifest.appendChild(element);
        }
    }

};

Tiapp.prototype.setAndroidManifestVersion = function setAndroidManifestVersion(codeVersion, version) {
    var permissions,
        manifest;
    permissions = getPermissions(this.doc.documentElement);
    manifest = getItem(this.doc.documentElement, "manifest");
    manifest.setAttribute('android:versionCode', codeVersion);
    manifest.setAttribute('android:versionName', version);
};

Tiapp.prototype.createAndroidActivity = function createAndroidActivity(item) {
    var manifest = getItem(this.doc.documentElement, "manifest"),
        application = xml.ensureElement(manifest, "application"),
        activity = this.doc.createElement("activity"),
        newObj = {};
    application.appendChild(activity);
    _.each(item, function (obj, key) {
        //just allow valid attributes
        if (constants.activityAttributes.indexOf(key) !== -1) {
            activity.setAttribute("android:" + key, obj);
            newObj[key] = obj;
        }
    });
    this.android.application.activities.push(newObj);
};

Tiapp.prototype.readAndroidActivity = function readAndroidActivity(item) {
    var elem,
        attr,
        android,
        manifest,
        application,
        activities,
        newObj = {},
        rtn,
        objects = [];
    try {
        manifest = getItem(this.doc.documentElement, "manifest");
        application = xml.ensureElement(manifest, "application");
        activities = xml.getAllElementsByTagName(application, "activity");
        //console.log(item);
        if (activities) {
            for (var i = 0, len = activities.length; i < len; i++) {
                newObj = {},
                    elem = activities.item(i);
                if (elem) {
                    constants.activityAttributes.forEach(function (constant) {
                        var key = "android:" + constant;
                        attr = elem.getAttribute(key);
                        if (attr) {
                            newObj[key] = attr;
                        }
                    });
                }
                objects.push(newObj);
            }
        }
    } catch (ex) {
        console.error(ex);
    } finally {
        //console.log(objects);
        //console.log("****");
        rtn = objects.filter(function (obj) {
            if (obj['android:name'] === item.name) {
                return obj;
            }
        })[0];
        //console.log(rtn);
        return rtn;
    }
}

Tiapp.prototype.getDeploymentTargets = function getDeploymentTargets() {
    // make sure we have <deployment-targets>
    var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
    if (!targetsContainer) {
        return null;
    }

    // create results object from <target> elements
    var results = {},
        targets = targetsContainer.getElementsByTagName('target');
    for (var i = 0,
            len = targets.length; i < len; i++) {
        var target = targets.item(i);
        results[target.getAttribute('device')] = xml.getNodeText(target) === 'true';
    }

    return results;
};

Tiapp.prototype.setDeploymentTarget = function setDeploymentTarget(platform, value) {
    if (!platform) {
        return;
    }
    if (U.isObject(platform)) {
        //jshint ignore:start
        return setDeploymentTargets(platform);
        //jshint ignore:end
    }

    var targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets');

    var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
    if (target) {
        xml.setNodeText(target, value.toString());
    } else {
        addTarget(this.doc, targetsContainer, platform, !!value);
    }
};

Tiapp.prototype.setDeploymentTargets = function setDeploymentTargets(obj) {
    if (!obj) {
        return;
    }

    var self = this,
        targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets');

    // remove all existing <target> elements
    xml.removeAllChildren(targetsContainer);

    // create new <target> elements from object keys
    Object.keys(obj).forEach(function (key) {
        addTarget(self.doc, targetsContainer, key, !!obj[key]);
    });
};

Tiapp.prototype.getProperty = function getProperty(name) {
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        var value = xml.getNodeText(property),
            type = property.hasAttribute('type') ? property.getAttribute('type') : 'string';

        // convert value based on type
        if (type === 'bool') {
            value = value === 'true';
        } else if (type === 'int') {
            value = parseInt(value, 10);
        } else if (type === 'double') {
            value = parseFloat(value);
        }

        return value;
    }
    return null;
};

Tiapp.prototype.setProperty = function (name, value, type) {
    if (!name) {
        throw new Error('name must be defined');
    }
    if (value === null) {
        value = '';
    }

    // try to update existing property element
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        if (type) {
            property.setAttribute('type', type);
        }
        xml.setNodeText(property, value.toString());
        return;
    }

    // create a new property
    var elem = this.doc.createElement('property');
    elem.setAttribute('name', name);
    if (type) {
        elem.setAttribute('type', type);
    }
    elem.appendChild(this.doc.createTextNode(value.toString()));
    this.doc.documentElement.appendChild(elem);
};

Tiapp.prototype.removeProperty = function removeProperty(name) {
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        this.doc.documentElement.removeChild(property);
    }
};

Tiapp.prototype.getModules = function getModules() {
    return getItems(this.doc.documentElement, 'module');
};

Tiapp.prototype.setModule = function setModule(id, version, platform) {
    if (U.isObject(version)) {
        var opts = version;
        platform = opts.platform;
        version = opts.version;
    }

    setItem(this.doc.documentElement, 'module', id, version, platform);
};

Tiapp.prototype.removeModule = function removeModule(id, platform) {
    removeItem(this.doc.documentElement, 'module', id, platform);
};

Tiapp.prototype.getPlugins = function getPlugins() {
    return getItems(this.doc.documentElement, 'plugin');
};

Tiapp.prototype.setPlugin = function setPlugin(id, version) {
    setItem(this.doc.documentElement, 'plugin', id, version);
};

Tiapp.prototype.removePlugin = function removePlugin(id) {
    removeItem(this.doc.documentElement, 'plugin', id);
};

Tiapp.prototype.getIosProperty = function (property) {
    var ios = getItem(this.doc.documentElement, "ios");
    try {
        return ios.getElementsByTagName(property)[0].childNodes[0].nodeValue;
    } catch (ex) {
        return;
    }

};

Tiapp.prototype.setIosProperty = function (property, val) {
    var ios,
        item,
        supportedProperties = ["team-id", "min-ios-ver"];
    try {
        if (supportedProperties.indexOf(property) !== -1) {
            ios = getItem(this.doc.documentElement, "ios");
            item = ios.getElementsByTagName(property)[0];
            xml.setNodeText(item, val);
        }
    } catch (ex) {
        console.error("could not update property ", property);
        console.error(ex);
    }

};

Tiapp.prototype.getIosEntitlement = function (property) {
    var key,
        obj = {},
        entitlements,
        dict,
        items;
    try {
        //array has keys in first pos and values in second, so build an object of them
        entitlements = getItem(this.doc.documentElement, "entitlements");
        dict = getItem(entitlements, "dict");
        items = getEntitlements(dict);
        items.forEach(function (item, idx) {
            if (idx % 2 !== 1) {
                key = item;
            } else {
                obj[key] = item;
            }
        });
        return obj[property];
    } catch (ex) {
        console.error(ex);
        return;
    }
};

Tiapp.prototype.setIosEntitlement = function (property, val) {
    var key,
        obj = {},
        entitlements,
        dict,
        that = this,
        items;
    try {
        //array has keys in first pos and values in second, so build an object of them
        entitlements = getItem(this.doc.documentElement, "entitlements");
        dict = getItem(entitlements, "dict");
        items = getEntitlements(dict);
        items.forEach(function (item, idx) {
            if (idx % 2 !== 1) {
                key = item;
            } else {
                obj[key] = item;
            }
        });
        obj[property] = val;
        //remove dict and re-add it
        entitlements.removeChild(dict);
        dict = xml.ensureElement(entitlements, "dict");
        _.each(obj, function (val, key) {
            that.createIosEntitlement(key, val);
        })
    } catch (ex) {
        console.error(ex);
        return;
    }
}

Tiapp.prototype.createIosEntitlement = function (property, val) {
    //check that entitlements node exists
    var that,
        ios,
        dict,
        key,
        arr,
        entitlements;
    //console.log(`create ${property} ${val}`);
    ios = xml.ensureElement(this.doc.documentElement, "ios");
    entitlements = xml.ensureElement(ios, "entitlements");
    dict = xml.ensureElement(entitlements, "dict");
    key = this.doc.createElement("key");
    xml.setNodeText(key, property);
    dict.appendChild(key);
    if (_.isArray(val)) {
        arr = this.doc.createElement("array");
        that = this;
        val.forEach(function (item) {
            var strElement = that.doc.createElement("string");
            xml.setNodeText(strElement, item);
            arr.appendChild(strElement);
        });
        dict.appendChild(arr);
        return;
    }
    if (_.isString(val)) {
        var strElement = this.doc.createElement("string");
        xml.setNodeText(strElement, val);
        dict.appendChild(strElement);
        return;
    }
    if (_.isBoolean(val)) {
        var str = val === true ? "true" : "false",
            strElement = this.doc.createElement(str);
        dict.appendChild(strElement);
        return;
    }
};

Tiapp.prototype.getIosPlist = function (property) {
    var key,
        obj = {},
        lists,
        dict,
        items;
    try {
        //array has keys in first pos and values in second, so build an object of them
        lists = getItem(this.doc.documentElement, "plist");
        dict = getFirstItem(lists, "dict");
        items = getEntitlements(dict);
        items.forEach(function (item, idx) {
            if (idx % 2 !== 1) {
                key = item;
            } else {
                obj[key] = item;
            }
        });
        return obj[property];
    } catch (ex) {
        console.error(ex);
        return;
    }
};

Tiapp.prototype.createBundleURLTypes = function (obj) {
    try {
        let lists,
            mainDict,
            dict,
            key1,
            key2,
            key3,
            str,
            arr1,
            arr2;

        if (Object.keys(obj).indexOf("CFBundleURLName") === -1) {
            throw new Error("no CFBundleURLName");
        }
        if (Object.keys(obj).indexOf("CFBundleURLSchemes") === -1) {
            throw new Error("no CFBundleURLSchemes");
        }

        lists = getItem(this.doc.documentElement, "plist");
        mainDict = getFirstItem(lists, "dict");

        key1 = this.doc.createElement("key");
        xml.setNodeText(key1, "CFBundleURLTypes");

        mainDict.appendChild(key1);

        arr1 = this.doc.createElement("array");
        dict = this.doc.createElement("dict");

        key2 = this.doc.createElement("key");
        xml.setNodeText(key2, "CFBundleURLName");
        dict.appendChild(key2);

        str = this.doc.createElement("string");
        xml.setNodeText(str, obj["CFBundleURLName"]);
        dict.appendChild(str);

        key3 = this.doc.createElement("key");
        xml.setNodeText(key3, "CFBundleURLSchemes");
        dict.appendChild(key3);

        arr2 = this.doc.createElement("array");
        obj["CFBundleURLSchemes"].forEach(item => {
            let str = this.doc.createElement("string");
            xml.setNodeText(str, item);
            arr2.appendChild(str);
        });
        dict.appendChild(arr2);
        arr1.appendChild(dict);

        mainDict.appendChild(arr1);

        return true;
    } catch (ex) {
        console.error(ex);
        return;
    }
}

Tiapp.prototype.setIosPlistItem = function (property, val) {
    var key,
        obj = {},
        lists,
        dict,
        that = this,
        items;
    try {
        //array has keys in first pos and values in second, so build an object of them
        lists = getItem(this.doc.documentElement, "plist");
        dict = getFirstItem(lists, "dict");
        items = getEntitlements(dict);
        items.forEach(function (item, idx) {
            //console.log(item, idx);
            if (idx % 2 !== 1) {
                key = item;
            } else {
                obj[key] = item;
            }
        });
        obj[property] = val;
        //remove dict and re-add it
        lists.removeChild(dict);
        dict = xml.ensureFirstElement(lists, "dict");
        _.each(obj, function (val, key) {
            that.createIosPlistItem(key, val);
        })
    } catch (ex) {
        console.error(ex);
        return;
    }
};

Tiapp.prototype.createIosPlistItem = function (property, val) {
    //check that entitlements node exists
    var that,
        ios,
        dict,
        key,
        arr,
        plistItems;
    //console.log(`create ${property} ${val}`);
    ios = xml.ensureElement(this.doc.documentElement, "ios");
    plistItems = xml.ensureElement(ios, "plist");
    dict = xml.ensureFirstElement(plistItems, "dict");
    key = this.doc.createElement("key");
    xml.setNodeText(key, property);
    dict.appendChild(key);
    if (_.isArray(val)) {
        arr = this.doc.createElement("array");
        that = this;
        val.forEach(function (item) {
            var strElement = that.doc.createElement("string");
            xml.setNodeText(strElement, item);
            arr.appendChild(strElement);
        });
        dict.appendChild(arr);
        return;
    }
    if (_.isString(val)) {
        var strElement = this.doc.createElement("string");
        xml.setNodeText(strElement, val);
        dict.appendChild(strElement);
        return;
    }
    if (_.isBoolean(val)) {
        var str = val === true ? "true" : "false",
            strElement = this.doc.createElement(str);
        dict.appendChild(strElement);
        return;
    }
};

module.exports = Tiapp;

// helpers

function shouldIgnoreNode(node) {
    //ignore text nodes (3), cdata (4) and comments (8)
    return node.nodeType === 3 ||
        node.nodeType === 4 ||
        node.nodeType === 8;
}

function getEntitlements(node) {
    var newArr = [],
        child;
    if (!node || !node.childNodes || node.childNodes.length === 0) {
        return newArr;
    }
    //console.log("child nodes ", node.childNodes.length);
    for (var i = 0; i < node.childNodes.length; i++) {
        child = node.childNodes[i];
        if (!shouldIgnoreNode(child)) {
            //console.log("child node ", child.nodeName);
            switch (child.nodeName) {
                case "key":
                    //console.log("key val", child.childNodes[0].nodeValue);
                    newArr.push(child.childNodes[0].nodeValue);
                    break;
                case "dict":
                    var temp = getEntitlements(child);
                    newArr.push(temp);
                    break;
                case "array":
                    var temp = getEntitlements(child);
                    newArr.push(temp);
                    break;
                case "string":
                    newArr.push(child.childNodes[0].nodeValue);
                    break;
                case "true":
                    newArr.push(true);
                    break;
                case "false":
                    newArr.push(false);
                    break;
                default:
                    //there is no default
                    break;
            }
        }
    }
    return newArr;
}

function getPermissions(doc) {
    var manifest = getItem(doc, "manifest"),
        tags = ["uses-permission"],
        result = [];
    tags.forEach(function (tag) {
        var attr = "android:name",
            elems = xml.getAllElementsByTagName(manifest, tag);
        if (elems) {
            for (var i = 0,
                    len = elems.length; i < len; i++) {
                var elem = elems.item(i);
                result.push(elem.getAttribute(attr));
            }
        }
    });
    return result;
}

function addTarget(doc, container, platform, value) {
    var elem = doc.createElement('target');
    elem.setAttribute('device', platform);
    elem.appendChild(doc.createTextNode(value.toString()));
    container.appendChild(elem);
}

function getItem(node, itemName) {
    return xml.getLastElement(node, itemName);
}

function getFirstItem(node, itemName) {
    return xml.getFirstElement(node, itemName);
}

function getItems(node, itemName) {
    //this pluralisation does not work for non plural entries such as found in android manifest
    var groupName = itemName + 's',
        results = [];
    var group = xml.getLastElement(node, groupName);
    if (!group) {
        return results;
    }

    var items = group.getElementsByTagName(itemName);
    for (var i = 0,
            len = items.length; i < len; i++) {
        var item = items.item(i),
            result = {
                id: xml.getNodeText(item)
            };

        if (item.hasAttribute('version')) {
            result.version = item.getAttribute('version');
        }
        if (item.hasAttribute('platform')) {
            result.platform = item.getAttribute('platform');
        }
        results.push(result);
    }

    return results;
}

function setItem(node, itemName, id, version, platform) {
    if (!id) {
        return;
    }

    var groupName = itemName + 's',
        group = xml.ensureElement(node, groupName),
        items = group.getElementsByTagName(itemName),
        found = false;

    // try to update an existing module entry
    for (var i = 0,
            len = items.length; i < len; i++) {
        var item = items.item(i);
        if (xml.getNodeText(item) === id && ((!item.hasAttribute('platform') && !platform) || (item.getAttribute('platform') === platform))) {
            if (version) {
                item.setAttribute('version', version.toString());
            } else {
                item.removeAttribute('version');
            }
            found = true;
        }
    }

    // if it's not an update, create a new module entry
    if (!found) {
        var elem = node.ownerDocument.createElement(itemName);
        if (platform) {
            elem.setAttribute('platform', platform);
        }
        if (version) {
            elem.setAttribute('version', version.toString());
        }
        elem.appendChild(node.ownerDocument.createTextNode(id));
        group.appendChild(elem);
    }
}

function removeItem(node, itemName, id, platform) {
    if (!id) {
        return;
    }

    var groupName = itemName + 's',
        group = xml.ensureElement(node, groupName),
        items = group.getElementsByTagName(itemName);

    for (var i = items.length - 1; i >= 0; i--) {
        var item = items.item(i);
        if (xml.getNodeText(item) === id && ((!item.hasAttribute('platform') && !platform) || (item.getAttribute('platform') === platform))) {
            group.removeChild(item);
        }
    }
}