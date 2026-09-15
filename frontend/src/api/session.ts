import { clearBoardCache } from './boardCache';
import type { UserDto } from './modules/auth';

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
  if (currentUser) clearBoardCache(currentUser.id);
  currentUser = null;
  writeUser(null);
}
