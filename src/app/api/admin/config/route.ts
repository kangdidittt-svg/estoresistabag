import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppConfig from '@/models/AppConfig';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil konfigurasi aplikasi
export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Cari atau buat konfigurasi default
    let config = await AppConfig.findOne();
    if (!config) {
      config = await AppConfig.create({
        whatsappNumber: '6281234567890'
      });
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching app config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update konfigurasi aplikasi
export async function PUT(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { whatsappNumber, whatsappTemplate } = body;

    // Validasi nomor WhatsApp
    if (!whatsappNumber) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi format nomor (harus dimulai dengan 62 dan berisi angka)
    const phoneRegex = /^62\d{8,13}$/;
    if (!phoneRegex.test(whatsappNumber)) {
      return NextResponse.json(
        { success: false, error: 'Format nomor WhatsApp tidak valid. Gunakan format: 62xxxxxxxxx' },
        { status: 400 }
      );
    }

    // Validasi template WhatsApp
    if (whatsappTemplate !== undefined && (!whatsappTemplate || whatsappTemplate.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Template pesan WhatsApp tidak boleh kosong' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update atau buat konfigurasi
    let config = await AppConfig.findOne();
    if (config) {
      config.whatsappNumber = whatsappNumber;
      if (whatsappTemplate !== undefined) {
        config.whatsappTemplate = whatsappTemplate;
      }
      await config.save();
    } else {
      const configData: any = { whatsappNumber };
      if (whatsappTemplate !== undefined) {
        configData.whatsappTemplate = whatsappTemplate;
      }
      config = await AppConfig.create(configData);
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Konfigurasi berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating app config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}