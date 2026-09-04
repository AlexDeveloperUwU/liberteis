import axios from "axios";

/**
 * Fetches all users once and fills an id -> name map, so views can resolve
 * creator/booker names locally instead of one request per row.
 * @param {object} usersMap - Reactive object (ref map) keyed by user id.
 * @returns {Promise<boolean>} Whether the batch load succeeded (false e.g. when
 *   the current user's role cannot list users — fall back to per-id lookups).
 */
export const loadUsersIntoMap = async (usersMap) => {
  try {
    const response = await axios.get("/api/users");
    if (!response.data.success || !Array.isArray(response.data.data)) {
      return false;
    }
    for (const user of response.data.data) {
      if (user && user.id && !usersMap[user.id]) {
        usersMap[user.id] = user.name;
      }
    }
    return true;
  } catch (error) {
    console.error("Error cargando mapa de usuarios:", error);
    return false;
  }
};

/**
 * Fetches a single user's name into the map. Fallback path when the batch load
 * is not allowed for the current role.
 * @param {object} usersMap - Reactive object (ref map) keyed by user id.
 * @param {string} userId - User id to fetch.
 */
export const fetchUserNameIntoMap = async (usersMap, userId) => {
  if (!userId || usersMap[userId] !== undefined) return;
  try {
    const response = await axios.get(`/api/users?id=${userId}`);
    if (response.data.data && response.data.data.name) {
      usersMap[userId] = response.data.data.name;
    }
  } catch (error) {
    console.error(`Error cargando nombre de usuario ${userId}:`, error);
    usersMap[userId] = userId;
  }
};

/**
 * Fetches all spaces once and fills an id -> space map, so views can resolve
 * space names locally instead of one request per row.
 * @param {object} spacesMap - Reactive object (ref map) keyed by space id.
 */
export const loadSpacesIntoMap = async (spacesMap) => {
  try {
    const response = await axios.get("/api/spaces");
    if (response.data.success && Array.isArray(response.data.data)) {
      for (const space of response.data.data) {
        if (space && space.id && !spacesMap[space.id]) {
          spacesMap[space.id] = space;
        }
      }
    }
  } catch (error) {
    console.error("Error cargando mapa de espacios:", error);
  }
};
