# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not open public issues for security vulnerabilities.**

Email security@pandarider.local with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Response Timeline:**
- Acknowledgment: 24 hours
- Assessment: 7 days
- Fix & patch: 14 days
- Public disclosure: 30 days after patch release

## Security Best Practices

### Firebase
- Enable RLS policies
- Validate user permissions
- Use service account keys securely

### API
- Always validate input
- Use HTTPS only
- Implement rate limiting
- Sanitize database queries

### Mobile Apps
- Never hardcode secrets
- Use secure storage for tokens
- Validate SSL certificates
- Implement certificate pinning

### Admin Dashboard
- Use strong authentication
- Implement role-based access control
- Audit all admin actions
- Log sensitive operations
