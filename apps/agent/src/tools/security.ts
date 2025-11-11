/**
 * Security guardrails for input validation
 */

const INJECTION_PATTERNS = [
  /ignore\s+(?:previous|all|above)\s+(?:instructions|prompts)/gi,
  /disregard\s+(?:previous|all|above)/gi,
  /forget\s+(?:previous|all|above)/gi,
  /system\s*:\s*you\s+are/gi,
  /new\s+instructions/gi,
];

export interface SecurityCheckResult {
  passed: boolean;
  reason?: string;
  sanitized?: string;
}

/**
 * Check for PII patterns in the input and sanitize them
 */
export function checkForPII(text: string): SecurityCheckResult {
  let sanitized = text;
  let foundPII = false;

  // Sanitize SSN
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (ssnPattern.test(text)) {
    sanitized = sanitized.replace(ssnPattern, "[SSN-REDACTED]");
    foundPII = true;
  }

  // Note: We allow emails in requirements documents as they're often used as examples
  // Only sanitize if they look like real credentials (e.g., "email: john@example.com")
  const emailCredentialPattern = /(?:email|user|username|login)\s*[:=]\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi;
  if (emailCredentialPattern.test(text)) {
    sanitized = sanitized.replace(emailCredentialPattern, (match, email) => {
      foundPII = true;
      return match.replace(email, "[EMAIL-REDACTED]");
    });
  }

  // Sanitize credit cards
  const creditCardPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  if (creditCardPattern.test(text)) {
    sanitized = sanitized.replace(creditCardPattern, "[CARD-REDACTED]");
    foundPII = true;
  }

  // Sanitize passwords
  const passwordPattern = /\b(?:password|pwd|passwd)\s*[:=]\s*\S+/gi;
  if (passwordPattern.test(text)) {
    sanitized = sanitized.replace(passwordPattern, (match) => {
      const parts = match.split(/[:=]/);
      foundPII = true;
      return parts[0] + ": [PASSWORD-REDACTED]";
    });
  }

  // Sanitize API keys
  const apiKeyPattern = /\b(?:api[_-]?key|apikey|secret[_-]?key)\s*[:=]\s*\S+/gi;
  if (apiKeyPattern.test(text)) {
    sanitized = sanitized.replace(apiKeyPattern, (match) => {
      const parts = match.split(/[:=]/);
      foundPII = true;
      return parts[0] + ": [API-KEY-REDACTED]";
    });
  }

  // Only sanitize very long token-like strings (>40 chars) that look like secrets
  const longTokenPattern = /\b[A-Za-z0-9]{40,}\b/g;
  if (longTokenPattern.test(text)) {
    sanitized = sanitized.replace(longTokenPattern, "[TOKEN-REDACTED]");
    foundPII = true;
  }

  if (foundPII) {
    return {
      passed: true,
      reason: "Sensitive information detected and sanitized",
      sanitized,
    };
  }

  return { passed: true };
}

/**
 * Check for prompt injection attempts
 */
export function checkForInjection(text: string): SecurityCheckResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      // Sanitize by removing the injection attempt
      const sanitized = text.replace(pattern, "[REMOVED]");
      return {
        passed: true,
        reason: "Potential prompt injection detected and sanitized",
        sanitized,
      };
    }
  }
  return { passed: true };
}

/**
 * Check file size limits
 */
export function checkFileSize(buffer: Buffer, maxSizeMB: number = 5): SecurityCheckResult {
  const sizeMB = buffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      passed: false,
      reason: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }
  return { passed: true };
}

/**
 * Run all security checks
 */
export function runSecurityChecks(text: string, fileBuffer?: Buffer): SecurityCheckResult {
  // Check file size if buffer provided
  if (fileBuffer) {
    const sizeCheck = checkFileSize(fileBuffer);
    if (!sizeCheck.passed) return sizeCheck;
  }

  // Check for PII and sanitize
  const piiCheck = checkForPII(text);
  if (!piiCheck.passed) return piiCheck;
  if (piiCheck.sanitized) {
    text = piiCheck.sanitized;
  }

  // Check for injection and sanitize
  const injectionCheck = checkForInjection(text);
  if (injectionCheck.sanitized) {
    text = injectionCheck.sanitized;
  }

  // Note: We don't check scope here anymore - that's handled by extractRequirements validation
  // This security layer only handles PII and injection attempts

  return { 
    passed: true, 
    sanitized: (piiCheck.sanitized || injectionCheck.sanitized) ? text : undefined 
  };
}

