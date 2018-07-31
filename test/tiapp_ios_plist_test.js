var _ = require('lodash'),
    constants = require('constants'),
    fs = require('fs'),
    path = require('path'),
    should = require('should'),
    tiappXml = require('..'),
    U = require('../lib/util'),
    ROOT = process.cwd(),
    TMP = path.resolve('tmp'),
    INVALID_TIAPP_ARGS = [123,
        function () {},
        [1, 2, 3], true, false, NaN, Infinity, null
    ],
    TIAPP_XML = path.resolve('test', 'fixtures', 'tiapp.xml'),
    TIAPP_BAD_XML = path.resolve('test', 'fixtures', 'tiapp.bad.xml'),
    TESTFIND_END = path.resolve('test', 'fixtures', 'testfind', '1', '2', '3'),
    TESTFIND_TIAPP_XML = path.resolve('test', 'fixtures', 'testfind', 'tiapp.xml'),
    TIAPP_IOS_XML = path.resolve('test', 'fixtures', 'tiapp.ios.xml'),
    INVALID_XML = ['<WTF></WTFF>', '</elem>', 'badelem></badelem>'],
    VALID_XML = [];

// create temp folder
if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
}

// test suite
describe('Tiapp', function () {

    beforeEach(function () {
        process.chdir(ROOT);
    });

    describe('#Tiapp ios plist', function () {
        it('should load xml', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.load.xml');
            tiapp.id.should.equal('com.example.test');
            //as loaded
            should.exist(tiapp.ios);
            should.exist(tiapp.ios.teamId);
            should.exist(tiapp.ios.minIosVer);
            tiapp.write(tmpFile);
        });

        //read
        it('plist should be readable', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var item1 = tiapp.getIosPlist("NSCameraUsageDescription");
            var item2 = tiapp.getIosPlist("NSLocationWhenInUseUsageDescription");
            should.exist(item1);
            should.deepEqual(item1, "Can we use your camera?");
            should.exist(item2);
            should.deepEqual(item2, "We use your location to help find you on the map.");
        });

        //special case
        it('create bundle url types', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.bundletypes.xml');
            tiapp.createBundleURLTypes({
                CFBundleURLName: 'com.example.app',
                CFBundleURLSchemes: ['fbxxxxxxxxxxxxxx', 'changed']
            });
            var item = tiapp.getIosPlist("CFBundleURLTypes");
            tiapp.write(tmpFile);

            should.exist(item);
            should.deepEqual(item, [
                ['CFBundleURLName',
                    'com.example.app',
                    'CFBundleURLSchemes', ['fbxxxxxxxxxxxxxx', 'changed']
                ]
            ]);
        });

        //create
        it('an entitlement string can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.write.string.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test3';
            tiapp.createIosPlistItem(entitlementText, "applinks:app.example.com");
            var entitlement = tiapp.getIosPlist(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, "applinks:app.example.com");
            tiapp.write(tmpFile);
        });
        it('an array of entitlement strings can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.write.array.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test3';
            tiapp.createIosPlistItem(entitlementText, ["applinks:app.example.com", "applinks:app.example.com"]);
            var entitlement = tiapp.getIosPlist(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, ["applinks:app.example.com", "applinks:app.example.com"]);
            tiapp.write(tmpFile);
        });
        it('an entitlement boolean of true can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.write.true.xml');
            var entitlementText = 'wobble4';
            tiapp.createIosPlistItem(entitlementText, true);
            var entitlement = tiapp.getIosPlist(entitlementText);
            should.exist(entitlement);
            should.equal(entitlement, true);
            tiapp.write(tmpFile);
        });
        it('an entitlement boolean of false can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.write.false.xml');
            var entitlementText = 'wobble5';
            tiapp.createIosPlistItem(entitlementText, false);
            var entitlement = tiapp.getIosPlist(entitlementText);
            should.exist(entitlement);
            should.equal(entitlement, false);
            tiapp.write(tmpFile);
        });

        //set
        it('an entitlement string can be set with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.plist.set.string.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test';
            tiapp.setIosPlistItem(entitlementText, "applinks:set.piota.co.uk");
            var entitlement = tiapp.getIosPlist(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, "applinks:set.piota.co.uk");
            tiapp.write(tmpFile);
        });
    });
});