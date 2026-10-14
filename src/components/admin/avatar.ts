const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #8B7CF6, #6366F1)',
  'linear-gradient(135deg, #FF8A65, #F25F5C)',
  'linear-gradient(135deg, #FFB547, #FF8A3D)',
  'linear-gradient(135deg, #34D399, #10B981)',
  'linear-gradient(135deg, #60A5FA, #2F6BFF)',
  'linear-gradient(135deg, #F472B6, #DB2777)',
];

export function avatarGradient(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
