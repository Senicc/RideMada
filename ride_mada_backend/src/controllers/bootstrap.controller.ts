import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';

/** Crée le premier admin (dev uniquement). POST body: { secret, phone, name, password } */
export const bootstrapAdmin = async (req: Request, res: Response) => {
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!expected || req.body.secret !== expected) {
    return res.status(403).json({ success: false, message: 'Secret invalide' });
  }

  const { phone, name, password } = req.body;
  if (!phone || !name || !password) {
    return res.status(400).json({ success: false, message: 'phone, name, password requis' });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    const user = await prisma.user.update({
      where: { phone },
      data: { role: 'ADMIN', isVerified: true, isBlocked: false },
    });
    return res.json({ success: true, message: 'Utilisateur promu admin', userId: user.id });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      phone,
      name,
      password: hashed,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  res.status(201).json({ success: true, message: 'Admin créé', userId: user.id });
};
