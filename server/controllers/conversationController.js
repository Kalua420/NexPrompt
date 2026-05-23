import { prisma } from '../src/index.js';

export async function getConversations(req, res) {
  const conversations = await prisma.conversation.findMany({
    where: { userId: req.user.userId },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      prompts: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        include: { generations: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
  });
  const result = conversations.map((c) => ({
    ...c,
    lastPrompt: c.prompts[0] || null,
    prompts: undefined,
  }));
  res.json(result);
}

export async function getConversation(req, res) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, userId: req.user.userId },
    include: {
      prompts: {
        orderBy: { createdAt: 'asc' },
        include: { generations: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  const title = conversation.title !== 'New Conversation' ? conversation.title
    : conversation.prompts[0]?.content.slice(0, 80) || 'New Conversation';
  res.json({ ...conversation, title });
}

export async function createConversation(req, res) {
  const { title } = req.body;
  const conversation = await prisma.conversation.create({
    data: { title: title || 'New Conversation', userId: req.user.userId },
  });
  res.status(201).json(conversation);
}

export async function deleteConversation(req, res) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, userId: req.user.userId },
  });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  await prisma.conversation.delete({ where: { id: conversation.id } });
  res.json({ success: true });
}

export async function updateConversation(req, res) {
  const { title } = req.body;
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, userId: req.user.userId },
  });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  const updated = await prisma.conversation.update({
    where: { id: req.params.id },
    data: { title },
  });
  res.json(updated);
}
