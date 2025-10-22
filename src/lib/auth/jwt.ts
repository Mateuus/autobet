import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function verifyJWTToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verificar se temos JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não configurado');
      return null;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Verificar se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.error('Token expirado');
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error('Erro ao verificar JWT:', error);
    return null;
  }
}
