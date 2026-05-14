import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { generateOTP } from '../utils/otp';
import { sendOTPSMS } from '../services/sms.service'; // À implémenter avec MVola/Orange

export const register = async (req: Request, res: Response) => {
  try {
    const { phone, name, password, email, role = 'PASSENGER' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) return res.status(409).json({ message: "Ce numéro est déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        email,
        password: hashedPassword,
        role,
      }
    });

    // Envoi OTP (simulation en dev)
    await sendOTPSMS(phone, otp);

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      userId: user.id,
      tempOTP: otp // Retirer en production
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { driver: true }
    });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Numéro ou mot de passe incorrect" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
        rating: user.rating,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // Implémentation refresh token
};

export const verifyOTP = async (req: Request, res: Response) => { /* ... */ };
export const forgotPassword = async (req: Request, res: Response) => { /* ... */ };

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Déconnexion (côté client : supprimer les tokens)' });
};