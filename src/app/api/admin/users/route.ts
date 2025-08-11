import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

// GET - Fetch all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const tokenResult = await verifyAdminToken(request);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const admins = await Admin.find({})
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const tokenResult = await verifyAdminToken(request);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { username, password, email } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmailAdmin = await Admin.findOne({ email });
      if (existingEmailAdmin) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      email: email || undefined,
      isActive: true
    });

    await newAdmin.save();

    // Return admin data without password
    const adminData = newAdmin.toObject();
    delete adminData.password;

    return NextResponse.json({
      success: true,
      data: adminData,
      message: 'Admin user created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}