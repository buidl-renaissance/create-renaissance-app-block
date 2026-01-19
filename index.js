#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os');

// Default remote repository
const DEFAULT_REPO = 'https://github.com/buidl-renaissance/renaissance-app-block-template.git';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules and other common ignored directories
    if (['node_modules', '.git', '.next', 'dev.sqlite3'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deleteDirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.name = projectName;
  packageJson.version = '0.1.0';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

function createEnvFile(projectPath) {
  const envExamplePath = path.join(projectPath, 'env.example');
  const envPath = path.join(projectPath, '.env');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    log('  Created .env file from env.example', colors.green);
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function cloneTemplate(repoUrl, tempDir) {
  try {
    log('Downloading template from remote repository...', colors.cyan);
    
    // Shallow clone the template repo
    execSync(`git clone --depth 1 "${repoUrl}" "${tempDir}"`, {
      stdio: 'pipe',
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log();
  log('🎨 Create Renaissance App Block', colors.bright + colors.cyan);
  console.log();

  // Parse arguments
  const args = process.argv.slice(2);
  let projectName = null;
  let repoUrl = DEFAULT_REPO;

  // Parse flags
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' || args[i] === '-r') {
      repoUrl = args[++i];
    } else if (!args[i].startsWith('-')) {
      projectName = args[i];
    }
  }

  if (!projectName) {
    projectName = await prompt(`${colors.cyan}? ${colors.reset}What is your project named? `);
    
    if (!projectName) {
      log('Error: Project name is required.', colors.red);
      process.exit(1);
    }
  }

  // Validate project name
  if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
    log('Error: Project name can only contain letters, numbers, hyphens, and underscores.', colors.red);
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    log(`Error: Directory "${projectName}" already exists.`, colors.red);
    process.exit(1);
  }

  log(`Creating a new Renaissance app in ${colors.green}${projectPath}${colors.reset}`, colors.reset);
  console.log();

  // Create temp directory for cloning
  const tempDir = path.join(os.tmpdir(), `renaissance-template-${Date.now()}`);

  try {
    // Clone the template repository
    const cloneSuccess = cloneTemplate(repoUrl, tempDir);

    if (!cloneSuccess) {
      log('Error: Failed to download template. Please check your internet connection and that git is installed.', colors.red);
      log(`Repository URL: ${repoUrl}`, colors.dim);
      process.exit(1);
    }

    log('Copying template files...', colors.cyan);
    fs.mkdirSync(projectPath, { recursive: true });
    copyDirRecursive(tempDir, projectPath);

    // Clean up temp directory
    deleteDirRecursive(tempDir);

    // Update package.json with project name
    log('Configuring project...', colors.cyan);
    updatePackageJson(projectPath, projectName);

    // Create .env file from env.example
    createEnvFile(projectPath);

    console.log();
    log('✅ Success!', colors.bright + colors.green);
    log(`Created ${projectName} at ${projectPath}`, colors.green);
    console.log();

    log('Next steps:', colors.bright);
    log(`  cd ${projectName}`, colors.cyan);
    log('  yarn install', colors.cyan);
    log('  yarn dev', colors.cyan);
    console.log();

    log('Happy coding! 🚀', colors.yellow);
    console.log();

  } catch (err) {
    // Clean up on error
    deleteDirRecursive(tempDir);
    if (fs.existsSync(projectPath)) {
      deleteDirRecursive(projectPath);
    }
    throw err;
  }
}

main().catch((err) => {
  log(`Error: ${err.message}`, colors.red);
  process.exit(1);
});
