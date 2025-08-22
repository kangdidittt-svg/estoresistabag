import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Ambil detail admin berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verify admin token
    const adminData = await verifyAdminAuth(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can view other admins, or admin can view their own data
    if (adminData.role !== 'super_admin' && adminData.id !== id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(id, '-password');
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin' },
      { status: 500 }
    );
  }
}

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verify admin token
    const adminData = await verifyAdminAuth(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Permission checks
    const isSuperAdmin = adminData.role === 'super_admin';
    const isOwnProfile = adminData.id === id;

    if (!isSuperAdmin && !isOwnProfile) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, email, role, isActive } = body;

    // Validation
    if (username && (username.length < 3 || username.length > 50)) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3-50 characters' },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
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

    // Only super_admin can change role and isActive status
    if (!isSuperAdmin && (role !== undefined || isActive !== undefined)) {
      return NextResponse.json(
        { success: false, error: 'Only super admin can change role or status' },
        { status: 403 }
      );
    }

    // Check if username already exists (excluding current admin)
    if (username && username !== targetAdmin.username) {
      const existingAdmin = await Admin.findOne({ 
        username, 
        _id: { $ne: id } 
      });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, error: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email !== undefined) updateData.email = email || undefined;
    if (isSuperAdmin && role) updateData.role = role;
    if (isSuperAdmin && isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verify admin token
    const adminData = await verifyAdminAuth(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can delete admins
    if (adminData.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (adminData.id === id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Check if this is the last super_admin
    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last super admin' },
          { status: 400 }
        );
      }
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}