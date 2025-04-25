const express = require('express');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const serveIndex = require('serve-index');
const app = express();
const port = process.env.PORT || 3000;

const git = simpleGit();
const repoPath = path.join(__dirname, 'repo');
const repoUrl = 'https://github.com/jacksmasher/cloud.git';

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

app.get('/', (req, res) => {
  res.send(`
    <h1>☁️ Cloud File Server</h1>
    <p>Welcome! Access your files at <code>/data/&lt;filename&gt;</code></p>
    <p>Example: <a href="/data/README.md">/data/README.md</a></p>
  `);
});

// Enable file serving + folder browsing
const dataPath = path.join(repoPath, 'data');
app.use('/data', express.static(dataPath), serveIndex(dataPath, { icons: true }));

app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);
  await syncRepo();
});
