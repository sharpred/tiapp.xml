var constants = require('./constants'),
    U = require('./util');
function Tiapp() {
    var android = {},
        tlo = {
        get : function() {
        },
        set : function() {
        }
    };
    self.android = android;
    constants.androidElements.forEachElement(function(element) {
        Object.defineProperty(self.android, prop['name'], tlo);
        // see if we need a camel case version as well
        if (prop.indexOf('-') !== -1) {
            Object.defineProperty(self.android, U.dashToCamelCase(prop['name']), tlo);
        }
    });
}
var tiapp = new Tiapp();

console.log(JSON.stringify(tiapp));