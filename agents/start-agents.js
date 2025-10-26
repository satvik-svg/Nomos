#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Nomos Agents...');

// Start CreatorAgent
const creatorAgent = spawn('node', ['creator-agent/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

// Start EchoGuardAgent
const echoGuardAgent = spawn('node', ['echoguard-agent/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down agents...');
  creatorAgent.kill('SIGINT');
  echoGuardAgent.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down agents...');
  creatorAgent.kill('SIGTERM');
  echoGuardAgent.kill('SIGTERM');
  process.exit(0);
});

creatorAgent.on('exit', (code) => {
  console.log(`CreatorAgent exited with code ${code}`);
});

echoGuardAgent.on('exit', (code) => {
  console.log(`EchoGuardAgent exited with code ${code}`);
});

console.log('✅ Agents started successfully!');
console.log('📡 CreatorAgent: http://localhost:3001');
console.log('🛡️  EchoGuardAgent: http://localhost:3002');