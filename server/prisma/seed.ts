import { PrismaClient } from '@prisma/client';

import { SYSTEM_ROLES } from '../src/core/constants/roles';
import {
  ROLE_DEFAULT_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from '../src/core/constants/permissions';
import { getDefaultOrganizationSettings } from '../src/core/constants/settings';

const prisma = new PrismaClient();

async function main() {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: {
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
      },
    });
  }

  for (const permission of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {
        name: permission.name,
        module: permission.module,
        description: permission.description,
        isSystem: permission.isSystem,
      },
      create: {
        name: permission.name,
        slug: permission.slug,
        module: permission.module,
        description: permission.description,
        isSystem: permission.isSystem,
      },
    });
  }

  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const permissionBySlug = new Map(
    permissions.map((permission) => [permission.slug, permission]),
  );

  for (const role of roles) {
    const defaultSlugs = ROLE_DEFAULT_PERMISSIONS[role.slug] ?? [];

    if (defaultSlugs.length === 0) {
      continue;
    }

    const permissionIds = defaultSlugs
      .map((slug) => permissionBySlug.get(slug)?.id)
      .filter((id): id is string => Boolean(id));

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }

  const organizations = await prisma.organization.findMany({
    select: { id: true },
  });
  const defaults = getDefaultOrganizationSettings();

  for (const organization of organizations) {
    await prisma.organizationSetting.createMany({
      data: defaults.map((setting) => ({
        organizationId: organization.id,
        key: setting.key,
        value: setting.value,
        description: setting.description,
      })),
      skipDuplicates: true,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
