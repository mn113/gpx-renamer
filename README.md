# GPX Renamer

A Node script to rename the files you get from your Strava data export.

**Use at your own risk! Keep a backup of your files!**

## Usage

`npm install`

`node renameGpxFiles.js path/to/folder/of/gpx/files`

## Result

The file `40210948.gpx` becomes `40210948 - 2018-10-16 - My Cool Ride.gpx` with default settings.

It can also become:

```
40210948 - My Cool Ride.gpx
My Cool Ride - 40210948.gpx
My Cool Ride.gpx
```

Just download it and hardcode the style you prefer.

## Issues

[Post an issue](issues)

## Licence

This software is released under a MIT licence for you to use at your own risk.