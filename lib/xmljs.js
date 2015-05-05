exports.toJSON = function(xml) {
    var parseString = require('xml2js').parseString;

    parseString(xml, function(err, result) {
        var json;
        if (err) {
            console.error(err);
        } else {
            json = JSON.stringify(result['ti:app']);
            json = JSON.parse(json);
            console.dir(json.android);
        }
    });

};
