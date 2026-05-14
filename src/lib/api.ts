import { auth } from './firebase';

export async function callApi(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
