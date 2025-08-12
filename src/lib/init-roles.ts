import dbConnect from './db';
import Role from '@/models/Role';

export async function initializeDefaultRoles() {
  try {
    await dbConnect();

    // Define default system roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Full system administrator with all permissions',
        permissions: [
          'user_management',
          'role_management',
          'content_moderation',
          'system_settings',
          'data_recovery',
          'database_management',
          'image_management',
          'system_alerts',
          'analytics',
          'backup_restore',
          'rate_limit_management',
          'blocked_credentials_management'
        ],
        isSystem: true,
        userCount: 0,
      },
      {
        name: 'moderator',
        description: 'Content moderator with limited administrative permissions',
        permissions: [
          'content_moderation',
          'user_management',
          'data_recovery',
          'system_alerts',
          'analytics'
        ],
        isSystem: true,
        userCount: 0,
      },
      {
        name: 'user',
        description: 'Standard user with basic permissions',
        permissions: [
          'generate_captions',
          'view_own_posts',
          'edit_own_profile',
          'delete_own_account'
        ],
        isSystem: true,
        userCount: 0,
      },
      {
        name: 'premium',
        description: 'Premium user with enhanced features',
        permissions: [
          'generate_captions',
          'view_own_posts',
          'edit_own_profile',
          'delete_own_account',
          'priority_support',
          'advanced_features',
          'bulk_operations'
        ],
        isSystem: true,
        userCount: 0,
      }
    ];

    // Check and create default roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (!existingRole) {
        console.log(`Creating default role: ${roleData.name}`);
        await Role.create(roleData);
      } else {
        // Update existing role permissions if needed (but preserve isSystem flag)
        if (existingRole.isSystem) {
          const needsUpdate = JSON.stringify(existingRole.permissions.sort()) !== 
                             JSON.stringify(roleData.permissions.sort());
          
          if (needsUpdate) {
            console.log(`Updating permissions for system role: ${roleData.name}`);
            await Role.findByIdAndUpdate(existingRole._id, {
              permissions: roleData.permissions,
              description: roleData.description
            });
          }
        }
      }
    }

    console.log('✅ Default roles initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing default roles:', error);
  }
}

// Function to get role by name
export async function getRoleByName(roleName: string) {
  try {
    await dbConnect();
    return await Role.findOne({ name: roleName });
  } catch (error) {
    console.error(`Error getting role ${roleName}:`, error);
    return null;
  }
}

// Function to check if user has permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    await dbConnect();
    
    // TODO: Implement proper user-role relationship
    // For now, this is a placeholder that will need to be updated
    // when we implement the User model with role assignments
    
    // This should check the user's assigned role and verify permissions
    return false;
  } catch (error) {
    console.error(`Error checking permission ${permission} for user ${userId}:`, error);
    return false;
  }
}
