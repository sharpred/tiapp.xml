var _ = require('lodash'),
    constants = require('constants'),
    fs = require('fs'),
    path = require('path'),
    should = require('should'),
    tiappXml = require('..'),
    U = require('../lib/util');

var ROOT = process.cwd(),
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

    describe('#Tiapp ios entitlements', function () {
        it('should load xml', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.load.xml');
            tiapp.id.should.equal('com.example.test');
            //as loaded
            should.exist(tiapp.ios);
            should.exist(tiapp.ios.teamId);
            should.exist(tiapp.ios.minIosVer);
            tiapp.write(tmpFile);
        });

        //read
        it('entitlements should be readable', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.read.xml');
            var assocDomainEntitlement = tiapp.getIosEntitlement("com.apple.developer.associated-domains");
            should.exist(assocDomainEntitlement);
            should.deepEqual(assocDomainEntitlement, ["applinks:app.example.com"]);
            var assocDomainEntitlementTwo = tiapp.getIosEntitlement("com.apple.developer.associated-domains-test");
            should.exist(assocDomainEntitlementTwo);
            should.deepEqual(assocDomainEntitlementTwo, ["applinks:app.example.com", "applinks:app.example.com"]);
        });

        //create
        it('an entitlement string can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.write.string.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test3';
            tiapp.createIosEntitlement(entitlementText, "applinks:faith.piota.co.uk");
            var entitlement = tiapp.getIosEntitlement(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, "applinks:faith.piota.co.uk");
            tiapp.write(tmpFile);
        });
        it('an array of entitlement strings can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.write.array.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test3';
            tiapp.createIosEntitlement(entitlementText, ["applinks:faith.piota.co.uk", "applinks:app.example.com"]);
            var entitlement = tiapp.getIosEntitlement(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, ["applinks:faith.piota.co.uk", "applinks:app.example.com"]);
            tiapp.write(tmpFile);
        });
        it('an entitlement boolean of true can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.write.true.xml');
            var entitlementText = 'wobble4';
            tiapp.createIosEntitlement(entitlementText, true);
            var entitlement = tiapp.getIosEntitlement(entitlementText);
            should.exist(entitlement);
            should.equal(entitlement, true);
            tiapp.write(tmpFile);
        });
        it('an entitlement boolean of false can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.write.false.xml');
            var entitlementText = 'wobble5';
            tiapp.createIosEntitlement(entitlementText, false);
            var entitlement = tiapp.getIosEntitlement(entitlementText);
            should.exist(entitlement);
            should.equal(entitlement, false);
            tiapp.write(tmpFile);
        });

        //set
        it('an entitlement string can be created with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.entitlements.set.string.xml');
            var entitlementText = 'com.apple.developer.associated-domains-test';
            tiapp.setIosEntitlement(entitlementText, "applinks:set.piota.co.uk");
            var entitlement = tiapp.getIosEntitlement(entitlementText);
            should.exist(entitlement);
            should.deepEqual(entitlement, "applinks:set.piota.co.uk");
            tiapp.write(tmpFile);
        });
    });
});