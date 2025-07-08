# Contributing to VinTrek

Thank you for your interest in contributing to VinTrek! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- A Cardano wallet for testing
- Basic knowledge of React, TypeScript, and blockchain concepts

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Vintrek.git`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp .env.local.example .env.local`
5. Configure your `.env.local` file with necessary API keys
6. Start development server: `npm run dev`

## 📋 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce, expected behavior, and screenshots if applicable
4. Specify your environment (OS, browser, wallet, etc.)

### Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Clearly describe the feature and its benefits
4. Consider implementation complexity and alignment with project goals

### Code Contributions

#### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(trails): add GPS tracking functionality

Implement real-time GPS tracking for trail recording
- Add geolocation API integration
- Create tracking component
- Update trail data model

Closes #123
```

#### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes following our coding standards
3. Add tests for new functionality
4. Update documentation if needed
5. Ensure all tests pass: `npm run test`
6. Run linting: `npm run lint`
7. Create a pull request with a clear description

## 🎯 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (Prettier configuration)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### Testing
- Write unit tests for new functions
- Add integration tests for new features
- Test blockchain interactions thoroughly
- Ensure wallet compatibility across different providers

### Blockchain Development
- Test all smart contract interactions on testnet first
- Validate transaction building and signing
- Handle wallet connection errors gracefully
- Consider gas/fee optimization

### UI/UX Guidelines
- Follow existing design patterns
- Ensure mobile responsiveness
- Test accessibility features
- Use semantic HTML elements
- Maintain consistent styling with Tailwind CSS

## 🔧 Project Structure

### Key Directories
- `/src/app` - Next.js app router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/src/services` - API and service layer
- `/contracts` - Smart contracts (Aiken)

### Component Organization
- Keep components in appropriate subdirectories
- Use index files for clean imports
- Separate logic from presentation when possible
- Create reusable UI components in `/src/components/ui`

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Test Types
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions and API calls
- **E2E Tests**: Full user workflows
- **Blockchain Tests**: Smart contract interactions

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex algorithms and business logic
- Include usage examples for components
- Update README.md for significant changes

### API Documentation
- Document all API endpoints
- Include request/response examples
- Specify error codes and handling
- Update OpenAPI specifications if applicable

## 🔒 Security

### Blockchain Security
- Never commit private keys or mnemonics
- Validate all user inputs
- Use secure random number generation
- Implement proper error handling for wallet operations

### General Security
- Sanitize user inputs
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP security guidelines

## 🌍 Community

### Communication
- Join our Discord server for discussions
- Use GitHub issues for bug reports and feature requests
- Follow our code of conduct
- Be respectful and constructive in all interactions

### Recognition
- Contributors will be acknowledged in releases
- Significant contributions may be featured in our blog
- Active contributors may be invited to join the core team

## 📝 License

By contributing to VinTrek, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search closed issues
3. Ask in our Discord community
4. Create a new issue with the "question" label

Thank you for helping make VinTrek better! 🚀
