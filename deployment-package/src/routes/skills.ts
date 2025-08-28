import { Router } from 'express';
import { SkillsService, UserSkillsService } from '../lib/services';

const router = Router();
const skillsService = new SkillsService();
const userSkillsService = new UserSkillsService();

// Skill CRUD
router.get('/skills', async (_req, res) => {
  const skills = await skillsService.getAll();
  res.json(skills);
});

router.post('/skills', async (req, res) => {
  const skill = await skillsService.create(req.body);
  res.status(201).json(skill);
});

router.get('/skills/:id', async (req, res) => {
  const skill = await skillsService.getById(req.params.id);
  if (skill) res.json(skill);
  else res.sendStatus(404);
});

router.put('/skills/:id', async (req, res) => {
  const skill = await skillsService.update(req.params.id, req.body);
  if (skill) res.json(skill);
  else res.sendStatus(404);
});

router.delete('/skills/:id', async (req, res) => {
  const success = await skillsService.delete(req.params.id);
  res.sendStatus(success ? 204 : 404);
});

// User skill CRUD
router.get('/user-skills', async (_req, res) => {
  const userSkills = await userSkillsService.getAll();
  res.json(userSkills);
});

router.post('/user-skills', async (req, res) => {
  const userSkill = await userSkillsService.create(req.body);
  res.status(201).json(userSkill);
});

router.get('/user-skills/:id', async (req, res) => {
  const userSkill = await userSkillsService.getById(req.params.id);
  if (userSkill) res.json(userSkill);
  else res.sendStatus(404);
});

router.put('/user-skills/:id', async (req, res) => {
  const userSkill = await userSkillsService.update(req.params.id, req.body);
  if (userSkill) res.json(userSkill);
  else res.sendStatus(404);
});

router.delete('/user-skills/:id', async (req, res) => {
  const success = await userSkillsService.delete(req.params.id);
  res.sendStatus(success ? 204 : 404);
});

// Verification
router.post('/user-skills/:id/verify', async (req, res) => {
  const { approve, verifierId } = req.body;
  const userSkill = await userSkillsService.verify(req.params.id, verifierId, approve);
  if (userSkill) res.json(userSkill);
  else res.sendStatus(404);
});

export default router;
