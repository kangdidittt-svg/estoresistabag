import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Legacy support
    const activeOnly = searchParams.get('activeOnly');
    const withProducts = searchParams.get('withProducts') === 'true';
    
    // New pagination and filtering support
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeProducts = searchParams.get('includeProducts') === 'true';
    
    // Sorting
    const sort = searchParams.get('sort') || 'startDate';
    const order = searchParams.get('order') || 'desc';

    // Build query
    const query: any = {};
    
    // Legacy activeOnly support
    if (activeOnly !== null) {
      if (activeOnly !== 'false') {
        const now = new Date();
        query.isActive = true;
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
      }
    } else {
      // New filtering logic
      if (type && type !== 'all') {
        query.type = type;
      }
      
      if (status && status !== 'all') {
        const now = new Date();
        if (status === 'active') {
          query.$and = [
            { startDate: { $lte: now } },
            { endDate: { $gte: now } },
            { isActive: true }
          ];
        } else if (status === 'expired') {
          query.$or = [
            { endDate: { $lt: now } },
            { isActive: false }
          ];
        }
      }
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // If pagination is requested, use new logic
    if (searchParams.has('page') || searchParams.has('limit')) {
      // Get total count
      const totalPromos = await Promo.countDocuments(query);
      
      // Get promos
      let promosQuery = Promo.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean();
      
      const promos = await promosQuery;
      
      // Include products if requested
      if (includeProducts) {
        for (let promo of promos) {
          if (promo.applicableProducts && promo.applicableProducts.length > 0) {
            const products = await Product.find({
              _id: { $in: promo.applicableProducts }
            })
            .select('name slug images price priceAfterDiscount')
            .limit(6)
            .lean();
            
            promo.products = products;
          }
        }
      }
      
      // Calculate pagination
      const totalPages = Math.ceil(totalPromos / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;
      
      return NextResponse.json({
        success: true,
        data: {
          promos,
          pagination: {
            currentPage: page,
            totalPages,
            totalPromos,
            hasNext,
            hasPrev
          }
        }
      });
    }
    
    // Legacy logic for backward compatibility
    let promosQuery = Promo.find(query).sort({ createdAt: -1 });

    if (withProducts) {
      promosQuery = promosQuery.populate({
        path: 'products',
        match: { isPublished: true },
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });
    }

    const promos = await promosQuery.lean();

    // If not populating products, get products separately for each promo
    if (!withProducts) {
      const promosWithProductCount = await Promise.all(
        promos.map(async (promo) => {
          const productCount = await Product.countDocuments({
            promo: promo._id,
            isPublished: true
          });
          return {
            ...promo,
            productCount
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: promosWithProductCount
      });
    }

    return NextResponse.json({
      success: true,
      data: promos
    });

  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promos' },
      { status: 500 }
    );
  }
}