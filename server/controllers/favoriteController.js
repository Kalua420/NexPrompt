import { prisma } from '../src/index.js';

export async function getFavorites(req, res) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.userId },
    include: { prompt: true },
    orderBy: { id: 'desc' },
  });
  res.json(favorites.map(f => f.prompt));
}

export async function addFavorite(req, res) {
  try {
    const { promptId } = req.params;
    const userId = req.user.userId;
    
    // Verify prompt exists and user has access to it
    const prompt = await prisma.prompt.findFirst({
      where: { 
        id: promptId,
        userId // Only allow favoriting own prompts
      },
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found or access denied' });
    }
    
    const fav = await prisma.favorite.upsert({
      where: { userId_promptId: { userId, promptId } },
      update: {},
      create: { userId, promptId },
    });
    res.status(201).json(fav);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}

export async function removeFavorite(req, res) {
  const fav = await prisma.favorite.findFirst({ where: { userId: req.user.userId, promptId: req.params.promptId } });
  if (!fav) return res.status(404).json({ error: 'Favorite not found' });
  await prisma.favorite.delete({ where: { id: fav.id } });
  res.json({ success: true });
}
