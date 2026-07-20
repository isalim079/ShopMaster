# AI Agent Working Rules

This project is developed using Cursor Auto Mode.

The AI Agent is expected to work as a senior backend engineer.

Never generate random code.

Never generate placeholder code.

Never create unnecessary files.

Always read the existing codebase before making changes.

Never change existing architecture unless absolutely necessary.

--------------------------------------------------

# Workflow

Always work module by module.

Never work on multiple modules simultaneously.

A module is considered complete only when ALL of the following are finished.

✅ Prisma Model

✅ Repository

✅ Service

✅ Controller

✅ Route

✅ Validation

✅ Types

✅ Mapper

✅ Swagger Documentation

✅ Unit Tests

✅ Integration Tests

✅ Seed (if required)

Only after completing one module may you continue to the next.

--------------------------------------------------

# Development Order

Build modules in exactly this order.

1.
Authentication ✅ DONE

2.
Users ✅ DONE

3.
Roles ✅ DONE

4.
Permissions ✅ DONE

5.
Organization ✅ DONE

6.
Settings ✅ DONE

7.
Customer ✅ DONE

8.
Supplier ✅ DONE

9.
Brand ✅ DONE

10.
Category ✅ DONE

11.
Warehouse ✅ DONE

12.
Product ✅ DONE

13.
Inventory ✅ DONE

14.
Purchase ✅ DONE

15.
Purchase Return ✅ DONE

16.
Sale ✅ DONE

17.
Sale Return ✅ DONE

18.
Payment ✅ DONE

19.
Expense ✅ DONE

20.
Dashboard ✅ DONE

21.
Reports ✅ DONE

22.
Notification ✅ DONE

23.
Audit ✅ DONE

24.
Upload ✅ DONE

Never skip modules.

--------------------------------------------------

# API Requirements

Every module must expose proper REST APIs.

Example

Customer

POST    /customers

GET     /customers

GET     /customers/:id

PATCH   /customers/:id

DELETE  /customers/:id

Product

POST    /products

GET     /products

GET     /products/:id

PATCH   /products/:id

DELETE  /products/:id

GET     /products/search

PATCH   /products/:id/stock

Inventory

GET     /inventory

GET     /inventory/history

POST    /inventory/adjustment

Purchase

POST

GET

PATCH

DELETE

Receive Purchase

Sales

POST

GET

PATCH

DELETE

Invoice

Payment

Dashboard

Summary

Today

Weekly

Monthly

Charts

Top Products

Top Customers

Reports

Sales

Purchase

Inventory

Expense

Profit & Loss

--------------------------------------------------

# While Building a Module

The AI must

Create Prisma Model

Generate Migration

Generate Repository

Generate Service

Generate Controller

Generate Routes

Generate Validation

Generate Types

Generate Mapper

Register Routes

Add Swagger

Create Tests

Update README if needed

Do NOT leave unfinished work.

--------------------------------------------------

# Before Moving To Next Module

The AI must verify

✓ Project compiles

✓ TypeScript has zero errors

✓ ESLint passes

✓ Prisma Generate passes

✓ Prisma Migration passes

✓ Build succeeds

✓ Tests pass

Only then continue.

--------------------------------------------------

# Code Quality

Controllers must remain thin.

Business logic belongs in Services.

Database queries belong in Repositories.

Never access Prisma directly inside Controllers.

Never duplicate business logic.

Extract reusable code.

Prefer reusable utilities.

Use Transactions whenever multiple tables are modified.

--------------------------------------------------

# Security

Always

Hash Passwords

Hash OTPs

Hash Refresh Tokens

Validate JWT

Use RBAC

Use Middleware

Use Secure Cookies

Never expose

password

OTP

refreshToken

Never return Prisma models directly.

Always map to DTOs.

--------------------------------------------------

# Performance

Always use

Pagination

Search

Filtering

Sorting

Indexes

Prisma Select

Avoid N+1 Queries.

--------------------------------------------------

# Agent Behaviour

Before starting a module

1.
Read existing code.

2.
Understand architecture.

3.
Reuse existing utilities.

4.
Do not duplicate functionality.

5.
Check existing constants.

6.
Check existing middleware.

7.
Check existing services.

--------------------------------------------------

# Stopping Rule

When one module is complete

STOP.

Do NOT continue automatically.

Wait for developer review.

Only after approval may you continue to the next module.

--------------------------------------------------

# Final Goal

The final project should be production-ready and deployable without architectural changes.

The code quality should be suitable for a commercial ERP used by thousands of businesses.

Never sacrifice code quality for speed.