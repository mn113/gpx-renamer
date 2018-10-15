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
const mode = 'suffix';
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
    var gpxFileObjects = files
        .filter(f => f.match(/\.gpx$/i))
        .map(path.parse);   // object with base, name & ext
    
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
            if (err) console.log(err);
            
            // Safely check for a named track:
            if (result.gpx &&
                result.gpx.trk &&
                result.gpx.trk.length &&
                result.gpx.trk[0].name &&
                result.gpx.trk[0].name.length &&
                result.gpx.trk[0].name[0].length
            ) {
                renameFile(fileObj, result.gpx.trk[0].name[0]);
                renamedCount++;
            }
        });
    })
    .catch(e => console.log(e));
}

function renameFile(file, trackName) {
    console.log('Renaming', file.base, 'with', trackName, 'using', mode);
    // 3 different styles of renaming, based on the options mode:
    switch(mode) {
        case 'replace':
            fs.rename(
                path.join(filePath, file.base),
                path.join(filePath, trackName + '.gpx'),
                throwErr);
            break;
        case 'prefix':
            fs.rename(
                path.join(filePath, file.base),
                path.join(filePath, trackName + sep + file.name + '.gpx'),
                throwErr);
            break;
        case 'suffix':
            fs.rename(
                path.join(filePath, file.base),
                path.join(filePath, file.name + sep + trackName + '.gpx'),
                throwErr);
            break;
    }
}

const throwErr = (err) => { if (err) throw err };