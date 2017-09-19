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

    describe('#Tiapp ios', function () {
        it('should load xml', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'ios.tiapp.xml');
            tiapp.id.should.equal('com.example.test');
            //as loaded
            should.exist(tiapp.ios);
            should.exist(tiapp.ios.teamId);
            should.exist(tiapp.ios.minIosVer);
            tiapp.write(tmpFile);
        });
        it('properties should be readable', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var teamId = tiapp.getIosProperty("team-id");
            var minVersion = tiapp.getIosProperty("min-ios-ver");
            teamId.should.equal("5G7A26NNNN");
            minVersion.should.equal("9.2");
        });
        it('supported properties should be writeable with factory method', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'updated-ios.tiapp.xml');
            tiapp.setIosProperty("team-id", "ABC123XY99");
            tiapp.setIosProperty("min-ios-ver", "11.0");
            var teamId = tiapp.getIosProperty("team-id");
            var minVersion = tiapp.getIosProperty("min-ios-ver");
            teamId.should.equal("ABC123XY99");
            minVersion.should.equal("11.0");
            tiapp.write(tmpFile);
        });
        it('supported properties should be writeable with dot notation', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'updated-ios-dot.tiapp.xml');
            tiapp.ios["team-id"] = "ABC123XY99";
            tiapp.ios["min-ios-ver"] = "11.0";
            var teamId = tiapp.getIosProperty("team-id");
            var minVersion = tiapp.getIosProperty("min-ios-ver");
            teamId.should.equal("ABC123XY99");
            minVersion.should.equal("11.0");
            tiapp.ios.teamId.should.equal("ABC123XY99");
            tiapp.ios["team-id"].should.equal("ABC123XY99");
            tiapp.ios.minIosVer.should.equal("11.0");
            tiapp.ios["min-ios-ver"].should.equal("11.0");
            tiapp.write(tmpFile);
        });
        it('supported properties should be writeable with camelized notation', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            var tmpFile = path.resolve('tmp', 'updated-ios-camelized.tiapp.xml');
            tiapp.ios.teamId = "ABC123XY9x";
            tiapp.ios.minIosVer = "12.0";
            var teamId = tiapp.getIosProperty("team-id");
            var minVersion = tiapp.getIosProperty("min-ios-ver");
            teamId.should.equal("ABC123XY9x");
            minVersion.should.equal("12.0");
            tiapp.ios.teamId.should.equal("ABC123XY9x");
            tiapp.ios["team-id"].should.equal("ABC123XY9x");
            tiapp.ios.minIosVer.should.equal("12.0");
            tiapp.ios["min-ios-ver"].should.equal("12.0");
            tiapp.write(tmpFile);
        });
        it('non supported properties should should not be updateable', function () {
            var tiappText = fs.readFileSync(TIAPP_IOS_XML, "utf8");
            var tiapp = tiappXml.parse(tiappText);
            tiapp.setIosProperty("team", "ABC123XY99");
            tiapp.setIosProperty("min-ios-version", "11.0");
            var teamId = tiapp.getIosProperty("team");
            var minVersion = tiapp.getIosProperty("min-ios-version");
            should.not.exist(teamId);
            should.not.exist(minVersion);
        });
    });
});