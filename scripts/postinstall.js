const simpleGit = require('simple-git');
const git = simpleGit();

(async () => {
  const status = await git.status();
  const currentBranch = status.current;
  await git.push('origin', `${currentBranch}:master`);
  if (currentBranch === 'release') {
    await git.push('origin', `${currentBranch}:alpha`);
  }
})();
