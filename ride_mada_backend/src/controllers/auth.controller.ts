import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { generateOTP, verifyOtpCode } from '../utils/otp';
import { sendOTPSMS } from '../services/sms.service';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

function signAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES,
  });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_EXPIRES,
  });
}

function formatUser(user: {
  id: string;
  name: string;
  phone: string;
  role: string;
  photo: string | null;
  rating: number;
  isVerified: boolean;
  email?: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email ?? null,
    role: user.role,
    photo: user.photo,
    rating: user.rating,
    isVerified: user.isVerified,
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { phone, name, password, email } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    console.log(`[DEV] Code OTP généré pour ${phone} : ${otp}`);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        email: email || null,
        password: hashedPassword,
        role: 'PASSENGER',
        otpCode: otp,
        otpExpires,
      },
    });

    await sendOTPSMS(phone, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez le code OTP envoyé par SMS.',
      userId: user.id,
      ...(isDev ? { tempOTP: otp } : {}),
    });
  } catch (error: any) {
    console.error('[REGISTER ERROR]', error);
    // Gestion propre des erreurs sans exposer Prisma
    const message = error.code === 'P2002' ? 'Ce numéro est déjà utilisé' : 'Erreur lors de l\'inscription';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { driver: true },
    });

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Numéro ou mot de passe incorrect' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Compte suspendu. Contactez le support.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Compte non vérifié. Saisissez le code OTP.',
        requiresVerification: true,
        userId: user.id,
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error: any) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token requis' });
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_REFRESH_SECRET non configuré' });
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Compte suspendu' });
    }

    res.json({
      success: true,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user.id),
    });
  } catch (error: any) {
    console.error('[REFRESH TOKEN ERROR]', error);
    res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (
      !verifyOtpCode(user.otpCode, otp) ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpires: null },
    });

    const accessToken = signAccessToken(updated);
    const refreshToken = signRefreshToken(updated.id);

    res.json({
      success: true,
      message: 'Compte vérifié',
      accessToken,
      refreshToken,
      user: formatUser(updated),
    });
  } catch (error: any) {
    console.error('[VERIFY OTP ERROR]', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.json({
        success: true,
        message: 'Si ce numéro existe, un code de réinitialisation a été envoyé.',
      });
    }

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await sendOTPSMS(phone, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'Code de réinitialisation envoyé par SMS.',
      ...(isDev ? { tempOTP: otp } : {}),
    });
  } catch (error: any) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du code' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (
      !user ||
      !verifyOtpCode(user.otpCode, otp) ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
        isVerified: true,
      },
    });

    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (error: any) {
    console.error('[RESET PASSWORD ERROR]', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
};
