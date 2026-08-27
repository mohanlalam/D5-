/**
 * Input & Payload Validation Schemas
 * D5 IPL Fantasy Platform
 */

/**
 * Validates a fantasy team entry
 * @param {Object} team
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTeam(team) {
  const errors = [];
  if (!team || typeof team !== "object") {
    return { valid: false, errors: ["Invalid team payload"] };
  }
  if (!team.id || typeof team.id !== "string" || !team.id.trim()) {
    errors.push("Team ID is required");
  }
  if (!team.name || typeof team.name !== "string" || !team.name.trim()) {
    errors.push("Team name is required");
  }
  if (!team.color || !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(team.color)) {
    errors.push("Valid hex color code is required (e.g. #00C9FF)");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a match performance entry
 * @param {Object} entry
 * @param {Array} validTeams
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMatchEntry(entry, validTeams = []) {
  const errors = [];
  if (!entry || typeof entry !== "object") {
    return { valid: false, errors: ["Entry payload is missing"] };
  }
  if (!entry.id || typeof entry.id !== "string") {
    errors.push("Valid entry ID is required");
  }
  if (!entry.date || isNaN(Date.parse(entry.date))) {
    errors.push("Valid match date (YYYY-MM-DD) is required");
  }
  if (!entry.teamData || typeof entry.teamData !== "object") {
    errors.push("Team scorecard data is required");
    return { valid: false, errors };
  }

  // Validate roster for each team
  validTeams.forEach((t) => {
    const roster = entry.teamData[t.id];
    if (!Array.isArray(roster) || roster.length === 0) {
      errors.push(`Team ${t.name} is missing roster data`);
    } else {
      const captainCount = roster.filter((p) => Boolean(p.isCaptain)).length;
      if (captainCount > 1) {
        errors.push(`Team ${t.name} has more than one captain designated`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
