import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin, { IAdmin } from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/auth';

// GET - Ambil daftar admin
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminAuth(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can manage other admins
    if (adminData.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get admins without password field
    const admins = await Admin.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Admin.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        admins,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST - Tambah admin baru
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminAuth(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can create new admins
    if (adminData.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, email, role } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3-50 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (role && !['super_admin', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: role || 'admin',
      isActive: true
    });

    await newAdmin.save();

    // Return admin data without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: adminResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}