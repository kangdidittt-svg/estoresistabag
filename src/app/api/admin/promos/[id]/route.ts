import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { generateSlug } from '@/lib/utils';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// GET - Get single promo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const promo = await Promo.findById(id).lean();

    if (!promo) {
      return NextResponse.json(
        { success: false, error: 'Promo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promo
    });

  } catch (error) {
    console.error('Error fetching promo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo' },
      { status: 500 }
    );
  }
}

// PUT - Update promo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const value = parseFloat(formData.get('value') as string);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isActive = formData.get('isActive') === 'true';
    const minPurchase = parseFloat(formData.get('minPurchase') as string) || 0;
    const maxDiscount = parseFloat(formData.get('maxDiscount') as string) || 0;
    const usageLimit = parseInt(formData.get('usageLimit') as string) || 0;
    const existingImage = formData.get('existingImage') as string;
    const newImageFile = formData.get('image') as File;

    // Check if promo exists
    const existingPromo = await Promo.findById(id);
    if (!existingPromo) {
      return NextResponse.json(
        { success: false, error: 'Promo not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!title || !type || !value || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate promo type
    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo type' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Generate new slug if title changed
    let slug = existingPromo.slug;
    if (title !== existingPromo.title) {
      slug = generateSlug(title);
      
      // Check if new slug already exists (excluding current promo)
      const slugExists = await Promo.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Promo with this title already exists' },
          { status: 400 }
        );
      }
    }

    // Handle image upload
    let imageUrl = existingImage;
    
    if (newImageFile && newImageFile.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'promos');
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = newImageFile.name.replace(/\s+/g, '-');
        const filename = `${timestamp}-${originalName}`;
        const filepath = path.join(uploadsDir, filename);
        
        // Save file
        const bytes = await newImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filepath, buffer);
        
        // Delete old image if it exists and is not the default
        if (existingPromo.image && !existingPromo.image.includes('placeholder')) {
          try {
            const oldImagePath = path.join(process.cwd(), 'public', existingPromo.image);
            await unlink(oldImagePath);
          } catch (error) {
            console.log('Could not delete old image:', error);
          }
        }
        
        imageUrl = `/uploads/promos/${filename}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Update promo
    const updatedPromo = await Promo.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        description: description || '',
        type,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        image: imageUrl,
        isActive,
        minPurchase,
        maxDiscount,
        usageLimit,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedPromo,
      message: 'Promo updated successfully'
    });

  } catch (error) {
    console.error('Error updating promo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update promo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if promo exists
    const promo = await Promo.findById(id);
    if (!promo) {
      return NextResponse.json(
        { success: false, error: 'Promo not found' },
        { status: 404 }
      );
    }

    // Delete image file if it exists
    if (promo.image && !promo.image.includes('placeholder')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', promo.image);
        await unlink(imagePath);
      } catch (error) {
        console.log('Could not delete image file:', error);
      }
    }

    // Delete the promo
    await Promo.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Promo deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting promo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete promo' },
      { status: 500 }
    );
  }
}