import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { generateSlug } from '@/lib/utils';
import { writeFile } from 'fs/promises';
import path from 'path';

// GET - List all promos for admin
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, inactive, expired, all

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const currentDate = new Date();

    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: currentDate };
      query.endDate = { $gte: currentDate };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.endDate = { $lt: currentDate };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [promos, totalPromos] = await Promise.all([
      Promo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Promo.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalPromos / limit);

    return NextResponse.json({
      success: true,
      data: promos,
      pagination: {
        currentPage: page,
        totalPages,
        totalPromos,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin promos:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new promo
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

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
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!title || !type || !value || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate promo type
    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo type' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { success: false, message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check if promo with same slug already exists
    const existingPromo = await Promo.findOne({ slug });
    if (existingPromo) {
      return NextResponse.json(
        { success: false, message: 'Promo with this title already exists' },
        { status: 400 }
      );
    }

    // Handle image upload
    let imageUrl = '';
    
    if (imageFile && imageFile.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'promos');
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = imageFile.name.replace(/\s+/g, '-');
        const filename = `${timestamp}-${originalName}`;
        const filepath = path.join(uploadsDir, filename);
        
        // Save file
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filepath, buffer);
        
        imageUrl = `/uploads/promos/${filename}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Create new promo
    const promo = new Promo({
      title,
      slug,
      description: description || '',
      type,
      value,
      startDate: start,
      endDate: end,
      image: imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      minPurchase,
      maxDiscount,
      usageLimit
    });

    await promo.save();

    return NextResponse.json({
      success: true,
      data: promo,
      message: 'Promo created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating promo:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}