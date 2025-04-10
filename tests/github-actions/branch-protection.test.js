/**
 * Tests for branch protection workflow
 * These tests verify that our branch protection configuration is valid
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('Branch Protection Workflow Tests', () => {
  
  test('branch-protection.yml contains approval check job', () => {
    const filePath = path.join(__dirname, '../../.github/workflows/branch-protection.yml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const parsedYaml = yaml.load(fileContent);
    expect(parsedYaml).toBeDefined();
    expect(parsedYaml.name).toBe('Branch Protection');
    expect(parsedYaml.jobs).toHaveProperty('approval-check');
  });

  test('branch-protection workflow checks for jperram92 approval', () => {
    const filePath = path.join(__dirname, '../../.github/workflows/branch-protection.yml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if the script contains the username jperram92
    expect(fileContent).toContain('jperram92');
    
    // Check if the script is checking for approval
    expect(fileContent).toContain('review.state === \'APPROVED\'');
  });
});
