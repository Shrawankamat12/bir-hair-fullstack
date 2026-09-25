const BaseService = require('./base.service');
const { wholesaleRepository } = require('../repositories');
const emailService = require('./email.service');

class WholesaleService extends BaseService {
  constructor() {
    super(wholesaleRepository, 'Wholesale inquiry');
  }

  /** Admin sends companyName/quantity — map onto the schema's businessName/estimatedMOQ. */
  normalize(payload) {
    const body = { ...payload };
    if (body.companyName) { body.businessName = body.companyName; delete body.companyName; }
    if (body.quantity !== undefined) { body.estimatedMOQ = body.quantity; delete body.quantity; }
    if (body.status === 'declined') body.status = 'closed'; // admin's simplified vocabulary
    if (body.enquiryType && !['wholesale', 'export'].includes(body.enquiryType)) delete body.enquiryType;
    return body;
  }

  decorate(doc) {
    const w = doc.toObject ? doc.toObject() : doc;
    return { ...w, companyName: w.businessName, quantity: w.estimatedMOQ, status: w.status === 'closed' ? 'declined' : w.status };
  }

  async create(payload) {
    const inquiry = await this.repository.create(this.normalize(payload));

    const isExport = inquiry.enquiryType === 'export';
    const submittedAt = new Date(inquiry.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Notify the business inbox — never blocks/fails the submission itself;
    // the inquiry is already saved and visible in the admin panel either way.
    emailService.sendBusinessNotification({
      subject: `New ${isExport ? 'Export' : 'Wholesale'} Enquiry — ${inquiry.businessName}`,
      replyTo: inquiry.email,
      html: `
        <h2>New ${isExport ? 'Export' : 'Wholesale'} Enquiry</h2>
        <p><strong>Enquiry Type:</strong> ${isExport ? 'Export' : 'Wholesale'}</p>
        <p><strong>Company:</strong> ${escapeHtml(inquiry.businessName)}</p>
        <p><strong>Contact Person:</strong> ${escapeHtml(inquiry.contactName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone)}</p>
        <p><strong>${isExport ? 'Destination Country' : 'City/Country'}:</strong> ${escapeHtml(inquiry.country || '—')}</p>
        <p><strong>${isExport ? 'Product Requirements' : 'Product Interest'}:</strong> ${escapeHtml(inquiry.requirement || '—')}</p>
        <p><strong>${isExport ? 'Quantity' : 'Bulk Quantity'}:</strong> ${escapeHtml(inquiry.estimatedMOQ || '—')}</p>
        <p><strong>Date/Time:</strong> ${submittedAt}</p>
      `,
    });

    return inquiry;
  }

  async updateById(id, payload) {
    const updated = await super.updateById(id, this.normalize(payload));
    return this.decorate(updated);
  }

  async listAll(status) {
    const filter = status ? { status: status === 'declined' ? 'closed' : status } : {};
    const rows = await this.repository.find(filter, { sort: '-createdAt' });
    return rows.map((w) => this.decorate(w));
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = new WholesaleService();