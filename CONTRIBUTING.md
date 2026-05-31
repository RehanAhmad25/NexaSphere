# Contributing Guidelines

Thank you for your interest in contributing to NexaSphere! 🎉

We welcome contributions from everyone, whether you're fixing bugs, improving documentation, adding features, or helping improve the overall developer experience. By participating in this project, you agree to abide by our Code of Conduct.

---

## How to Contribute

1. **Fork the repository** by clicking the **Fork** button at the top-right of GitHub.
2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/NexaSphere.git
   cd NexaSphere
   ```

3. **Create a new branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and test them locally.

5. **Commit your changes**:

   ```bash
   git commit -m "feat: your commit message"
   ```

6. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** against the main repository.

---

## 🛠️ Getting Started Locally

### Prerequisites

Make sure the following tools are installed:

- Node.js >= 20.0.0
- npm >= 9.0.0
- Git

### Clone & Install Dependencies

```bash
git clone https://github.com/your-username/NexaSphere.git
cd NexaSphere

# Install all workspace dependencies
npm install
```

### Configure Environment Variables

Copy the example environment files:

```bash
# Website
cp website/.env.example website/.env.local

# Admin Dashboard
cp admin-dashboard/.env.example admin-dashboard/.env.local

# Backend API
cp server/.env.example server/.env
```

#### Minimum Local Configuration

**website/.env.local**

```env
VITE_API_BASE=http://localhost:8787
```

**server/.env**

```env
PORT=8787
NODE_ENV=development
CORS_ORIGIN=http://localhost:5175,http://localhost:5001
ADMIN_USERNAME=your-admin
ADMIN_PASSWORD=YourPass123!
ADMIN_EVENT_PASSWORD=EventPass456!
```

Refer to the respective `.env.example` files for the complete list of supported environment variables.

### Run Development Servers

Run individual services:

```bash
# Website
npm run dev:website

# Admin Dashboard
npm run dev:admin

# Backend API
npm run dev:server
```

Or start everything together:

```bash
npm run dev:all
```

### Local Development URLs

| Service | URL |
|----------|-----|
| Website | http://localhost:5175 |
| Admin Dashboard | http://localhost:5001 |
| Backend API | http://localhost:8787 |
| Health Check | http://localhost:8787/health |

---

## 🧪 Running Tests

```bash
# Website tests
npm test

# Server tests
npm run test:server

# End-to-end tests
npx playwright test
```

Before submitting a pull request, ensure that all relevant tests pass successfully.

---

## Reporting Bugs

Please use the provided [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) issue template when reporting bugs.

Include:

- A clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs (if applicable)

---

## Requesting Features

Have an idea to improve NexaSphere?

Use the provided [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template and include:

- The problem your feature solves
- Your proposed solution
- Alternative approaches considered
- Additional context or examples

---

## Pull Request Guidelines

Before opening a PR, please ensure:

- Your branch is up to date with the latest changes.
- Your changes are focused on a single issue or feature.
- Code is properly tested.
- Documentation is updated when necessary.
- Commit messages are clear and descriptive.
- Related issues are referenced in the PR description.

Example:

```text
Fixes #123
```

---

## Troubleshooting

| Problem | Possible Fix |
|----------|-------------|
| Dependencies fail to install | Verify Node.js 20+ and npm 9+ are installed |
| Environment variables not loading | Check file names and locations |
| CORS errors during development | Verify `CORS_ORIGIN` includes frontend URLs |
| Backend API unavailable | Ensure `npm run dev:server` is running |
| Port already in use | Stop the conflicting process or change the configured port |

---

Thank you for contributing to NexaSphere and helping make it better for the community! 🚀


