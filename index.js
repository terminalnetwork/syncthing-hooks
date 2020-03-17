const { fetchNewEvents } = require('./api');
const { collectHooks } = require('./hooks');

require('dotenv').config();

const state = {
  seenIds: null,
  mostRecentEventForFolder: null,
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

setInterval(async () => {
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
      console.log(timeToWait);
      if (timeToWait < 0) {
        delete state.mostRecentEventForFolder[hook.folder];
        console.log('running hook', hook);
      }
    });

  console.warn(deltaForFolders);
  state.seenIds = seenIds;
}, 2000);
