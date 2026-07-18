// Moves picked photos / recorded voice into the app's documents so
// memories survive cache cleanups. Falls back to the original uri.

import { File, Paths } from 'expo-file-system';

export function persistMedia(uri, ext) {
  if (!uri) return null;
  try {
    const src = new File(uri);
    const dest = new File(Paths.document, `memory-${Date.now()}.${ext}`);
    src.copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}
