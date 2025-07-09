import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserAttributes } from '../types/user';

// Configuration JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Configuration Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '1066618886719-bvibu0drgviaemgmbt3m9bsr9aoq3ac2.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({
      where: { email: profile.emails?.[0]?.value }
    });

    if (user) {
      // Utilisateur existe, on le connecte
      return done(null, user);
    } else {
      // Créer un nouvel utilisateur
      user = await User.create({
        username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
        email: profile.emails?.[0]?.value || '',
        password: 'oauth-google', // Mot de passe dummy pour OAuth
        googleId: profile.id
      });
      return done(null, user);
    }
  } catch (error) {
    return done(error, false);
  }
}));

// Fonction utilitaire pour générer un JWT - VERSION SIMPLIFIÉE
export const generateJWT = (user: UserAttributes) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('JWT generation error:', error);
    throw error;
  }
};

export default passport;