import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, Search, X } from "lucide-react";
import Card from "../../../components/common/Card";
import Modal from "../../../components/common/Modal/Modal";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";

import {
  SEED_PAYMENT_REPORTS,
  SEED_PAYMENT_TOTALS,
  SEED_INVOICE_HISTORY,
  SEED_PENDING_INVOICES
} from "../../../types/mockData";
import {
  type InstitutionPaymentReport,
  type InvoiceHistory,
} from "../../../types/interfaces";


const formatAmount = (amount: number) =>
  amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatTotalHeader = (amount: number) =>
  amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getInstitution = (institutionId: number) =>
  SEED_PAYMENT_REPORTS.find((report) => report.id === institutionId) ?? SEED_PAYMENT_REPORTS[0];

const getInvoiceHistory = (institutionId: number) =>
  SEED_INVOICE_HISTORY[institutionId] ?? SEED_INVOICE_HISTORY[1];

const getPendingInvoices = (institutionId: number) =>
  SEED_PENDING_INVOICES[institutionId] ?? SEED_PENDING_INVOICES[1];

const AmountLink = ({ amount, onClick }: { amount: number; onClick?: () => void }) => {
  if (!onClick) {
    return <span className="font-semibold text-gray-700">{formatAmount(amount)}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-[#1D6BA3] underline-offset-2 transition hover:underline"
    >
      {formatAmount(amount)}
    </button>
  );
};

const HeaderWithTotal = ({ label, total }: { label: string; total: number }) => (
  <div className="leading-tight">
    <div>{label}</div>
    <div className="font-semibold text-gray-900">( {formatTotalHeader(total)})</div>
  </div>
);

const InvoiceHistoryView = () => {
  const navigate = useNavigate();
  const { institutionId } = useParams();
  const selectedInstitutionId = Number(institutionId);
  const institution = getInstitution(selectedInstitutionId);

  const columns: Column<InvoiceHistory>[] = [
    {
      key: "invoiceDate",
      header: "Invoice Date",
      render: (invoice) => <span className="text-gray-700">{invoice.invoiceDate}</span>,
    },
    {
      key: "invoiceNo",
      header: "Invoice No.",
      render: (invoice) => <span className="text-gray-700">{invoice.invoiceNo}</span>,
    },
    {
      key: "totalAmount",
      header: "Total Amount (₹)",
      render: (invoice) => <span className="text-gray-700">{formatAmount(invoice.totalAmount)}</span>,
    },
    {
      key: "amountPaid",
      header: "Amount Paid (₹)",
      render: (invoice) => <span className="text-gray-700">{formatAmount(invoice.amountPaid)}</span>,
    },
    {
      key: "amountPending",
      header: "Amount Pending (₹)",
      render: (invoice) => <span className="text-gray-700">{formatAmount(invoice.amountPending)}</span>,
    },
  ];

  return (
    <Card noPadding className="rounded-xl border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate("/super-admin/finance/payment-report")}
          className="inline-flex items-center gap-2 text-[15px] font-bold text-gray-900 transition hover:text-[#1D6BA3]"
        >
          <ArrowLeft size={18} />
          {institution.institutionName} Invoice History
        </button>
      </div>

      <div className="px-6 pb-6 pt-4">
        <DataTable
          data={getInvoiceHistory(institution.id)}
          columns={columns}
          emptyMessage="No invoice history found."
          showPagination={false}
          containerClassName="rounded-xl border border-gray-200"
          tableClassName="text-xs"
          headerRowClassName="bg-[#EAF6FF]"
        />
      </div>
    </Card>
  );
};

const DateInput = ({ placeholder }: { placeholder: string }) => (
  <div className="relative">
    <Calendar
      size={14}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="text"
      placeholder={placeholder}
      className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-700 outline-none placeholder:text-gray-500 focus:border-[#1D6BA3] focus:ring-2 focus:ring-[#1D6BA3]/20"
    />
  </div>
);

const AmountEntry = () => (
  <input
    type="text"
    placeholder="Enter"
    className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none placeholder:text-gray-500 focus:border-[#1D6BA3] focus:ring-2 focus:ring-[#1D6BA3]/20"
  />
);

const PayInFullCheckbox = () => (
  <label className="inline-flex items-center gap-2 text-xs text-gray-700">
    <input
      type="checkbox"
      className="h-3.5 w-3.5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]"
    />
    Pay in Full
  </label>
);

const PendingPaymentView = () => {
  const navigate = useNavigate();
  const { institutionId } = useParams();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const selectedInstitutionId = Number(institutionId);
  const institution = getInstitution(selectedInstitutionId);
  const pendingInvoices = getPendingInvoices(institution.id);

  const totals = pendingInvoices.reduce(
    (summary, invoice) => ({
      total: summary.total + invoice.amount,
      paid: summary.paid + invoice.paidAmount,
      remaining: summary.remaining + invoice.remainingAmount,
    }),
    { total: 0, paid: 0, remaining: 0 }
  );

  return (
    <div className="space-y-4">
      <Card noPadding className="rounded-md border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/super-admin/finance/payment-report")}
            className="inline-flex items-center gap-3 text-sm font-bold text-gray-900 transition hover:text-[#1D6BA3]"
          >
            <ArrowLeft size={18} />
            Bulk Service Bill Payment
          </button>
        </div>
      </Card>

      <Card noPadding className="rounded-md border-gray-200 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-sm font-bold text-gray-900">{institution.institutionName}</h1>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,170px)_minmax(0,170px)_auto] lg:w-auto">
            <DateInput placeholder="From Date" />
            <DateInput placeholder="To Date" />
            <button
              type="button"
              className="h-9 rounded-md bg-[#1D6BA3] px-4 text-xs font-bold text-white transition hover:bg-[#16557f]"
            >
              Search
            </button>
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-[980px] w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#EAF6FF] text-left text-[13px] font-bold text-gray-700">
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3">Total ()</th>
                  <th className="px-4 py-3">Paid Amount (x)</th>
                  <th className="px-4 py-3">Remaining Amount (x)</th>
                  <th className="px-4 py-3">Enter Amount (x)</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                <tr>
                  <td className="px-4 py-2">
                    <DateInput placeholder="To Date" />
                  </td>
                  <td className="px-4 py-2">
                    <select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-[#1D6BA3] focus:ring-2 focus:ring-[#1D6BA3]/20">
                      <option>Select</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">{formatAmount(totals.total)}</td>
                  <td className="px-4 py-2">{formatAmount(totals.paid)}</td>
                  <td className="px-4 py-2">{formatAmount(totals.remaining)}</td>
                  <td className="px-4 py-2">
                    <AmountEntry />
                  </td>
                  <td className="px-4 py-2">
                    <PayInFullCheckbox />
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr className="bg-[#EAF6FF] text-left text-[13px] font-bold text-gray-700">
                  <th className="px-4 py-3">Invoice Date</th>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Paid Amount (x)</th>
                  <th className="px-4 py-3">Remaining Amount (x)</th>
                  <th className="px-4 py-3">Enter Amount (x)</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {pendingInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-2">{invoice.invoiceDate}</td>
                    <td className="px-4 py-2">{invoice.invoiceNo}</td>
                    <td className="px-4 py-2">{formatAmount(invoice.amount)}</td>
                    <td className="px-4 py-2">{formatAmount(invoice.paidAmount)}</td>
                    <td className="px-4 py-2">{formatAmount(invoice.remainingAmount)}</td>
                    <td className="px-4 py-2">
                      <AmountEntry />
                    </td>
                    <td className="px-4 py-2">
                      <PayInFullCheckbox />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Card noPadding className="w-full max-w-md rounded-md border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <h2 className="text-sm font-bold text-gray-900">Total</h2>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-md border border-gray-200 bg-gray-50">
              {[
                ["Amount Paid:", formatAmount(0)],
                ["Amount Used For Payments", formatAmount(0)],
                ["Amount in Excess", formatAmount(0)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-gray-200 px-4 py-3 last:border-b-0"
                >
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                  <span className="text-xs font-bold text-green-600">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(true)}
                className="h-9 rounded-md bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700"
              >
                Pay Amount
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Pay Amount"
        size="sm"
      >
        <div className="flex min-h-[150px] flex-col items-center justify-center gap-5 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7DC85B]">
            <CheckCircle size={34} className="text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">Amount Paid Successfully</p>
        </div>
      </Modal>
    </div>
  );
};

const SuperAdminPaymentReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return SEED_PAYMENT_REPORTS;

    return SEED_PAYMENT_REPORTS.filter((report) =>
      report.institutionName.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const columns: Column<InstitutionPaymentReport>[] = [
    {
      key: "institutionName",
      header: "Institution Name",
      className: "w-[30%] text-gray-900 font-semibold",
    },
    {
      key: "totalAmount",
      header: <HeaderWithTotal label="Total Amount" total={SEED_PAYMENT_TOTALS.totalAmount} />,
      render: (report) => (
        <AmountLink
          amount={report.totalAmount}
          onClick={() => navigate(`/super-admin/finance/payment-report/${report.id}`)}
        />
      ),
    },
    {
      key: "totalPaymentDone",
      header: <HeaderWithTotal label="Total Payment Done" total={SEED_PAYMENT_TOTALS.totalPaymentDone} />,
      render: (report) => (
        <AmountLink
          amount={report.totalPaymentDone}
          onClick={() => navigate(`/super-admin/finance/payment-report/${report.id}`)}
        />
      ),
    },
    {
      key: "totalPaymentPending",
      header: <HeaderWithTotal label="Total Payment Pending" total={SEED_PAYMENT_TOTALS.totalPaymentPending} />,
      render: (report) => (
        <AmountLink
          amount={report.totalPaymentPending}
          onClick={() => navigate(`/super-admin/finance/payment-report/${report.id}/pending`)}
        />
      ),
    },
  ];

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="space-y-4">
      <Card noPadding className="rounded-md border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-sm font-bold text-gray-900">Institution Payment Report</h1>
        </div>
      </Card>

      <Card noPadding className="rounded-md border-gray-200 shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="relative w-full max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search ..."
              className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-9 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1D6BA3] focus:ring-2 focus:ring-[#1D6BA3]/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                title="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <DataTable
            data={filteredReports}
            columns={columns}
            emptyMessage="No institution payment reports found."
            showPagination={false}
            containerClassName="rounded-md border border-gray-200"
            tableClassName="text-xs"
            headerRowClassName="bg-[#EAF6FF]"
          />
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminPaymentReport;
export { InvoiceHistoryView as SuperAdminInvoiceHistory };
export { PendingPaymentView as SuperAdminPendingPayment };
