# Seanime Skip Ahead Button Plugin

This plugin adds a configurable skip-ahead button to the Seanime video player control bar. Useful for skipping intros, recaps, or outros in anime episodes.

## Features

- Adds a `+Xs` button to the video player controls
- Clicking the button seeks forward by the configured amount
- Configurable skip seconds (default: 85 seconds)
- **Configurable button position** - choose where the button appears

## Button Position Options

| Option | Description |
|--------|-------------|
| **After Next Episode Button** (default) | Places the skip button after the next episode button, before the volume slider |
| **After Play Button** | Places the skip button after the play/pause button |
| **After Episode Time Progress (Timestamp)** | Places the skip button after the timestamp display |

## Configuration

In Seanime extension preferences, set:

- `Skip Ahead Seconds` (`skipSeconds`): Number of seconds to seek forward (1-3600, default: 85)
- `Button Position` (`buttonPosition`): Where to place the skip button in the control bar

Notes:
- If the value is invalid, the plugin uses `85`
- Values are clamped between `1` and `3600` seconds

## Files

- Manifest: `skip-ahead-video-player.json`
- Plugin code: `skip-ahead-video-player.ts`
- Icon: `icon.png`

## Install (Development)

1. Place `skip-ahead-video-player.json` in Seanime's `extensions` directory
2. Keep `payloadURI` pointing to the absolute path of `skip-ahead-video-player.ts` on your machine
3. Reload the plugin from Seanime Extensions page (development mode enabled)

## Permissions

The plugin requests:
- `playback` scope, required to call `ctx.videoCore.seek(...)`