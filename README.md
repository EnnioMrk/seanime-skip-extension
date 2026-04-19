# Seanime Skip Ahead Button Plugin

This plugin adds a skip-ahead button to the video player control bar, right after the timestamp.

## Behavior

- Adds a `+Xs` button after the timestamp in the video player controls.
- Clicking the button seeks forward by the configured amount.
- Default skip amount is `85` seconds.

## Configuration

In Seanime extension preferences, set:

- `Skip Ahead Seconds` (`skipSeconds`): Number of seconds to seek forward.

Notes:

- If the value is invalid, the plugin uses `85`.
- Values are clamped between `1` and `3600` seconds.

## Files

- Manifest: `skip-ahead-video-player.json`
- Plugin code: `skip-ahead-video-player.ts`

## Install (Development)

1. Place `skip-ahead-video-player.json` in Seanime's `extensions` directory.
2. Keep `payloadURI` pointing to the absolute path of `skip-ahead-video-player.ts` on your machine.
3. Reload the plugin from Seanime Extensions page (development mode enabled).

## Permissions

The plugin requests:

- `playback` scope, required to call `ctx.videoCore.seek(...)`.
