# Maestro E2E Test Helpers

This directory contains reusable helper scripts for Maestro E2E tests.

## Helper Files

### auth-helpers.yaml
Common authentication flows that can be reused across tests.

```yaml
# Login with test user
- runFlow: helpers/auth-helpers.yaml
```

### navigation-helpers.yaml  
Common navigation patterns.

### assertion-helpers.yaml
Reusable assertions for common UI states.

## Usage

Import helpers in your test flows using `runFlow`:

```yaml
appId: com.habitsaga.app
---
- runFlow: helpers/auth-helpers.yaml
- runFlow: helpers/navigation-helpers.yaml
# ... rest of your test
```

## Creating New Helpers

1. Create a new YAML file in this directory
2. Define reusable commands
3. Import in test flows with `runFlow`

Keep helpers focused and single-purpose for maximum reusability.
