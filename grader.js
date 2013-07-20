#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://secure-gorge-1080.herokuapp.com/";
var URL_FILENAME_DEFAULT = "url.html";
//var urlname = URL_DEFAULT;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


var getUrl = function(infile) {
    var instr = infile.toString();
    return instr; // no error checking...better get the URL right
};

var buildfn = function(urlfile,checksfile) {
    var response2file = function(result, response) {
//	console.log('in response2file');
	if (result instanceof Error) {
	    console.log('Error: ' + util.format(response.message));
	} else {
//	    console.log("Wrote URL to file: %s", urlfile);
	fs.writeFileSync(urlfile, result);
	console.log(JSON.stringify(checkHtmlFile(urlfile,checksfile),null,4));
//	return urlfile;    
	}
    };
    return response2file;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var checkUrl = function(urlname,checksfile) {
    var urlHtmlfilename = URL_FILENAME_DEFAULT;
    var response2file = buildfn(urlHtmlfilename,checksfile);
    rest.get(urlname).on('complete', response2file);

};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};



if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Path to url', clone(getUrl))
	.parse(process.argv);
    if (program.url) {
	checkUrl(program.url, program.checks);
    }
    else {
	var checkJson = checkHtmlFile(program.file, program.checks);

    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
