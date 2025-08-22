import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { generateSlug } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';
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

    const contentType = request.headers.get('content-type');
    let title, description, type, value, startDate, endDate, isActive, minPurchase, maxDiscount, usageLimit, imageFile;

    if (contentType?.includes('application/json')) {
      // Handle JSON request
      const body = await request.json();
      title = body.title;
      description = body.description;
      type = body.type;
      value = parseFloat(body.value);
      startDate = body.startDate;
      endDate = body.endDate;
      isActive = body.isActive;
      minPurchase = parseFloat(body.minPurchase) || 0;
      maxDiscount = parseFloat(body.maxDiscount) || 0;
      usageLimit = parseInt(body.usageLimit) || 0;
      imageFile = null; // No image for JSON requests
    } else {
      // Handle FormData request
      const formData = await request.formData();
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      type = formData.get('type') as string;
      value = parseFloat(formData.get('value') as string);
      startDate = formData.get('startDate') as string;
      endDate = formData.get('endDate') as string;
      isActive = formData.get('isActive') === 'true';
      minPurchase = parseFloat(formData.get('minPurchase') as string) || 0;
      maxDiscount = parseFloat(formData.get('maxDiscount') as string) || 0;
      usageLimit = parseInt(formData.get('usageLimit') as string) || 0;
      imageFile = formData.get('image') as File;
    }

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
        // Convert file to buffer and upload to S3
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to S3
        imageUrl = await uploadToS3(buffer, 'promos');
        
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image to S3' },
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