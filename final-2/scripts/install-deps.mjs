#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const run = (command, args) =>
    spawnSync(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const cwd = process.cwd();
const hasLockfile = existsSync(join(cwd, 'package-lock.json'));
const baseArgs = ['--ignore-scripts', '--no-audit', '--no-fund'];

const primaryArgs = hasLockfile ? ['ci', ...baseArgs] : ['install', ...baseArgs];
const fallbackArgs = hasLockfile ? ['install', ...baseArgs] : null;

const primary = run(npmCmd, primaryArgs);
if (primary.status === 0) {
    process.exit(0);
}

if (fallbackArgs) {
    console.warn('\n`npm ci` failed, retrying with `npm install --ignore-scripts`...');
    const fallback = run(npmCmd, fallbackArgs);
    process.exit(fallback.status ?? 1);
}

process.exit(primary.status ?? 1);
