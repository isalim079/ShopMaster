You are a Principal Mobile Software Architect with 20+ years of experience building enterprise React Native applications.

Your first task is NOT to build the application.

Your first task is to design and document the entire project.

This repository will become a production-grade Shop ERP Mobile Application used by thousands of businesses.

The documentation should be good enough that a new senior engineer can join the project and understand everything without asking questions.

====================================================================

TECH STACK

Use these technologies only.

React Native

Expo (Latest Stable SDK)

Expo Router

TypeScript

Redux Toolkit

RTK Query

React Hook Form

Zod

Expo Secure Store

Expo SQLite

React Native Reanimated

React Native Gesture Handler

React Native SVG

Lottie

FlashList

Expo Image

React Native Bottom Sheet

React Native MMKV (if appropriate)

Material Design 3 principles

====================================================================

FIRST TASK

DO NOT BUILD THE APP.

Instead, create complete documentation.

Create a docs folder.

Inside docs generate the following files.

README.md

PROJECT_OVERVIEW.md

ARCHITECTURE.md

FOLDER_STRUCTURE.md

STATE_MANAGEMENT.md

RTK_QUERY_GUIDE.md

REDUX_GUIDE.md

API_INTEGRATION.md

AUTHENTICATION.md

OFFLINE_FIRST.md

SYNC_ENGINE.md

DATABASE_GUIDE.md

THEME_GUIDE.md

DESIGN_SYSTEM.md

COLOR_SYSTEM.md

TYPOGRAPHY.md

SPACING_SYSTEM.md

COMPONENT_GUIDELINES.md

UI_GUIDELINES.md

UX_GUIDELINES.md

ANIMATION_GUIDELINES.md

NAVIGATION_GUIDE.md

SCREEN_STANDARDS.md

FORM_GUIDELINES.md

ERROR_HANDLING.md

LOADING_STATES.md

EMPTY_STATES.md

ACCESSIBILITY.md

RESPONSIVENESS.md

PERFORMANCE_GUIDE.md

SECURITY_GUIDE.md

TESTING_GUIDE.md

CODE_STYLE.md

AI_AGENT_RULES.md

DEVELOPMENT_WORKFLOW.md

MODULE_DEVELOPMENT_GUIDE.md

MODULE_ORDER.md

RELEASE_CHECKLIST.md

CONTRIBUTING.md

====================================================================

README.md

Should contain

Project Vision

Architecture Summary

Tech Stack

Folder Structure

Getting Started

Coding Standards

Development Workflow

Documentation Index

====================================================================

PROJECT OVERVIEW

Explain

Business Goals

Target Users

Main Features

Future Scope

Non Functional Requirements

====================================================================

ARCHITECTURE

Explain

Feature Based Architecture

Clean Architecture

Repository Pattern

Service Layer

Presentation Layer

Data Layer

Offline Layer

Network Layer

Navigation Layer

State Layer

Theme Layer

====================================================================

FOLDER STRUCTURE

Explain every folder.

Explain why it exists.

Explain naming convention.

====================================================================

STATE MANAGEMENT

Explain

Redux Toolkit

RTK Query

When to use Redux

When to use RTK Query

When to use Local State

When NOT to use Redux

====================================================================

RTK QUERY GUIDE

Explain

API Structure

Base API

Inject Endpoints

Tags

Caching

Invalidation

Pagination

Infinite Scroll

Optimistic Updates

Error Handling

Retry Logic

Refresh Token Flow

====================================================================

OFFLINE

Explain

SQLite

Queue

Sync

Conflict Resolution

Background Sync

Retry Strategy

Cache Strategy

====================================================================

UI DESIGN

The UI must be premium.

Minimal.

Modern.

Elegant.

Smooth.

Professional.

No clutter.

Lots of whitespace.

Large touch targets.

Rounded corners.

Subtle shadows.

Beautiful cards.

Minimal borders.

====================================================================

COLOR SYSTEM

Design a premium green-based design system.

Provide

Primary

Secondary

Accent

Success

Warning

Danger

Info

Background

Surface

Text

Border

Divider

Disabled

Dark Theme

Explain why every color exists.

====================================================================

TYPOGRAPHY

Use Inter.

Create typography scale.

Display

Headline

Title

Body

Caption

Label

Button

Explain font weights.

====================================================================

SPACING

Use 8 point spacing system.

Explain spacing rules.

====================================================================

COMPONENTS

Define reusable components.

Buttons

Cards

TextFields

Dialogs

Bottom Sheets

Dropdowns

AppBar

Search

Loader

Skeleton

Empty State

Error State

Badge

Avatar

Charts

FAB

Tabs

List Item

Switch

Checkbox

Radio

SnackBar

Toast

====================================================================

ANIMATION

The application should feel like

Google Wallet

Google Home

Apple Wallet

Apple Settings

Notion Mobile

Animations should be

Subtle

Fast

Natural

Never flashy.

Explain

Page Transition

Fade

Scale

Hero

Micro Interaction

Button Press

Card Press

Ripple

Pull To Refresh

Loading

Skeleton

Charts

Bottom Sheet

Modal

Navigation

====================================================================

SCREEN STANDARDS

Every screen must include

Loading State

Error State

Empty State

Offline State

Retry

Pull To Refresh

Pagination

Search

Filter

Sort

Accessibility

Responsive Layout

Dark Mode

Animation

Skeleton Loading

====================================================================

PERFORMANCE

Explain

60 FPS

120 FPS

FlashList

Memoization

React.memo

useMemo

useCallback

Image Optimization

Bundle Size

Lazy Loading

Code Splitting

Avoid unnecessary re-render

====================================================================

SECURITY

JWT

Secure Storage

Refresh Token

Token Rotation

SSL Pinning (future)

Certificate Pinning

Root Detection (future)

Jailbreak Detection (future)

Sensitive Data

Secure Logging

====================================================================

TESTING

Unit

Integration

Widget

E2E

Testing Library

Mocking RTK Query

====================================================================

AI AGENT RULES

This is extremely important.

The AI Agent must

Read existing code before modifying anything.

Never overwrite working code.

Never create duplicate components.

Never duplicate hooks.

Never duplicate colors.

Never duplicate constants.

Never duplicate API logic.

Reuse everything.

Refactor only when necessary.

Keep components under 200 lines.

Keep screens under 300 lines.

Keep hooks focused.

Keep files organized.

Never generate placeholder code.

Never generate TODOs.

Never generate fake APIs.

Never generate fake data unless requested.

Never create unnecessary packages.

Always ask before installing new packages.

====================================================================

DEVELOPMENT WORKFLOW

Build one feature at a time.

A feature is complete only if

UI

API

RTK Query

Redux

Offline

Loading

Error

Empty

Animation

Accessibility

Dark Theme

Testing

Documentation

are completed.

Stop after every feature.

Wait for review.

Never continue automatically.

====================================================================

MODULE ORDER

Authentication

Dashboard

Profile

Category

Brand

Supplier

Customer

Warehouse

Product

Inventory

Purchase

Purchase Return

Sales

Sales Return

Expense

Reports

Notification

Settings

====================================================================

FINAL GOAL

The documentation should be so complete that another AI agent can build the entire application using only these documents.

Write everything in professional Markdown.

Use diagrams where useful.

Include code examples where useful.

Do not summarize.

Create comprehensive documentation suitable for a production enterprise project.