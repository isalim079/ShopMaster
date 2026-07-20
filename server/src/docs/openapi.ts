import { env } from '../core/config/env';

const authTag = 'Auth';
const usersTag = 'Users';
const rolesTag = 'Roles';
const permissionsTag = 'Permissions';
const organizationsTag = 'Organizations';
const settingsTag = 'Settings';
const customersTag = 'Customers';
const suppliersTag = 'Suppliers';
const brandsTag = 'Brands';
const categoriesTag = 'Categories';
const warehousesTag = 'Warehouses';
const productsTag = 'Products';
const inventoryTag = 'Inventory';
const purchasesTag = 'Purchases';
const purchaseReturnsTag = 'Purchase Returns';
const salesTag = 'Sales';
const saleReturnsTag = 'Sale Returns';
const paymentsTag = 'Payments';
const expensesTag = 'Expenses';
const dashboardTag = 'Dashboard';
const reportsTag = 'Reports';
const notificationsTag = 'Notifications';
const auditTag = 'Audit';
const uploadsTag = 'Uploads';

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: `${env.APP_NAME} API`,
    version: '1.0.0',
    description: 'Production-ready Shop ERP REST API',
  },
  servers: [
    {
      url: `${env.SERVER_URL}/api/${env.API_VERSION}`,
    },
  ],
  tags: [
    { name: authTag, description: 'Authentication endpoints' },
    { name: usersTag, description: 'User profile and admin user management' },
    { name: rolesTag, description: 'Role management endpoints' },
    { name: permissionsTag, description: 'Permission and role-permission endpoints' },
    { name: organizationsTag, description: 'Organization / shop tenant endpoints' },
    { name: settingsTag, description: 'User and organization settings endpoints' },
    { name: customersTag, description: 'Customer endpoints' },
    { name: suppliersTag, description: 'Supplier endpoints' },
    { name: brandsTag, description: 'Brand endpoints' },
    { name: categoriesTag, description: 'Category endpoints' },
    { name: warehousesTag, description: 'Warehouse endpoints' },
    { name: productsTag, description: 'Product endpoints' },
    { name: inventoryTag, description: 'Inventory stock and movement endpoints' },
    { name: purchasesTag, description: 'Purchase order endpoints' },
    { name: purchaseReturnsTag, description: 'Purchase return endpoints' },
    { name: salesTag, description: 'Sale / invoice endpoints' },
    { name: saleReturnsTag, description: 'Sale return endpoints' },
    { name: paymentsTag, description: 'Payment endpoints' },
    { name: expensesTag, description: 'Expense endpoints' },
    { name: dashboardTag, description: 'Dashboard analytics endpoints' },
    { name: reportsTag, description: 'Report endpoints' },
    { name: notificationsTag, description: 'Notification endpoints' },
    { name: auditTag, description: 'Audit log endpoints' },
    { name: uploadsTag, description: 'File upload endpoints' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: [authTag],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'email', 'password', 'organizationName'],
                properties: {
                  firstName: { type: 'string', minLength: 2, maxLength: 50 },
                  lastName: { type: 'string', maxLength: 50 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                  organizationName: { type: 'string', minLength: 2, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registration successful',
          },
          '409': {
            description: 'Email already exists',
          },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: [authTag],
        summary: 'Verify email with OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  otp: { type: 'string', minLength: 6, maxLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Email verified' },
          '400': { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/resend-verification': {
      post: {
        tags: [authTag],
        summary: 'Resend email verification OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OTP resent if account exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: [authTag],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful; tokens set as cookies' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: [authTag],
        summary: 'Refresh access token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Tokens refreshed' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: [authTag],
        summary: 'Logout and revoke refresh token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Logged out' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: [authTag],
        summary: 'Request password reset OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OTP sent if account exists' },
        },
      },
    },
    '/auth/verify-reset-otp': {
      post: {
        tags: [authTag],
        summary: 'Verify password reset OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  otp: { type: 'string', minLength: 6, maxLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Returns resetToken' },
          '400': { description: 'Invalid OTP' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: [authTag],
        summary: 'Reset password with reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resetToken', 'password'],
                properties: {
                  resetToken: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset successful' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: [usersTag],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: [usersTag],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', minLength: 2, maxLength: 50 },
                  lastName: { type: 'string', maxLength: 50 },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Profile updated' },
          '409': { description: 'Phone already in use' },
        },
      },
    },
    '/users/me/change-password': {
      patch: {
        tags: [usersTag],
        summary: 'Change current user password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed; cookies cleared' },
          '400': { description: 'Invalid current password' },
        },
      },
    },
    '/users': {
      get: {
        tags: [usersTag],
        summary: 'List users (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
            },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'BLOCKED'],
            },
          },
        ],
        responses: {
          '200': { description: 'Paginated user list' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/users/{id}/role': {
      patch: {
        tags: [usersTag],
        summary: 'Update user role (super admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roleId'],
                properties: {
                  roleId: {
                    type: 'string',
                    description: 'Role id',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Role updated' },
          '400': { description: 'Cannot change own role' },
        },
      },
    },
    '/users/{id}/status': {
      patch: {
        tags: [usersTag],
        summary: 'Update user status (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'ACTIVE', 'BLOCKED'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '400': { description: 'Cannot change own status' },
        },
      },
    },
    '/users/{id}': {
      delete: {
        tags: [usersTag],
        summary: 'Delete user (super admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'User deleted' },
          '400': { description: 'Cannot delete own account' },
        },
      },
    },
    '/roles': {
      post: {
        tags: [rolesTag],
        summary: 'Create a custom role',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100 },
                  slug: { type: 'string', minLength: 2, maxLength: 50 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Role created' },
          '409': { description: 'Slug already exists' },
        },
      },
      get: {
        tags: [rolesTag],
        summary: 'List roles',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'isSystem',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
        ],
        responses: {
          '200': { description: 'Paginated roles' },
        },
      },
    },
    '/roles/{id}': {
      get: {
        tags: [rolesTag],
        summary: 'Get role by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Role details' },
          '404': { description: 'Role not found' },
        },
      },
      patch: {
        tags: [rolesTag],
        summary: 'Update role name/description',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100 },
                  description: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Role updated' },
        },
      },
      delete: {
        tags: [rolesTag],
        summary: 'Delete custom role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Role deleted' },
          '400': { description: 'System role cannot be deleted' },
          '409': { description: 'Role assigned to users' },
        },
      },
    },
    '/permissions': {
      post: {
        tags: [permissionsTag],
        summary: 'Create a custom permission',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug', 'module'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string', example: 'products:read' },
                  module: { type: 'string', example: 'products' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Permission created' },
          '409': { description: 'Slug already exists' },
        },
      },
      get: {
        tags: [permissionsTag],
        summary: 'List permissions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'module', in: 'query', schema: { type: 'string' } },
          {
            name: 'isSystem',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
        ],
        responses: {
          '200': { description: 'Paginated permissions' },
        },
      },
    },
    '/permissions/role/{roleId}': {
      get: {
        tags: [permissionsTag],
        summary: 'List permissions assigned to a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Role permissions' },
          '404': { description: 'Role not found' },
        },
      },
      put: {
        tags: [permissionsTag],
        summary: 'Sync permissions for a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissionIds'],
                properties: {
                  permissionIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Role permissions synced' },
          '400': { description: 'Cannot sync Super Admin permissions' },
        },
      },
    },
    '/permissions/{id}': {
      get: {
        tags: [permissionsTag],
        summary: 'Get permission by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Permission details' },
        },
      },
      patch: {
        tags: [permissionsTag],
        summary: 'Update permission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  module: { type: 'string' },
                  description: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Permission updated' },
        },
      },
      delete: {
        tags: [permissionsTag],
        summary: 'Delete custom permission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Permission deleted' },
          '400': { description: 'System permission cannot be deleted' },
          '409': { description: 'Permission assigned to roles' },
        },
      },
    },
    '/organizations/me': {
      get: {
        tags: [organizationsTag],
        summary: 'Get current user organization',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current organization' },
        },
      },
      patch: {
        tags: [organizationsTag],
        summary: 'Update current user organization',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  country: { type: 'string' },
                  taxId: { type: 'string' },
                  currency: { type: 'string' },
                  timezone: { type: 'string' },
                  logoUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Organization updated' },
        },
      },
    },
    '/organizations': {
      post: {
        tags: [organizationsTag],
        summary: 'Create organization (super admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  currency: { type: 'string' },
                  timezone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Organization created' },
        },
      },
      get: {
        tags: [organizationsTag],
        summary: 'List organizations (super admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated organizations' },
        },
      },
    },
    '/organizations/{id}': {
      get: {
        tags: [organizationsTag],
        summary: 'Get organization by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Organization details' },
          '403': { description: 'Forbidden for other organizations' },
        },
      },
      patch: {
        tags: [organizationsTag],
        summary: 'Update organization',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Organization updated' },
        },
      },
      delete: {
        tags: [organizationsTag],
        summary: 'Deactivate organization (super admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Organization deactivated' },
        },
      },
    },
    '/settings/me': {
      get: {
        tags: [settingsTag],
        summary: 'Get current user settings (theme)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User settings' },
        },
      },
      patch: {
        tags: [settingsTag],
        summary: 'Update current user settings (theme)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['theme'],
                properties: {
                  theme: { type: 'string', enum: ['LIGHT', 'DARK'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User settings updated' },
        },
      },
    },
    '/settings/organization': {
      get: {
        tags: [settingsTag],
        summary: 'List organization settings',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Organization settings list' },
        },
      },
      put: {
        tags: [settingsTag],
        summary: 'Bulk upsert organization settings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['settings'],
                properties: {
                  settings: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['key', 'value'],
                      properties: {
                        key: {
                          type: 'string',
                          enum: [
                            'invoice.prefix',
                            'invoice.next_number',
                            'inventory.low_stock_threshold',
                            'sale.allow_negative_stock',
                            'date.format',
                            'number.decimal_places',
                          ],
                        },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Organization settings updated' },
        },
      },
    },
    '/settings/organization/{key}': {
      get: {
        tags: [settingsTag],
        summary: 'Get organization setting by key',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'invoice.prefix',
                'invoice.next_number',
                'inventory.low_stock_threshold',
                'sale.allow_negative_stock',
                'date.format',
                'number.decimal_places',
              ],
            },
          },
        ],
        responses: {
          '200': { description: 'Organization setting' },
          '404': { description: 'Setting not found' },
        },
      },
      put: {
        tags: [settingsTag],
        summary: 'Upsert organization setting by key',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: [
                'invoice.prefix',
                'invoice.next_number',
                'inventory.low_stock_threshold',
                'sale.allow_negative_stock',
                'date.format',
                'number.decimal_places',
              ],
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['value'],
                properties: {
                  value: { type: 'string', minLength: 1, maxLength: 255 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Organization setting updated' },
        },
      },
    },
    '/customers': {
      post: {
        tags: [customersTag],
        summary: 'Create customer',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  country: { type: 'string' },
                  taxId: { type: 'string' },
                  creditLimit: { type: 'number' },
                  notes: { type: 'string' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Customer created' },
        },
      },
      get: {
        tags: [customersTag],
        summary: 'List customers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated customers' },
        },
      },
    },
    '/customers/{id}': {
      get: {
        tags: [customersTag],
        summary: 'Get customer by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Customer details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [customersTag],
        summary: 'Update customer',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Customer updated' },
        },
      },
      delete: {
        tags: [customersTag],
        summary: 'Deactivate customer',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Customer deactivated' },
        },
      },
    },
    '/suppliers': {
      post: {
        tags: [suppliersTag],
        summary: 'Create supplier',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  country: { type: 'string' },
                  taxId: { type: 'string' },
                  notes: { type: 'string' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Supplier created' },
        },
      },
      get: {
        tags: [suppliersTag],
        summary: 'List suppliers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated suppliers' },
        },
      },
    },
    '/suppliers/{id}': {
      get: {
        tags: [suppliersTag],
        summary: 'Get supplier by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Supplier details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [suppliersTag],
        summary: 'Update supplier',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Supplier updated' },
        },
      },
      delete: {
        tags: [suppliersTag],
        summary: 'Deactivate supplier',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Supplier deactivated' },
        },
      },
    },
    '/brands': {
      post: {
        tags: [brandsTag],
        summary: 'Create brand',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  logoUrl: { type: 'string', format: 'uri' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Brand created' },
          '409': { description: 'Name already exists' },
        },
      },
      get: {
        tags: [brandsTag],
        summary: 'List brands',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated brands' },
        },
      },
    },
    '/brands/{id}': {
      get: {
        tags: [brandsTag],
        summary: 'Get brand by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Brand details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [brandsTag],
        summary: 'Update brand',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Brand updated' },
          '409': { description: 'Name already exists' },
        },
      },
      delete: {
        tags: [brandsTag],
        summary: 'Deactivate brand',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Brand deactivated' },
        },
      },
    },
    '/categories': {
      post: {
        tags: [categoriesTag],
        summary: 'Create category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  parentId: { type: 'string' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Category created' },
          '409': { description: 'Name already exists' },
        },
      },
      get: {
        tags: [categoriesTag],
        summary: 'List categories',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated categories' },
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: [categoriesTag],
        summary: 'Get category by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Category details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [categoriesTag],
        summary: 'Update category',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Category updated' },
          '409': { description: 'Name already exists' },
        },
      },
      delete: {
        tags: [categoriesTag],
        summary: 'Deactivate category',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Category deactivated' },
        },
      },
    },
    '/warehouses': {
      post: {
        tags: [warehousesTag],
        summary: 'Create warehouse',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  code: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  country: { type: 'string' },
                  isDefault: { type: 'boolean' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Warehouse created' },
          '409': { description: 'Name already exists' },
        },
      },
      get: {
        tags: [warehousesTag],
        summary: 'List warehouses',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated warehouses' },
        },
      },
    },
    '/warehouses/{id}': {
      get: {
        tags: [warehousesTag],
        summary: 'Get warehouse by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Warehouse details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [warehousesTag],
        summary: 'Update warehouse',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Warehouse updated' },
          '409': { description: 'Name already exists' },
        },
      },
      delete: {
        tags: [warehousesTag],
        summary: 'Deactivate warehouse',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Warehouse deactivated' },
        },
      },
    },
    '/products': {
      post: {
        tags: [productsTag],
        summary: 'Create product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'purchasePrice', 'salePrice'],
                properties: {
                  name: { type: 'string' },
                  sku: { type: 'string' },
                  barcode: { type: 'string' },
                  description: { type: 'string' },
                  categoryId: { type: 'string' },
                  brandId: { type: 'string' },
                  unit: { type: 'string' },
                  purchasePrice: { type: 'number' },
                  salePrice: { type: 'number' },
                  taxRate: { type: 'number' },
                  reorderLevel: { type: 'number' },
                  imageUrl: { type: 'string', format: 'uri' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                  warehouseId: { type: 'string' },
                  openingStock: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Product created' },
          '409': { description: 'SKU already exists' },
        },
      },
      get: {
        tags: [productsTag],
        summary: 'List products',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'brandId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated products' },
        },
      },
    },
    '/products/search': {
      get: {
        tags: [productsTag],
        summary: 'Search products',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'brandId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated products' },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: [productsTag],
        summary: 'Get product by id (includes stock info)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Product details with stocks' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [productsTag],
        summary: 'Update product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Product updated' },
          '409': { description: 'SKU already exists' },
        },
      },
      delete: {
        tags: [productsTag],
        summary: 'Deactivate product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Product deactivated' },
        },
      },
    },
    '/products/{id}/stock': {
      patch: {
        tags: [productsTag],
        summary: 'Adjust product stock',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['warehouseId', 'quantity'],
                properties: {
                  warehouseId: { type: 'string' },
                  quantity: { type: 'number', description: 'Signed delta' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Stock adjusted' },
          '400': { description: 'Negative stock or invalid data' },
        },
      },
    },
    '/inventory': {
      get: {
        tags: [inventoryTag],
        summary: 'List inventory stocks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'warehouseId', in: 'query', schema: { type: 'string' } },
          { name: 'productId', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'lowStock', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: {
          '200': { description: 'Paginated inventory stocks' },
        },
      },
    },
    '/inventory/history': {
      get: {
        tags: [inventoryTag],
        summary: 'List inventory movements',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'productId', in: 'query', schema: { type: 'string' } },
          { name: 'warehouseId', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['ADJUSTMENT', 'PURCHASE', 'PURCHASE_RETURN', 'SALE', 'SALE_RETURN', 'TRANSFER_IN', 'TRANSFER_OUT'] } },
        ],
        responses: {
          '200': { description: 'Paginated inventory movements' },
        },
      },
    },
    '/inventory/adjustment': {
      post: {
        tags: [inventoryTag],
        summary: 'Create stock adjustment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'warehouseId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  warehouseId: { type: 'string' },
                  quantity: { type: 'number', description: 'Signed quantity' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Adjustment created' },
          '400': { description: 'Would result in negative stock' },
        },
      },
    },
    '/purchases': {
      post: {
        tags: [purchasesTag],
        summary: 'Create purchase order (DRAFT or ORDERED)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['supplierId', 'warehouseId', 'items'],
                properties: {
                  supplierId: { type: 'string' },
                  warehouseId: { type: 'string' },
                  orderDate: { type: 'string', format: 'date-time' },
                  expectedDate: { type: 'string', format: 'date-time' },
                  status: { type: 'string', enum: ['DRAFT', 'ORDERED'] },
                  discountAmount: { type: 'number' },
                  notes: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity', 'unitCost'],
                      properties: {
                        productId: { type: 'string' },
                        quantity: { type: 'number' },
                        unitCost: { type: 'number' },
                        taxRate: { type: 'number' },
                        discount: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Purchase created' },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        tags: [purchasesTag],
        summary: 'List purchase orders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'COMPLETED', 'CANCELLED'] } },
          { name: 'supplierId', in: 'query', schema: { type: 'string' } },
          { name: 'warehouseId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated purchases' },
        },
      },
    },
    '/purchases/{id}': {
      get: {
        tags: [purchasesTag],
        summary: 'Get purchase by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Purchase details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [purchasesTag],
        summary: 'Update draft purchase',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Purchase updated' },
          '400': { description: 'Only draft purchases can be updated' },
        },
      },
      delete: {
        tags: [purchasesTag],
        summary: 'Cancel purchase',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Purchase cancelled' },
          '400': { description: 'Cannot cancel purchase' },
        },
      },
    },
    '/purchases/{id}/receive': {
      post: {
        tags: [purchasesTag],
        summary: 'Receive items against purchase (stock IN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['purchaseItemId', 'quantity'],
                      properties: {
                        purchaseItemId: { type: 'string' },
                        quantity: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Purchase received' },
          '400': { description: 'Receive quantity exceeds outstanding' },
        },
      },
    },
    '/purchase-returns': {
      post: {
        tags: [purchaseReturnsTag],
        summary: 'Create purchase return (stock OUT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['purchaseId', 'items'],
                properties: {
                  purchaseId: { type: 'string' },
                  returnDate: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['purchaseItemId', 'quantity'],
                      properties: {
                        purchaseItemId: { type: 'string' },
                        quantity: { type: 'number' },
                        unitCost: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Purchase return created' },
          '400': { description: 'Quantity exceeds returnable' },
        },
      },
      get: {
        tags: [purchaseReturnsTag],
        summary: 'List purchase returns',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'COMPLETED', 'CANCELLED'] } },
          { name: 'purchaseId', in: 'query', schema: { type: 'string' } },
          { name: 'supplierId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated purchase returns' },
        },
      },
    },
    '/purchase-returns/{id}': {
      get: {
        tags: [purchaseReturnsTag],
        summary: 'Get purchase return by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Purchase return details' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/sales': {
      post: {
        tags: [salesTag],
        summary: 'Create sale (DRAFT or COMPLETED)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['warehouseId', 'items'],
                properties: {
                  warehouseId: { type: 'string' },
                  customerId: { type: 'string' },
                  saleDate: { type: 'string', format: 'date-time' },
                  status: { type: 'string', enum: ['DRAFT', 'COMPLETED'], default: 'COMPLETED' },
                  discountAmount: { type: 'number' },
                  notes: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity', 'unitPrice'],
                      properties: {
                        productId: { type: 'string' },
                        quantity: { type: 'number' },
                        unitPrice: { type: 'number' },
                        taxRate: { type: 'number' },
                        discount: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Sale created (stock deducted when COMPLETED)' },
          '400': { description: 'Validation error or insufficient stock' },
        },
      },
      get: {
        tags: [salesTag],
        summary: 'List sales',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'COMPLETED', 'CANCELLED'] } },
          { name: 'paymentStatus', in: 'query', schema: { type: 'string', enum: ['UNPAID', 'PARTIAL', 'PAID'] } },
          { name: 'customerId', in: 'query', schema: { type: 'string' } },
          { name: 'warehouseId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated sales' },
        },
      },
    },
    '/sales/{id}': {
      get: {
        tags: [salesTag],
        summary: 'Get sale by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        tags: [salesTag],
        summary: 'Update draft sale',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale updated' },
          '400': { description: 'Only draft sales can be updated' },
        },
      },
      delete: {
        tags: [salesTag],
        summary: 'Cancel draft sale',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale cancelled' },
          '400': { description: 'Only draft sales can be cancelled' },
        },
      },
    },
    '/sales/{id}/complete': {
      post: {
        tags: [salesTag],
        summary: 'Complete draft sale (stock OUT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale completed' },
          '400': { description: 'Insufficient stock or invalid state' },
        },
      },
    },
    '/sales/{id}/invoice': {
      get: {
        tags: [salesTag],
        summary: 'Get printable sale invoice payload',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale invoice details' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/sale-returns': {
      post: {
        tags: [saleReturnsTag],
        summary: 'Create sale return (stock IN)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['saleId', 'items'],
                properties: {
                  saleId: { type: 'string' },
                  returnDate: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['saleItemId', 'quantity'],
                      properties: {
                        saleItemId: { type: 'string' },
                        quantity: { type: 'number' },
                        unitPrice: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Sale return created' },
          '400': { description: 'Quantity exceeds returnable' },
        },
      },
      get: {
        tags: [saleReturnsTag],
        summary: 'List sale returns',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'COMPLETED', 'CANCELLED'] } },
          { name: 'saleId', in: 'query', schema: { type: 'string' } },
          { name: 'customerId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated sale returns' },
        },
      },
    },
    '/sale-returns/{id}': {
      get: {
        tags: [saleReturnsTag],
        summary: 'Get sale return by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Sale return details' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/payments': {
      get: {
        tags: [paymentsTag],
        summary: 'List payments',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated payments' } },
      },
      post: {
        tags: [paymentsTag],
        summary: 'Create payment',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Payment created' } },
      },
    },
    '/payments/{id}': {
      get: {
        tags: [paymentsTag],
        summary: 'Get payment by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Payment details' } },
      },
      delete: {
        tags: [paymentsTag],
        summary: 'Delete payment (reverses paid amounts)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Payment deleted' } },
      },
    },
    '/expenses': {
      get: {
        tags: [expensesTag],
        summary: 'List expenses',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated expenses' } },
      },
      post: {
        tags: [expensesTag],
        summary: 'Create expense',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Expense created' } },
      },
    },
    '/expense-categories': {
      get: {
        tags: [expensesTag],
        summary: 'List expense categories',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated expense categories' } },
      },
      post: {
        tags: [expensesTag],
        summary: 'Create expense category',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Expense category created' } },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: [dashboardTag],
        summary: 'Dashboard summary',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Summary metrics' } },
      },
    },
    '/dashboard/today': {
      get: {
        tags: [dashboardTag],
        summary: 'Today stats',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Today metrics' } },
      },
    },
    '/dashboard/weekly': {
      get: {
        tags: [dashboardTag],
        summary: 'Weekly series',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Weekly points' } },
      },
    },
    '/dashboard/monthly': {
      get: {
        tags: [dashboardTag],
        summary: 'Monthly series',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Monthly points' } },
      },
    },
    '/dashboard/charts': {
      get: {
        tags: [dashboardTag],
        summary: 'Charts series',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Chart points' } },
      },
    },
    '/dashboard/top-products': {
      get: {
        tags: [dashboardTag],
        summary: 'Top selling products',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Top products' } },
      },
    },
    '/dashboard/top-customers': {
      get: {
        tags: [dashboardTag],
        summary: 'Top customers',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Top customers' } },
      },
    },
    '/reports/sales': {
      get: {
        tags: [reportsTag],
        summary: 'Sales report',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Sales report rows' } },
      },
    },
    '/reports/purchases': {
      get: {
        tags: [reportsTag],
        summary: 'Purchases report',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Purchases report rows' } },
      },
    },
    '/reports/inventory': {
      get: {
        tags: [reportsTag],
        summary: 'Inventory valuation report',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Inventory report rows' } },
      },
    },
    '/reports/expenses': {
      get: {
        tags: [reportsTag],
        summary: 'Expenses report',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Expenses report rows' } },
      },
    },
    '/reports/profit-loss': {
      get: {
        tags: [reportsTag],
        summary: 'Profit and loss summary',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'P&L summary' } },
      },
    },
    '/notifications': {
      get: {
        tags: [notificationsTag],
        summary: 'List notifications',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated notifications' } },
      },
      post: {
        tags: [notificationsTag],
        summary: 'Create notification',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Notification created' } },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: [notificationsTag],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Marked as read' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: [notificationsTag],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Notification updated' } },
      },
    },
    '/audit-logs': {
      get: {
        tags: [auditTag],
        summary: 'List audit logs',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated audit logs' } },
      },
    },
    '/uploads': {
      get: {
        tags: [uploadsTag],
        summary: 'List uploads',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Paginated uploads' } },
      },
      post: {
        tags: [uploadsTag],
        summary: 'Upload file (multipart field: file)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Upload created' } },
      },
    },
    '/uploads/{id}': {
      get: {
        tags: [uploadsTag],
        summary: 'Get upload by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Upload details' } },
      },
      delete: {
        tags: [uploadsTag],
        summary: 'Delete upload',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Upload deleted' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
