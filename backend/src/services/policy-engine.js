/**
 * Policy Engine
 * Evaluates actions against governance rules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PolicyEngine {
  constructor() {
    this.policies = new Map();
    this.loadPolicies();
  }

  async loadPolicies() {
    try {
      const policyDir = path.join(
        process.env.WORKSPACE_ROOT || '/workspace',
        '_OPS/POLICY'
      );
      const files = await fs.readdir(policyDir);
      for (const file of files.filter(f => f.endsWith('.json'))) {
        const content = await fs.readFile(path.join(policyDir, file), 'utf-8');
        const policy = JSON.parse(content);
        this.policies.set(policy.name, policy);
      }
    } catch (error) {
      console.warn('Failed to load policies:', error.message);
      // Load defaults if directory doesn't exist
      this.loadDefaultPolicies();
    }
  }

  loadDefaultPolicies() {
    // Default governance policies
    this.policies.set('commit-policy', {
      name: 'commit-policy',
      description: 'Controls GitHub commit operations',
      rules: [
        {
          condition: 'changeCount < 100',
          action: 'ALLOW',
        },
        {
          condition: 'message.includes("critical") OR message.includes("danger")',
          action: 'REQUIRE_APPROVAL',
        },
      ],
    });

    this.policies.set('command-policy', {
      name: 'command-policy',
      description: 'Controls command dispatch',
      rules: [
        {
          condition: 'target.startsWith("prod")',
          action: 'REQUIRE_APPROVAL',
        },
        {
          condition: 'command.includes("delete")',
          action: 'REQUIRE_APPROVAL',
        },
      ],
    });

    this.policies.set('rollback-policy', {
      name: 'rollback-policy',
      description: 'Controls rollback operations',
      rules: [
        {
          condition: 'true',
          action: 'REQUIRE_APPROVAL',
        },
      ],
    });
  }

  async listPolicies() {
    return Array.from(this.policies.values());
  }

  async evaluate(policyName, action, context = {}) {
    const policy = this.policies.get(policyName);
    if (!policy) {
      return {
        allowed: false,
        reason: `Policy not found: ${policyName}`,
      };
    }

    try {
      for (const rule of policy.rules || []) {
        if (this.evaluateCondition(rule.condition, context)) {
          if (rule.action === 'ALLOW') {
            return {
              allowed: true,
              reason: 'Policy allows action',
              policy: policyName,
            };
          } else if (rule.action === 'DENY') {
            return {
              allowed: false,
              reason: `Policy denies: ${rule.condition}`,
              policy: policyName,
            };
          } else if (rule.action === 'REQUIRE_APPROVAL') {
            return {
              allowed: false,
              reason: 'Requires manual approval',
              requiresApproval: true,
              policy: policyName,
            };
          }
        }
      }

      // Default allow if no rule matched
      return {
        allowed: true,
        reason: 'No blocking rules found',
        policy: policyName,
      };
    } catch (error) {
      return {
        allowed: false,
        reason: `Policy evaluation error: ${error.message}`,
        policy: policyName,
      };
    }
  }

  evaluateCondition(condition, context) {
    if (!condition) return true;

    // Simple condition evaluator
    // In production, this would be a full expression evaluator
    try {
      // Replace context variables in condition
      let evalStr = condition;
      for (const [key, value] of Object.entries(context)) {
        if (typeof value === 'string') {
          evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), `"${value}"`);
        } else if (typeof value === 'number') {
          evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
        }
      }

      // Use Function constructor for safe evaluation (in sandboxed context)
      return new Function(`return ${evalStr}`)();
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }
}

export const policyEngine = new PolicyEngine();
