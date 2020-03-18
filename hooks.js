const fs = require('fs').promises;
const ms = require('ms');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const getHooksRoot = () => path.join(os.homedir(), '/.syncthing-hooks');

const readHooksRoot = async root => {
  try {
    const files = await fs.readdir(root);
    return files;
  } catch (error) {
    console.error(error);
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

const waitForProcess = childProcess =>
  new Promise((resolve, reject) => {
    childProcess.once('exit', code =>
      code === 0
        ? resolve(null)
        : reject(new Error(`hook failed with code: ${code}`))
    );
    childProcess.once('error', error => reject(error));
  });

const runHook = hook =>
  waitForProcess(
    spawn(hook.path, [], {
      cwd: path.dirname(hook.path),
      shell: true,
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  );

module.exports = {
  collectHooks,
  runHook,
};
