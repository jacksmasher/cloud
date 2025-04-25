const express = require('express');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const git = simpleGit();
const repoPath = path.join(__dirname, 'repo');  // Directory to clone the repo

// Clone the GitHub repo on server startup
async function cloneRepo() {
  if (!fs.existsSync(repoPath)) {
    await git.clone('https://github.com/jacksmasher/cloud.git', repoPath);
  } else {
    await git.pull();
  }
}

// Serve files from the GitHub 'data' folder
app.use('/data', express.static(path.join(repoPath, 'data')));

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await cloneRepo();  // Clone or pull the latest changes from GitHub
});
