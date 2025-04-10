/**
 * Basic tests for GitHub Actions workflow
 * These tests verify that our GitHub Actions configuration is valid
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('GitHub Actions Workflow Tests', () => {
  
  test('main.yml workflow file exists', () => {
    const filePath = path.join(__dirname, '../../.github/workflows/main.yml');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('branch-protection.yml workflow file exists', () => {
    const filePath = path.join(__dirname, '../../.github/workflows/branch-protection.yml');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('main.yml workflow is valid YAML', () => {
    const filePath = path.join(__dirname, '../../.github/workflows/main.yml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // This will throw an error if the YAML is invalid
    const parsedYaml = yaml.load(fileContent);
    expect(parsedYaml).toBeDefined();
    expect(parsedYaml.name).toBe('JamesCRM CI/CD Pipeline');
  });
});
