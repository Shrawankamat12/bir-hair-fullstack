const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const isConfigured = Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);

if (!isConfigured) {
  logger.warn('SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD not set — shipment creation from admin will be unavailable.');
}

let cachedToken = null;
let tokenExpiresAt = 0;

class ShippingService {
  get isConfigured() {
    return isConfigured;
  }

  async _getToken() {
    if (!isConfigured) throw new AppError('Shiprocket is not configured yet.', 503);
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new AppError('Could not authenticate with Shiprocket', 502);

    cachedToken = data.token;
    tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // Shiprocket tokens last ~10 days
    return cachedToken;
  }

  async _request(path, options = {}) {
    const token = await this._getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new AppError(data.message || 'Shiprocket request failed', 502);
    return data;
  }

  /**
   * Creates an adhoc order in Shiprocket from a B.I.R Order document and
   * returns the shipment id. Pickup location name must already exist in the
   * Shiprocket dashboard (Settings → Pickup Addresses) — pass it via
   * SHIPROCKET_PICKUP_LOCATION.
   */
  async createShipment(order) {
    const payload = {
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt).toISOString().slice(0, 10),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: order.shippingAddress.fullName,
      billing_address: order.shippingAddress.line1,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || 'India',
      billing_email: order.shippingAddress.email || 'orders@birhairindia.com',
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map((i) => ({
        name: i.name,
        sku: i.product?.toString?.() || 'SKU',
        units: i.qty,
        selling_price: i.price,
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,
      length: 15, breadth: 12, height: 8, weight: 0.5, // sensible default parcel dims for hair bundles
    };

    const data = await this._request('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(payload) });
    return { shipmentId: data.shipment_id, shiprocketOrderId: data.order_id };
  }

  async assignAwb(shipmentId) {
    const data = await this._request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: shipmentId }),
    });
    return { awbCode: data.response?.data?.awb_code, courierName: data.response?.data?.courier_name };
  }

  async track(awbCode) {
    return this._request(`/courier/track/awb/${awbCode}`);
  }
}

module.exports = new ShippingService();
