import React, { useRef } from "react";
import { Button } from "./ui/button";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface InvoiceItem {
  id: string;
  productName: string;
  pcs: number;
  grossWt: number;
  stoneWt: number;
  metalPurity: string;
  price: number;
}

interface InvoiceScreenProps {
  items: InvoiceItem[];
  exchangeCredit: number;
  wastage: number;
  makingCharges: number;
  discountAmount: number;
  grandTotal: number;
  onClose: () => void;
}

export function InvoiceScreen({ 
  items, 
  exchangeCredit, 
  wastage, 
  makingCharges, 
  discountAmount, 
  grandTotal,
  onClose 
}: InvoiceScreenProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Generate invoice number and date
  const invoiceNumber = `BJ/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  const invoiceDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const handlePrint = () => {
    window.print();
  };

  // Calculate net weight for each item
  const getNetWeight = (grossWt: number, stoneWt: number) => {
    return (grossWt - stoneWt).toFixed(2);
  };

  // Calculate taxes (3% CGST + 3% SGST = 6% GST)
  const taxableValue = items.reduce((acc, item) => acc + item.price, 0) + makingCharges + wastage - exchangeCredit;
  const cgst = taxableValue * 0.015; // 1.5%
  const sgst = taxableValue * 0.015; // 1.5%
  const totalWithTax = taxableValue + cgst + sgst - discountAmount;

  // Convert number to words (simplified version)
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero Rupees Only';
    
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = Math.floor(num % 100);
    
    let words = '';
    
    if (crores > 0) words += ones[crores] + ' Crore ';
    if (lakhs > 0) words += (lakhs < 10 ? ones[lakhs] : (lakhs < 20 ? teens[lakhs - 10] : tens[Math.floor(lakhs / 10)] + ' ' + ones[lakhs % 10])) + ' Lakh ';
    if (thousands > 0) words += (thousands < 10 ? ones[thousands] : (thousands < 20 ? teens[thousands - 10] : tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10])) + ' Thousand ';
    if (hundreds > 0) words += ones[hundreds] + ' Hundred ';
    if (remainder > 0) {
      if (remainder < 10) words += ones[remainder];
      else if (remainder < 20) words += teens[remainder - 10];
      else words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
    }
    
    return words.trim() + ' Rupees Only';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl max-h-[95vh] overflow-auto">
        {/* Action Buttons - Hidden on print */}
        <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-slate-900">Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} style={{ backgroundColor: "#0f52ba" }}>
              Print Invoice
            </Button>
            <Button onClick={onClose} variant="outline" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-8 bg-white" id="invoice-content">
          {/* Header */}
          <div className="border-2 border-slate-800 mb-4">
            <div className="p-4" style={{ backgroundColor: "#0f52ba" }}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h1 className="text-2xl mb-1">Bhargava Jewelers</h1>
                  <p className="text-sm">World's Trusted Jeweller</p>
                </div>
                <div className="text-right text-white text-xs">
                  <p>Government of India/State of Telangana</p>
                  <p>Form GST INV-1</p>
                  <p className="mt-1">(SEE RULE 46 OF CGST RULES 2017)</p>
                  <p className="font-semibold">SALE INVOICE</p>
                </div>
              </div>
            </div>

            {/* Store and Customer Details */}
            <div className="grid grid-cols-2 gap-4 p-4 border-t-2 border-slate-800">
              <div>
                <div className="mb-3">
                  <p className="text-xs text-slate-600">GSTIN</p>
                  <p className="text-sm">37XXXXXXXXXXXXX</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-600">Address</p>
                  <p className="text-sm">MG Road, Labbipet</p>
                  <p className="text-sm">Vijayawada, Andhra Pradesh - 520010</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Date of Invoice</p>
                    <p className="text-sm">{invoiceDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Invoice No.</p>
                    <p className="text-sm">{invoiceNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-32 h-32 border border-slate-300 flex items-center justify-center">
                  <QRCodeSVG value={invoiceNumber} size={120} level="M" />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t-2 border-slate-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800" style={{ backgroundColor: "#f5f5f5" }}>
                    <th className="text-left p-2 border-r border-slate-300">SL</th>
                    <th className="text-left p-2 border-r border-slate-300">Description of Goods</th>
                    <th className="text-left p-2 border-r border-slate-300">HSN Code</th>
                    <th className="text-center p-2 border-r border-slate-300">Pcs</th>
                    <th className="text-center p-2 border-r border-slate-300">Gross Wt.</th>
                    <th className="text-center p-2 border-r border-slate-300">Stone Wt.</th>
                    <th className="text-center p-2 border-r border-slate-300">Net Wt.</th>
                    <th className="text-center p-2 border-r border-slate-300">Metal/VA</th>
                    <th className="text-right p-2 border-r border-slate-300">Stone</th>
                    <th className="text-right p-2">Taxable Value</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300">{index + 1}</td>
                      <td className="p-2 border-r border-slate-300">
                        {item.productName.toUpperCase()}<br />
                        <span className="text-[10px] text-slate-600">{item.metalPurity}</span>
                      </td>
                      <td className="p-2 border-r border-slate-300">71131910</td>
                      <td className="text-center p-2 border-r border-slate-300">{item.pcs}</td>
                      <td className="text-center p-2 border-r border-slate-300">{item.grossWt.toFixed(2)}</td>
                      <td className="text-center p-2 border-r border-slate-300">{item.stoneWt.toFixed(2)}</td>
                      <td className="text-center p-2 border-r border-slate-300">{getNetWeight(item.grossWt, item.stoneWt)}</td>
                      <td className="text-center p-2 border-r border-slate-300">-</td>
                      <td className="text-right p-2 border-r border-slate-300">-</td>
                      <td className="text-right p-2">₹{item.price.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  
                  {/* Additional Charges */}
                  {makingCharges > 0 && (
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300"></td>
                      <td className="p-2 border-r border-slate-300">MAKING CHARGES</td>
                      <td className="p-2 border-r border-slate-300" colSpan={7}></td>
                      <td className="text-right p-2">₹{makingCharges.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  
                  {wastage > 0 && (
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300"></td>
                      <td className="p-2 border-r border-slate-300">WASTAGE</td>
                      <td className="p-2 border-r border-slate-300" colSpan={7}></td>
                      <td className="text-right p-2">₹{wastage.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  
                  {exchangeCredit > 0 && (
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300"></td>
                      <td className="p-2 border-r border-slate-300">EXCHANGE CREDIT</td>
                      <td className="p-2 border-r border-slate-300" colSpan={7}></td>
                      <td className="text-right p-2 text-red-600">-₹{exchangeCredit.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div className="border-t border-slate-800 p-3 text-xs">
              <span className="font-semibold">Amount in words:</span> {numberToWords(Math.floor(totalWithTax))}
            </div>

            {/* Tax Calculation */}
            <div className="border-t-2 border-slate-800 grid grid-cols-2">
              <div className="p-4">
                {/* Payment Terms or Additional Info */}
              </div>
              <div className="border-l-2 border-slate-800">
                <div className="flex justify-between p-2 border-b border-slate-300 text-xs">
                  <span>Taxable Value</span>
                  <span>₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-slate-300 text-xs">
                  <span>CGST @ 1.5%</span>
                  <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-slate-300 text-xs">
                  <span>SGST @ 1.5%</span>
                  <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between p-2 border-b border-slate-300 text-xs">
                    <span>Discount</span>
                    <span className="text-red-600">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 border-b border-slate-300 text-xs">
                  <span>Round Off</span>
                  <span>₹{(Math.round(totalWithTax) - totalWithTax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between p-3 text-sm" style={{ backgroundColor: "#f5f5f5" }}>
                  <span className="font-semibold">Total Invoice Value (in Figures)</span>
                  <span className="font-semibold">₹{Math.round(totalWithTax).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Stamps and Signature */}
            <div className="border-t-2 border-slate-800 grid grid-cols-2 gap-4 p-6">
              <div className="flex items-center justify-center">
                <div className="border-4 border-blue-600 px-8 py-3 rotate-[-5deg]">
                  <p className="text-blue-600 text-xl font-semibold">DELIVERED</p>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="text-right mb-4">
                  <p className="text-xs text-slate-600 mb-8">For Bhargava Jewelers</p>
                  <p className="text-xs font-semibold">Authorized Signatory</p>
                </div>
                <div className="border-4 border-red-600 px-12 py-3">
                  <p className="text-red-600 text-xl font-semibold">PAID</p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t-2 border-slate-800 p-3 text-[9px] text-slate-700 leading-tight">
              <p className="mb-1"><span className="font-semibold">Certified:</span> This invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              <p className="mb-1"><span className="font-semibold">Terms & Conditions:</span> Exchange is subject to buyer of the Gold and Silver, Diamond and Precious Stones. Polki is not exchangeable. Subject to Vijayawada Jurisdiction only.</p>
              <p><span className="font-semibold">Note:</span> All disputes subject to Vijayawada jurisdiction only. Goods once sold will be taken back for exchange purpose only. No cash refund will be given for exchange.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}