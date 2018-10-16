#!/bin/node

/* global require, process */
/* eslint curly: 0 */

/**
 * Script will work on all .gpx files in the specified directory.
 * It will look for <trk><name> and rename the file after the first value, if present.
 * Desired options to be hardcoded into the script.
 *
 * Usage: node renameGpxFiles.js [path/to/dir]
 */

 // New filename options:
const idOnly = true;   // only rename files like 949473723.gpx
const mode = 'suffix_with_date';
const sep = ' - ';

const fs = require('fs');
const path = require('path');
const parseString = require('xml2js').parseString;

var renamedCount = 0;

// Get the path to look for files in:
var args = process.argv.slice(2);
if (args.length > 1) throw Error;
if (args.length === 0) args = ['.'];

var filePath = path.join(__dirname, args[0]);
//if (!filePath.isDirectory()) return false;

new Promise((resolve, reject) => {
    // Look for .gpx files:
    fs.readdir(filePath, (err, files) => {
        if (err) reject(err);
        else resolve(files);
    });    
})
.then(files => {
    var gpxFiles = files.filter(f => f.match(/\.gpx$/i))    // match extension
    if (idOnly) {
        gpxFiles = gpxFiles.filter(f => f.match(/^\d{5,10}\.gpx$/i));
    }
    var gpxFileObjects = gpxFiles.map(path.parse);  // object with base, name & ext

    renameAll(gpxFileObjects);
})
.catch(e => console.log(e));


function renameAll(fileObjects) {
    Promise.all(fileObjects.map(readFilePromise))
    .then(() => {
        console.log(`Renamed ${renamedCount} out of ${fileObjects.length} .gpx files.`);
    });    
}


function readFilePromise(fileObj) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(filePath, fileObj.base), 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
    .then(data => {
        // Read contents:
        parseString(data, (err, result) => {
            var trackName = "",
                date = "";
            
            if (err) console.log(err);
            
            // Safely check for a named track:
            if (result.gpx &&
                result.gpx.trk &&
                result.gpx.trk.length &&
                result.gpx.trk[0].name &&
                result.gpx.trk[0].name.length &&
                result.gpx.trk[0].name[0].length
            ) {
                trackName = result.gpx.trk[0].name[0];
            }

            console.dir(result.gpx);

            if (result.gpx &&
                result.gpx.metadata &&
                result.gpx.metadata[0].time
            ) {
                date = result.gpx.metadata[0].time[0].slice(0,10);
            }

            renameFile(fileObj, trackName, date);
            renamedCount++;

        });
    })
    .catch(e => console.log(e));
}

function renameFile(file, trackName, date) {
    var newName;
    console.log('Renaming', file.base, 'with name', trackName, 'and date', date, 'using', mode);
    // Different examples of renaming, based on your mode setting:
    switch(mode) {
        case 'replace':
            newName = trackName + '.gpx';
            break;
        case 'prefix':
            newName = trackName + sep + file.name + '.gpx';
            break;
        case 'suffix':
            newName = file.name + sep + trackName + '.gpx';
            break;
        case 'suffix_with_date':
            newName = file.name + sep + date + sep + trackName + '.gpx';
            break;
    }
    fs.rename(
        path.join(filePath, file.base),
        path.join(filePath, newName),
        throwErr
    );
}

const throwErr = (err) => { if (err) throw err };