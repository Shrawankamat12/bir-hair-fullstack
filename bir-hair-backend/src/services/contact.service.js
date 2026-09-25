const BaseService = require('./base.service');
const { contactRepository } = require('../repositories');
const emailService = require('./email.service');

class ContactService extends BaseService {
  constructor() {
    super(contactRepository, 'Message');
  }

  async create(payload) {
    const message = await this.repository.create(payload);

    
    const submittedAt = new Date(message.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    emailService.sendBusinessNotification({
      subject: `New Contact Message${message.subject ? `: ${message.subject}` : ''}`,
      replyTo: message.email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(message.phone || '—')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(message.subject || '—')}</p>
        <p><strong>Date/Time:</strong> ${submittedAt}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message.message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    return message;
  }

  async listAll(status) {
    const filter = status ? { status } : {};
    return this.repository.find(filter, { sort: '-createdAt' });
  }

  async updateStatus(id, status) {
    return this.updateById(id, { status });
  }
}

// Minimal HTML-escaping so form input can never inject markup into the
// notification email the business receives.
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = new ContactService();