#!/usr/bin/env node

import fetch from 'node-fetch';

const CREATOR_AGENT_URL = 'http://localhost:3001';
const ECHOGUARD_AGENT_URL = 'http://localhost:3002';

async function testAgentHealth() {
  console.log('🧪 Testing Agent Health...\n');

  try {
    // Test CreatorAgent
    console.log('📡 Testing CreatorAgent...');
    const creatorResponse = await fetch(`${CREATOR_AGENT_URL}/health`);
    if (creatorResponse.ok) {
      const creatorData = await creatorResponse.json();
      console.log('✅ CreatorAgent is healthy:', creatorData);
    } else {
      console.log('❌ CreatorAgent health check failed:', creatorResponse.status);
    }
  } catch (error) {
    console.log('❌ CreatorAgent is not running:', error.message);
  }

  try {
    // Test EchoGuardAgent
    console.log('\n🛡️  Testing EchoGuardAgent...');
    const echoResponse = await fetch(`${ECHOGUARD_AGENT_URL}/health`);
    if (echoResponse.ok) {
      const echoData = await echoResponse.json();
      console.log('✅ EchoGuardAgent is healthy:', echoData);
    } else {
      console.log('❌ EchoGuardAgent health check failed:', echoResponse.status);
    }
  } catch (error) {
    console.log('❌ EchoGuardAgent is not running:', error.message);
  }

  console.log('\n🎯 Test completed!');
  console.log('\nTo start the agents:');
  console.log('  npm run dev:both');
  console.log('\nOr from main project:');
  console.log('  npm run agents:dev');
}

testAgentHealth();