import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// DELETE - Delete admin user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Check if this is the last active admin
    const activeAdminCount = await Admin.countDocuments({ isActive: true });
    if (activeAdminCount <= 1 && admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last active admin' },
        { status: 400 }
      );
    }

    // Delete the admin
    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update admin user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { isActive, email } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // If deactivating, check if this is the last active admin
    if (isActive === false && admin.isActive) {
      const activeAdminCount = await Admin.countDocuments({ isActive: true });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot deactivate the last active admin' },
          { status: 400 }
        );
      }
    }

    // Update admin
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (email !== undefined) updateData.email = email;
    updateData.updatedAt = new Date();

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: 'Admin user updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}