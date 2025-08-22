import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, verifyAdminPassword, generateAdminToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    let admin = null;

    // Check if both username and password are provided
    if (username && password) {
      // New login system with username/password from database
      const result = await verifyAdminCredentials(username, password);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        );
      }
      admin = result.admin;
    } else if (password && !username) {
      // Legacy login system (password only)
      const isValidPassword = await verifyAdminPassword(password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }
      // For legacy system, get the first admin
      const dbConnect = require('@/lib/mongodb').default;
      const Admin = require('@/models/Admin').default;
      await dbConnect();
      admin = await Admin.findOne({ isActive: true }).sort({ createdAt: 1 });
      
      // Set default role if not exists
      if (admin && !admin.role) {
        admin.role = 'super_admin';
        await admin.save();
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Generate JWT token
    const token = await generateAdminToken(admin);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate token' },
        { status: 500 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        token,
        message: 'Login successful'
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear the admin token cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}