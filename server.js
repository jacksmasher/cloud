const express = require('express');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const git = simpleGit();
const repoPath = path.join(__dirname, 'repo');  // Directory to clone the repo
const repoUrl = 'https://github.com/jacksmasher/cloud.git';

// Clone or pull the GitHub repo
async function syncRepo() {
  try {
    if (!fs.existsSync(repoPath)) {
      console.log('Cloning repo...');
      await git.clone(repoUrl, repoPath);
    } else {
      console.log('Pulling latest changes...');
      await git.cwd(repoPath).pull();
    }
  } catch (err) {
    console.error('Error syncing repo:', err.message);
  }
}

// Root route — to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send(`
    <h1>☁️ Cloud File Server</h1>
    <p>Welcome! Access your files at <code>/data/&lt;filename&gt;</code></p>
    <p>Example: <a href="/data/README.md">/data/README.md</a></p>
  `);
});

// Serve files from the 'data' folder inside the repo
app.use('/data', express.static(path.join(repoPath, 'data')));

app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);
  await syncRepo();
});
