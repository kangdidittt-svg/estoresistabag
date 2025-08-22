import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSlug } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';

// GET - Get single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({ category: id });

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        productCount
      }
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const isActive = formData.get('isActive') === 'true';
    const existingImage = formData.get('existingImage') as string;
    const newImageFile = formData.get('image') as File | null;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Validate slug if provided, otherwise generate from name
    let finalSlug = slug;
    if (!finalSlug && name !== existingCategory.name) {
      finalSlug = generateSlug(name);
    } else if (!finalSlug) {
      finalSlug = existingCategory.slug;
    }
    
    // Check if slug already exists (excluding current category)
    if (finalSlug !== existingCategory.slug) {
      const slugExists = await Category.findOne({ slug: finalSlug, _id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Handle image upload
    let finalImage = existingImage || existingCategory.image || '';
    
    if (newImageFile && newImageFile.size > 0) {
      try {
        // Convert file to buffer and upload to S3
        const buffer = Buffer.from(await newImageFile.arrayBuffer());
        
        // Upload to S3
        finalImage = await uploadToS3(buffer, 'categories');
        
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image to S3' },
          { status: 500 }
        );
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug: finalSlug,
        description: description || '',
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        isActive,
        image: finalImage
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. It has ${productCount} product(s) associated with it.` 
        },
        { status: 400 }
      );
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}