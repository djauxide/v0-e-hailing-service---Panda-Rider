# Contributor's Guide

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 18+
- Flutter 3.0+
- Firebase CLI
- Stripe CLI (for testing)
- Git

### Setup Steps

1. Clone the repo
2. Run `chmod +x setup.sh && ./setup.sh`
3. Follow environment setup instructions
4. Start development servers

## Code Style

- Use ESLint for JavaScript/TypeScript
- Use Dart formatting for Flutter
- Follow Google style guide
- Add comments for complex logic

## Testing

Before submitting PR:
```bash
# Backend
npm run test

# Flutter
flutter test
```

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Update CHANGELOG.md
4. Ensure all tests pass
5. Get at least one review

## Reporting Issues

Use GitHub Issues with:
- Clear title
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
