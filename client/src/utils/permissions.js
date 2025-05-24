const USER_TYPES = {
  NORMAL: "normalUser",
  MANAGER: "managerUser",
  ADMIN: "adminUser",
};

const HIERARCHY = {
  [USER_TYPES.NORMAL]: 1,
  [USER_TYPES.MANAGER]: 2,
  [USER_TYPES.ADMIN]: 3,
};

export function hasPermission(userType, requiredType) {
  if (!requiredType || requiredType === "any") return true;
  if (!userType) return false;

  return HIERARCHY[userType] >= HIERARCHY[requiredType];
}

export { USER_TYPES };
