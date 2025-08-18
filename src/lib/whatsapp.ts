// WhatsApp utility functions

// Get WhatsApp number from app config
export async function getWhatsAppNumber(): Promise<string> {
  try {
    const response = await fetch('/api/admin/config');
    const data = await response.json();
    
    if (data.success && data.data?.whatsappNumber) {
      return data.data.whatsappNumber;
    }
    
    // Fallback to default number if config not found
    return '6281234567890';
  } catch (error) {
    console.error('Error fetching WhatsApp number:', error);
    // Fallback to default number on error
    return '6281234567890';
  }
}

// Format WhatsApp message template
export function formatWhatsAppMessage(
  productName: string,
  productPrice: number,
  productSlug: string,
  quantity: number = 1
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const productUrl = `${baseUrl}/products/${productSlug}`;
  
  return `Halo, saya tertarik dengan produk:

*${productName}*
Harga: Rp ${productPrice.toLocaleString('id-ID')}
Jumlah: ${quantity}

Link produk: ${productUrl}

Bisakah saya mendapatkan informasi lebih lanjut?`;
}

// Format cart message for WhatsApp
export function formatCartMessage(cartItems: any[]): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let message = 'Halo, saya ingin memesan:\n\n';
  
  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = item.priceAfterDiscount || item.price;
    const subtotal = itemTotal * item.quantity;
    total += subtotal;
    
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Harga: Rp ${itemTotal.toLocaleString('id-ID')}\n`;
    message += `   Jumlah: ${item.quantity}\n`;
    message += `   Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
  });
  
  message += `*Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
  message += 'Mohon konfirmasi ketersediaan dan total pembayaran. Terima kasih!';
  
  return message;
}

// Get WhatsApp URL with dynamic phone number
export async function getWhatsAppUrl(message: string): Promise<string> {
  const phoneNumber = await getWhatsAppNumber();
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// Get WhatsApp URL with custom phone number (for backward compatibility)
export function getWhatsAppUrlWithNumber(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}