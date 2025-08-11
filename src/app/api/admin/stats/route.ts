import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Promo from '@/models/Promo';
import Lead from '@/models/Lead';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get basic counts
    const [totalProducts, totalCategories, totalPromos, totalLeads] = await Promise.all([
      Product.countDocuments({}),
      Category.countDocuments({}),
      Promo.countDocuments({}),
      Lead.countDocuments({})
    ]);

    // Get published vs unpublished products
    const [publishedProducts, unpublishedProducts] = await Promise.all([
      Product.countDocuments({ isPublished: true }),
      Product.countDocuments({ isPublished: false })
    ]);

    // Get active promos
    const now = new Date();
    const activePromos = await Promo.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Get most viewed products
    const mostViewedProducts = await Product.find({ isPublished: true })
      .populate('category', 'name')
      .sort({ views: -1 })
      .limit(10)
      .select('name views category images')
      .lean();

    // Get products with low stock (less than 5)
    const lowStockProducts = await Product.find({ 
      stock: { $lt: 5 },
      isPublished: true 
    })
      .populate('category', 'name')
      .select('name stock category')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // Get recent leads
    const recentLeads = await Lead.find({
      createdAt: { $gte: startDate }
    })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get leads by day for the chart
    const leadsAggregation = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get views by day
    const viewsAggregation = await Product.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt"
            }
          },
          totalViews: { $sum: "$views" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get category distribution
    const categoryStats = await Product.aggregate([
      {
        $match: { isPublished: true }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $project: {
          name: "$category.name",
          count: 1,
          totalViews: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate total views
    const totalViewsResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" }
        }
      }
    ]);
    const totalViews = totalViewsResult[0]?.totalViews || 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          publishedProducts,
          unpublishedProducts,
          totalCategories,
          totalPromos,
          activePromos,
          totalLeads,
          totalViews
        },
        mostViewedProducts,
        lowStockProducts,
        recentLeads,
        charts: {
          leadsByDay: leadsAggregation,
          viewsByDay: viewsAggregation
        },
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}