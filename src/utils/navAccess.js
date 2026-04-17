/**
 * @param {import('@/data/menuLinks.json')} link
 * @param {string} effectiveRole admin | employee | candidate
 */
export function canAccessNavLink(link, effectiveRole) {
  const roles = link.allowedRoles || ["admin", "employee", "candidate"];
  return roles.includes(effectiveRole);
}
