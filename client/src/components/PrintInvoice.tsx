import { forwardRef } from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getCompanySettings } from '../utils/companySettings';

interface PrintInvoiceProps {
  invoice: Invoice;
}

function formatExpiryDate(dateStr: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' });
  } catch {
    return dateStr;
  }
}

const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(({ invoice }, ref) => {
  const company = getCompanySettings();
  const taxableValue = invoice.subtotal - invoice.discountTotal;

  return (
    <div ref={ref} className="bg-white print-invoice" style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial, sans-serif', padding: 0, margin: '0 auto' }}>
      <div style={{ border: '2px solid #000', margin: 0, minHeight: '1123px', display: 'flex', flexDirection: 'column' }}>
        
        {/* ── HEADER ── */}
        <div style={{ borderBottom: '1px solid #000', padding: '16px 20px 10px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 4px', color: '#000' }}>{company.name}</h1>
          <p style={{ fontSize: '9px', color: '#000', margin: '1px 0' }}>{company.address}</p>
          <p style={{ fontSize: '9px', color: '#000', margin: '1px 0' }}>
            Phone: {company.phone} &nbsp;|&nbsp; Email: {company.email} &nbsp;|&nbsp; GST: {company.gst}
          </p>
        </div>

        {/* ── INVOICE TITLE BAR ── */}
        <div style={{ borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#000', margin: 0, letterSpacing: '0.5px' }}>
            {invoice.formName || 'TAX INVOICE'}
          </h2>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#000' }}>
            <span style={{ fontWeight: 700 }}>{invoice.invoiceNo}</span>
            <span style={{ marginLeft: '12px' }}>Date: {formatDate(invoice.date)}</span>
          </div>
        </div>

        {/* ── BILL TO / DETAILS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid #000' }}>
          <div>
            <h4 style={{ fontSize: '8px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Bill To</h4>
            <p style={{ fontWeight: 600, fontSize: '12px', margin: '0 0 2px', color: '#000' }}>{invoice.customerDetails.name}</p>
            <p style={{ fontSize: '10px', color: '#000', margin: '2px 0', lineHeight: '1.4' }}>
              {invoice.customerDetails.address}, {invoice.customerDetails.city}, {invoice.customerDetails.state} - {invoice.customerDetails.pincode}
            </p>
            {invoice.customerDetails.gstNo && (
              <p style={{ fontSize: '10px', color: '#000', margin: '4px 0 0' }}>
                <span style={{ fontWeight: 600 }}>GST No:</span> {invoice.customerDetails.gstNo}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '8px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Invoice Details</h4>
            <table style={{ fontSize: '10px', marginLeft: 'auto', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ color: '#000', padding: '1px 6px 1px 0' }}>Invoice No:</td><td style={{ fontWeight: 600, color: '#000', padding: '1px 0' }}>{invoice.invoiceNo}</td></tr>
                <tr><td style={{ color: '#000', padding: '1px 6px 1px 0' }}>Date:</td><td style={{ fontWeight: 600, color: '#000', padding: '1px 0' }}>{formatDate(invoice.date)}</td></tr>
                <tr><td style={{ color: '#000', padding: '1px 6px 1px 0' }}>Due Date:</td><td style={{ fontWeight: 600, color: '#000', padding: '1px 0' }}>{formatDate(invoice.date)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <div style={{ padding: '6px 20px' }}>
          <table style={{ width: '100%', fontSize: '9.5px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#000' }}>#</th>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#000' }}>Product</th>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#000' }}>HSN</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>Pack</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>Qty</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>Rate</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>Disc%</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>GST%</th>
                <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px', color: '#000' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '4px 6px', color: '#000' }}>{idx + 1}</td>
                  <td style={{ padding: '4px 6px', fontWeight: 500, color: '#000' }}>
                    {item.product}
                    <span style={{ color: '#555', fontWeight: 400, marginLeft: '3px' }}>
                      (Exp: {formatExpiryDate(item.expiry)})
                    </span>
                  </td>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace', color: '#000', fontSize: '8.5px' }}>{item.hsnCode}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000' }}>{item.pack}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000' }}>{item.quantity}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000' }}>{item.rate.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000' }}>{item.discount}%</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000' }}>{item.gst}%</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600, color: '#000' }}>{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── SUMMARY ── */}
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ fontSize: '10px', width: '280px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px 8px', color: '#000' }}>Subtotal:</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 500, color: '#000' }}>{formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px 8px', color: '#000' }}>Taxable Value:</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 500, color: '#000' }}>{formatCurrency(taxableValue)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px 8px', color: '#000' }}>Discount:</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 500, color: '#000' }}>-{formatCurrency(invoice.discountTotal)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px 8px', color: '#000' }}>GST:</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 500, color: '#000' }}>+{formatCurrency(invoice.gstTotal)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: 700, fontSize: '11px', color: '#000', borderTop: '2px solid #000' }}>Grand Total:</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: '11px', color: '#000', borderTop: '2px solid #000' }}>{formatCurrency(invoice.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── AMOUNT IN WORDS ── */}
        <div style={{ margin: '0 20px 8px', padding: '6px 12px', border: '1px solid #000' }}>
          <p style={{ fontSize: '9.5px', color: '#000', margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Amount in Words: </span>
            {invoice.amountInWords}
          </p>
        </div>

        {/* ── SIGNATURES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '12px 20px 16px', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '70%', margin: '0 auto 4px', paddingTop: '4px' }}>
              <p style={{ fontSize: '9px', color: '#000', margin: 0 }}>Customer Signature</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '70%', margin: '0 auto 4px', paddingTop: '4px' }}>
              <p style={{ fontSize: '9px', color: '#000', margin: 0 }}>Authorised Signatory</p>
            </div>
          </div>
        </div>

        {/* ── TERMS & CONDITIONS ── */}
        <div style={{ padding: '8px 20px', marginTop: 'auto' }}>
          <h4 style={{ fontSize: '8px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 3px' }}>Terms & Conditions</h4>
          <p style={{ fontSize: '7.5px', color: '#000', margin: 0, lineHeight: '1.5' }}>
            1. Goods once sold will not be taken back. &nbsp; 2. Interest @ 24% p.a. will be charged on overdue payments. &nbsp; 3. Subject to local jurisdiction.
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: '1px solid #000', textAlign: 'center', padding: '5px 20px', fontSize: '8px', color: '#000' }}>
          <p style={{ margin: 0 }}>
            This is a computer-generated {invoice.formName?.toLowerCase() || 'invoice'} &nbsp;|&nbsp; GST: {company.gst}
          </p>
        </div>
      </div>
    </div>
  );
});

PrintInvoice.displayName = 'PrintInvoice';
export default PrintInvoice;
