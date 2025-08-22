import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug } from '@/lib/utils';
import { uploadToS3 } from '@/lib/s3';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// GET - Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('promo', 'title type value')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
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
    const price = parseFloat(formData.get('price') as string);
    const comparePrice = parseFloat(formData.get('comparePrice') as string) || 0;
    const category = formData.get('category') as string;
    const promo = formData.get('promo') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const sku = formData.get('sku') as string;
    const weight = parseFloat(formData.get('weight') as string) || 0;
    const dimensions = JSON.parse(formData.get('dimensions') as string || '{}');
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const isPublished = formData.get('isPublished') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const existingImages = JSON.parse(formData.get('existingImages') as string || '[]');
    const newImageFiles = formData.getAll('newImages') as File[];

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if we have at least one image (existing or new)
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    if (category !== existingProduct.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    // Use provided slug or generate new one if name changed
    let finalSlug = slug || existingProduct.slug;
    if (name !== existingProduct.name && !slug) {
      finalSlug = generateSlug(name);
    }
    
    // Check if new slug already exists (excluding current product)
    if (finalSlug !== existingProduct.slug) {
      const slugExists = await Product.findOne({ slug: finalSlug, _id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Handle image uploads - convert existing images to new format if needed
    const finalImages = existingImages.map((img: any) => {
      if (typeof img === 'string') {
        // Convert old format (string) to new format (object)
        return {
          url: img,
          alt: name || 'Product Image',
          isPrimary: existingImages.indexOf(img) === 0
        };
      }
      // Already in new format
      return img;
    });
    
    if (newImageFiles.length > 0) {
      try {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          if (file.size > 0) {
            // Convert file to buffer and upload to S3
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Upload to S3
            const s3Url = await uploadToS3(buffer, 'products');
            
            // Get alt text from form data or use default
            const altText = formData.get(`newImageAlt_${i}`) as string || `${name} - Gambar ${finalImages.length + 1}`;
            
            // Add to images array
            finalImages.push({
              url: s3Url,
              alt: altText,
              isPrimary: finalImages.length === 0
            });
          }
        }
      } catch (error) {
        console.error('Error uploading images to S3:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload images to S3' },
          { status: 500 }
        );
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug: finalSlug,
        description,
        price,
        comparePrice,
        images: finalImages,
        category,
        tags,
        stock,
        sku,
        weight,
        dimensions,
        isPublished,
        isFeatured,
        metaTitle,
        metaDescription,
        promo: promo || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('promo', 'title type value');

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}