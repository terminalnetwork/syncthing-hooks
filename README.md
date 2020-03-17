# syncthing-hooks

Very early experiment for running event hooks when SyncThing detects changes in a folder.

## Prerequisites

A somewhat recent version of Node.js.

## Installation

None yet, there's no point installing this as a daemon right now. But you'll need to install the dependencies to make it run:

```sh
npm i
# or
yarn
```

## Usage

You can experiment with it by just running it via Node.js and monitoring the output.

```sh
API_KEY=mykey node index.js
```

Then change some files in one of your monitored folders.
