export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  id: string;
  staffId: string;
  skillId: string;
  verified: boolean;
  pointsAwarded: boolean;
}

export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch('/api/skills');
  return res.json();
}

export async function addSkill(name: string): Promise<Skill> {
  const res = await fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function addUserSkill(staffId: string, skillId: string): Promise<UserSkill> {
  const res = await fetch('/api/user-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, skillId })
  });
  return res.json();
}

export async function verifyUserSkill(id: string): Promise<UserSkill> {
  const res = await fetch(`/api/user-skills/${id}/verify`, { method: 'POST' });
  return res.json();
}
