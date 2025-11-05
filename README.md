# Demoblaze E2E Testing Framework 🚀

[![Playwright Tests](https://github.com/rbcausing/demoblaze-e2e-playwright/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/rbcausing/demoblaze-e2e-playwright/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Playwright](https://img.shields.io/badge/playwright-1.56.0-blue.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-red.svg)](https://www.jenkins.io/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![ESLint](https://img.shields.io/badge/eslint-enabled-green.svg)](https://eslint.org/)

> **A production-ready end-to-end testing framework for Demoblaze.com e-commerce platform, featuring comprehensive test automation, CI/CD integration, and modern testing practices.**

---

## 🎯 Key Highlights

| Feature | Details |
|---------|---------|
| **🎯 Test Automation** | 20+ comprehensive E2E tests covering critical user journeys |
| **🤖 Smart Detection** | Intelligent algorithm for luxury product identification |
| **🌐 Cross-Browser** | Chromium, Firefox, WebKit, iOS, Android support |
| **🔄 CI/CD** | Jenkins + GitHub Actions automated pipelines |
| **📊 Reliability** | 100% pass rate with retry mechanisms |
| **🏗️ Architecture** | Page Object Model with custom fixtures |

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Test Scenarios](#-test-scenarios)
- [Jenkins CI/CD](#-jenkins-cicd-integration)
- [Project Architecture](#-project-architecture)
- [Running Tests](#-running-tests)
- [Technical Details](#-technical-details)
- [Test Reports](#-test-reports)

---

## ✨ Key Features

### 🛍️ Demoblaze E2E Automation

Complete end-to-end testing suite for [Demoblaze.com](https://www.demoblaze.com/) e-commerce platform:

- **Intelligent Product Selection**: Algorithm that parses all laptop prices and automatically identifies the most expensive item ($1100 MacBook Pro)
- **Complete Shopping Flows**: Add to cart, cart management, multi-item checkout
- **User Account Management**: Registration, login, session handling
- **Product Navigation**: Category browsing, product search, filtering
- **Checkout Process**: Form validation, payment processing, order confirmation
- **Alert Dialog Handling**: Robust JavaScript dialog management with retry logic

### 🔧 Technical Excellence

- **Page Object Model (POM)**: Clean separation of test logic and page interactions
- **TypeScript**: Full type safety and modern JavaScript features
- **Custom Fixtures**: Reusable test setup with automatic cleanup
- **Data-Driven Testing**: JSON-based test data for flexible scenarios
- **Smart Waiting**: Auto-waiting for elements, network idle states
- **Error Handling**: Comprehensive retry logic for flaky operations
- **Parallel Execution**: Tests run concurrently for faster feedback

### 🔄 CI/CD Pipeline

- **Jenkins Integration**: 5-stage declarative pipeline with parallel execution
- **GitHub Actions**: Multi-stage workflows with smoke, full, and regression tests
- **Automated Reporting**: HTML reports, JUnit XML, screenshots, and videos
- **Scheduled Testing**: Daily regression runs at 2 AM UTC
- **Multi-Environment Support**: Configurable for dev, staging, production

---

## 🛠️ Technology Stack
