import { prisma } from '../src/index.js';

const PLAN_ORDER = { free: 0, pro: 1, enterprise: 2 };

export async function getTemplates(req, res) {
  const { category, search, featured, plan } = req.query;
  const where = {};
  if (category) where.category = category;
  if (featured) where.featured = true;
  if (search) where.title = { contains: search };
  if (plan) where.plan = plan;

  let templates = await prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } });

  const userPlan = req.user?.userId
    ? await prisma.subscription.findUnique({ where: { userId: req.user.userId }, select: { plan: true, status: true } })
    : null;
  const maxAccess = userPlan?.status === 'active' ? PLAN_ORDER[userPlan.plan] : 0;

  templates = templates.map((t) => ({
    ...t,
    canUse: PLAN_ORDER[t.plan] <= maxAccess,
  }));

  res.json(templates);
}

export async function createTemplate(req, res) {
  const { title, description, category, content, featured, plan } = req.body;
  if (!title || !description || !category || !content) return res.status(400).json({ error: 'All fields required' });
  if (title.length > 500) return res.status(400).json({ error: 'Title must be under 500 characters' });
  if (description.length > 2000) return res.status(400).json({ error: 'Description must be under 2000 characters' });
  if (content.length > 50000) return res.status(400).json({ error: 'Content must be under 50000 characters' });
  const template = await prisma.template.create({
    data: { title, description, category, content, featured: featured || false, plan: plan || 'free' },
  });
  res.status(201).json(template);
}
