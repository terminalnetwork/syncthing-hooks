const fs = require('fs').promises;
const ms = require('ms');
const os = require('os');
const path = require('path');

const getHooksRoot = () => path.join(os.homedir(), '/.syncthing-hooks');

const readHooksRoot = async root => {
  try {
    const files = await fs.readdir(root);
    return files;
  } catch {
    return [];
  }
};

const parseHooks = (root, hooks) =>
  hooks
    .map(x => ({
      path: path.join(root, x),
      match: x.match(/(?<folder>.{11})-(?<time>.*)/),
    }))
    .filter(x => x.match)
    .map(x => ({
      path: x.path,
      folder: x.match.groups.folder,
      time: ms(x.match.groups.time),
    }));

const collectHooks = async () => {
  const root = getHooksRoot();
  const hooks = await readHooksRoot(root);
  return parseHooks(root, hooks);
};

module.exports = {
  collectHooks,
};
