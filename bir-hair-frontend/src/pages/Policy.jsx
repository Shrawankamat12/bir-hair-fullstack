import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import './Content.css';

const content = {
  shipping: {
    title: 'Shipping & Returns',
    body: [
      ['Shipping Timelines', 'In-stock orders ship from our Delhi warehouse within 24 hours. Domestic delivery takes 3–6 business days; international delivery takes 6–12 business days depending on customs.'],
      ['Shipping Costs', 'Orders above ₹15,000 ship free domestically. Below that threshold, a flat ₹499 shipping fee applies. Express shipping is available at checkout for an additional fee.'],
      ['Returns Eligibility', 'Unopened bundles in original packaging may be returned within 7 days of delivery for a full refund, minus shipping costs.'],
      ['Exchanges', 'Opened wefts, wigs and closures can only be exchanged in the case of a manufacturing defect, verified by our QC team.'],
      ['Refund Processing', 'Approved refunds are processed within 5–7 business days back to the original payment method.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      ['Information We Collect', 'We collect the name, contact details, shipping address and order history you provide when placing an order or creating an account.'],
      ['How We Use It', 'Your information is used to process orders, provide customer support and, where you opt in, send product updates.'],
      ['Data Sharing', 'We do not sell personal data. Information is shared only with shipping and payment partners as required to fulfil your order.'],
      ['Your Rights', 'You may request access to, correction of, or deletion of your personal data at any time by contacting our support team.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      ['Use of This Site', 'By placing an order, you confirm the information provided is accurate and that you are authorised to make the purchase.'],
      ['Pricing', 'All prices are listed in Indian Rupees (₹) and are subject to change without prior notice. Wholesale pricing requires a separate agreement.'],
      ['Product Descriptions', 'We aim for accuracy in every product description; minor natural variation in hair texture and colour between batches should be expected.'],
      ['Limitation of Liability', 'B.I.R Hair India Factory is not liable for indirect or consequential damages arising from product use beyond the value of the order.'],
    ],
  },
};

export default function Policy() {
  const { type } = useParams();
  const page = content[type] || content.shipping;

  return (
    <>
      <PageHeader crumbs={[{ label: page.title }]} title={page.title} />
      <div className="section">
        <div className="container">
          <div className="policy-content">
            <p className="policy-updated">Last updated: July 1, 2026</p>
            {page.body.map(([h, p]) => (
              <div key={h}>
                <h2>{h}</h2>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
