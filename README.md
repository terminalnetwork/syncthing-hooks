# syncthing-hooks

Run shell scripts via event hook files (similar to Git hooks) when changes are detected in a [Syncthing](https://syncthing.net/) folder.

## Prerequisites

[Node.js >= 10](https://nodejs.org/en/)

## Installation

```sh
npm i -g syncthing-hooks
```

## Usage

You can simply run the watcher process via:

```sh
API_KEY=mykey syncthing-hooks
```

Don't forget to substitute `mykey` with your syncthing API key, which can be found in the settings in the GUI.

It won't install itself as a daemon by default, however. In order to run it as a service, it is recommended to install [pm2](https://pm2.keymetrics.io/):

```sh
npm i -g pm2
```

You can then register it as a daemon via:

```sh
pm2 start "API_KEY=mykey syncthing-hooks" --name sthooks
```

To create the daemon automatically on startup, consult [this documentation](https://pm2.keymetrics.io/docs/usage/startup/).

You can follow the output of your hooks by using:

```sh
pm2 logs
```

## Hooks

Create a folder in your home directory called `.syncthing-hooks`. Each hook is a file with the following naming scheme:

`folder-name-delay`

The folder name is the 11 character unique string found in the syncthing GUI. The delay is a string (anything parseable by the [ms module](https://github.com/zeit/ms)) indicating the idle time after an event, so that hooks aren't executed multiple times on successive changes in a short interval.

An example: a script at the location `~/.syncthing-hooks/night-owlzz-5m` will be executed five minutes after the most recent event in the folder with the identifier `night-owlzz`.

Make sure your folder identifier is exactly 11 characters long and does not have an extension. Also, don't forget to `chmod +x` the script.
