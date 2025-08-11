import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AdminTokenPayload {
  adminId: string;
  username: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export async function verifyAdminToken(request: NextRequest): Promise<{
  valid: boolean;
  payload?: AdminTokenPayload;
  message?: string;
}> {
  try {
    // Get token from cookies
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return {
        valid: false,
        message: 'No admin token provided'
      };
    }

    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & Partial<AdminTokenPayload>;
    
    if (!payload.isAdmin) {
      return {
        valid: false,
        message: 'Invalid admin token'
      };
    }

    // Handle backward compatibility for old tokens without adminId
    if (!payload.adminId) {
      // For old tokens, get the first admin as fallback
      await dbConnect();
      const admin = await Admin.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (admin) {
        payload.adminId = admin._id.toString();
        payload.username = admin.username;
      }
    }

    return {
      valid: true,
      payload: payload as AdminTokenPayload
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      valid: false,
      message: 'Invalid or expired token'
    };
  }
}

export async function generateAdminToken(admin: { _id: string; username: string }): Promise<string> {
  const payload: Omit<AdminTokenPayload, 'iat' | 'exp'> = {
    adminId: admin._id.toString(),
    username: admin.username,
    isAdmin: true
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  });
}

// Verify admin credentials with username and password
export async function verifyAdminCredentials(username: string, password: string): Promise<{ success: boolean; admin?: { _id: string; username: string; password: string; isActive: boolean } }> {
  try {
    await dbConnect();
    
    // Find admin by username
    const admin = await Admin.findOne({ username, isActive: true });
    
    if (!admin) {
      return { success: false };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return { success: false };
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    return { success: true, admin };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false };
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    await dbConnect();
    
    const adminConfig = await AdminConfig.findOne();
    if (!adminConfig) {
      return false;
    }
    
    return await bcrypt.compare(password, adminConfig.adminSecretHash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}