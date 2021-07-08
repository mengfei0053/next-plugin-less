
const simpleGit = require('simple-git');
const git = simpleGit();

const { GITHUB_NAME, GITHUB_AUTH } = process.env;
(async () => {
  const status = await git.status();
  const currentBranch = status.current;
  const origin = `https://${GITHUB_NAME}:${GITHUB_AUTH}@github.com/mengfei0053/next-plugin-less.git`;
  await git.push(origin, `${currentBranch}:master`);
  if (currentBranch === 'release') {
    await git.push(origin, `${currentBranch}:alpha`);
  }
})();
