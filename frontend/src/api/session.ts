import type { UserDto } from './modules/auth';

// There is no GET /api/me/profile yet (that's Fase 5's /me preferences) —
// the only source of the current user is the payload login/register
// already return, so it's cached here instead of re-fetched.
const USER_KEY = 'kanban.user';

let currentUser: UserDto | null = readUser();

function readUser(): UserDto | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  } catch {
    return null;
  }
}

function writeUser(user: UserDto | null) {
  try {
    if (user === null) localStorage.removeItem(USER_KEY);
    else localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // In-memory copy still works for the lifetime of the tab.
  }
}

export function getCurrentUser(): UserDto | null {
  return currentUser;
}

export function setCurrentUser(user: UserDto) {
  currentUser = user;
  writeUser(user);
}

export function clearCurrentUser() {
  currentUser = null;
  writeUser(null);
}
