#!/usr/bin/env node

const { fetchNewEvents } = require('./api');
const { collectHooks, runHook } = require('./hooks');

require('dotenv').config();

const state = {
  seenIds: null,
  mostRecentEventForFolder: null,
  promisesForHooks: new Map(),
};

const getMostRecentEvents = (events, monitoredFolders) => {
  const mostRecentEventForFolder = events
    .filter(x => x.data && x.data.folder)
    .filter(x => monitoredFolders.has(x.data.folder))
    .reduce(
      (acc, x) => {
        const date = new Date(x.time);
        const existingDate = acc[x.data.folder];
        acc[x.data.folder] =
          existingDate && existingDate > date ? existingDate : date;
        return acc;
      },
      state.mostRecentEventForFolder
        ? { ...state.mostRecentEventForFolder }
        : {}
    );
  state.mostRecentEventForFolder = mostRecentEventForFolder;
  return mostRecentEventForFolder;
};

const convertRecentEventDatesToDelta = () => {
  const now = new Date().getTime();
  return Object.entries(state.mostRecentEventForFolder)
    .map(([folder, date]) => [folder, now - date.getTime()])
    .reduce((acc, [path, delta]) => {
      acc[path] = delta;
      return acc;
    }, {});
};

const poll = async () => {
  const { events, seenIds } = await fetchNewEvents(state.seenIds);
  const hooks = await collectHooks();
  const monitoredFolders = new Set(hooks.map(x => x.folder));
  const deltaForFolders =
    getMostRecentEvents(events, monitoredFolders) &&
    convertRecentEventDatesToDelta();

  hooks
    .filter(x => deltaForFolders[x.folder])
    .forEach(hook => {
      const timeToWait = hook.time - deltaForFolders[hook.folder];
      console.log(`scheduled hook "${hook.path}" to run in ${timeToWait}ms`);
      if (timeToWait < 0) {
        const existingPromise = state.promisesForHooks[hook.path];
        if (existingPromise) {
          console.log(
            `hook "${hook.path}" was skipped because it is already running`
          );
        } else {
          delete state.mostRecentEventForFolder[hook.folder];
          console.log(`running hook "${hook.path}"`);
          const promise = runHook(hook);
          state.promisesForHooks[hook.path] = promise;
          promise
            .then(() => {
              console.log(`successfully ran hook "${hook.path}"`);
            })
            .catch(error => {
              console.error(`failed to run hook "${hook.path}": ${error}`);
            })
            .finally(() => {
              delete state.promisesForHooks[hook.path];
            });
        }
      }
    });

  state.seenIds = seenIds;
};

setInterval(poll, 30000);
poll();
