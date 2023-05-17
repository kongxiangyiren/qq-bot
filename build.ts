const isPkg = process.argv[2] === 'pkg';
import { cpSync, existsSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import pac from './package.json';
import pkgPac from './package.pkg.json';
import pkgProd from './package.prod.json';
import { execSync } from 'node:child_process';
import { join } from 'path';
import glob from 'glob';

if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true });
}

try {
  execSync('npm run lint && npm run tsc', {
    stdio: 'inherit'
  });
} catch (error) {
  undefined;
}

cpSync('./.npmrc', './dist/.npmrc', { recursive: true });

if (isPkg) {
  const pack = {
    ...pac,
    ...pkgPac
  };
  writeFileSync('./dist/package.json', JSON.stringify(pack, null, 2));
  cpSync('./patches', './dist/patches', { recursive: true });
  cpSync('./plugins', './dist/plugins', { recursive: true });
  deleteTSFiles('./dist/plugins');

  let build = '';
  if (process.platform === 'win32') {
    build = 'pkg-build-win';
  } else {
    build = 'pkg-build';
  }

  try {
    execSync('cd ./dist && npm i && npm run ' + build, {
      stdio: 'inherit'
    });
  } catch (error) {
    undefined;
  }

  cpSync('./dist/plugins', './dist/dist/plugins', { recursive: true });
  cpSync('./global', './dist/dist/global', { recursive: true });
} else {
  const pack = {
    ...pac,
    ...pkgProd
  };
  writeFileSync('./dist/package.json', JSON.stringify(pack, null, 2));
  cpSync('./global', './dist/global', { recursive: true });
  cpSync('./plugins', './dist/plugins', { recursive: true });
  deleteTSFiles('./dist/plugins');

  const pm2 = {
    apps: [
      {
        cwd: './',
        min_uptime: 10000,
        max_restarts: 3,
        name: 'QQBot',
        script: './src/app.js',
        error_file: './pm2/error.log',
        out_file: './pm2/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        max_memory_restart: '512M',
        cron_restart: '0 8 * * *', //设置每天八点重启 (根据系统时间判断)
        env: {
          NODE_ENV: 'pm2'
        }
      }
    ]
  };
  writeFileSync('./dist/pm2.json', JSON.stringify(pm2, null, 2));
}

// 删除ts
function deleteTSFiles(directoryPath: string) {
  const tsFiles = glob.sync(join(directoryPath, '/**/*.ts'), {
    windowsPathsNoEscape: true,
    ignore: ['**/*.d.ts']
  });

  tsFiles.forEach((fileName: string) => unlinkSync(fileName));
}
