export function isAdminOpenAccessEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ADMIN_OPEN_ACCESS === '1';
}
