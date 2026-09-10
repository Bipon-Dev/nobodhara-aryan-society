'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { exportToCSV } from '@/lib/export';

interface Member {
    id: number;
    sl_no: number;
    name: string;
    joining_date?: string;
    mobile?: string;
    address?: string;
    share_count: number;
    expected_amount: number;
    remarks?: string;
    total_deposit: number;
    total_penalty: number;
    total_realized: number;
    surplus_deficit: number;
}

const OverallSummaryReport = () => {
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [members, setMembers] = useState<Member[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const monthsList = [
        { label: 'All Months (সকল মাস)', value: 'All' },
        { label: 'January 2026 (জানুয়ারি-২০২৬)', value: '01' },
        { label: 'February 2026 (ফেব্রুয়ারি-২০২৬)', value: '02' },
        { label: 'March 2026 (মার্চ-২০২৬)', value: '03' },
        { label: 'April 2026 (এপ্রিল-২০২৬)', value: '04' },
        { label: 'May 2026 (মে-২০২৬)', value: '05' },
        { label: 'June 2026 (জুন-২০২৬)', value: '06' },
        { label: 'July 2026 (জুলাই-২০২৬)', value: '07' },
        { label: 'August 2026 (আগস্ট-২০২৬)', value: '08' },
        { label: 'September 2026 (সেপ্টেম্বর-২০২৬)', value: '09' },
        { label: 'October 2026 (অক্টোবর-২০২৬)', value: '10' },
        { label: 'November 2026 (নভেম্বর-২০২৬)', value: '11' },
        { label: 'December 2026 (ডিসেম্বর-২০২৬)', value: '12' }
    ];

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const sumRes = await fetch('/api/summary');
            const sumData = await sumRes.json();
            if (sumData.success) setSummary(sumData.data);

            const memRes = await fetch('/api/members');
            const memData = await memRes.json();
            if (memData.success) setMembers(memData.data);
        } catch (err) {
            console.error('Failed to load report data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const headers = ['SL', 'Name', 'Mobile No', 'Address', 'Shares', 'Total Deposit', 'Total Penalty', 'Total Realized', 'Surplus / Deficit', 'Remarks'];
        const rows = members.map((m) => [m.sl_no, m.name, m.mobile || '', m.address || '', m.share_count, m.total_deposit, m.total_penalty, m.total_realized, m.surplus_deficit, m.remarks || '']);
        exportToCSV('Overall_Members_Summary', headers, rows);
    };

    return (
        <div>
            {/* CSS Print Styles */}
            <style jsx global>{`
                @media print {
                    .layout-topbar,
                    .layout-sidebar,
                    .no-print {
                        display: none !important;
                    }
                    .layout-main-container {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .printable-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
            `}</style>

            {/* Controls (Hidden on Print) */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 no-print">
                <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0">Overall Members Summary Ledger (PDF 2)</h3>
                        <span className="text-600">Printable financial summary report for all members</span>
                    </div>

                    <div className="flex flex-wrap gap-2 align-items-center">
                        <Dropdown value={selectedMonth} options={monthsList} onChange={(e) => setSelectedMonth(e.value)} placeholder="Select Month" className="w-14rem" />

                        <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary font-semibold" onClick={handlePrint} />
                        <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger font-semibold" onClick={handlePrint} />
                        <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success font-semibold" onClick={handleExportExcel} />
                    </div>
                </div>
            </div>

            {/* Printable Report Output Area */}
            <div className="surface-card p-5 shadow-2 border-round-xl printable-area">
                {/* Official PDF Header Banner */}
                <div className="text-center border-bottom-2 surface-border pb-3 mb-4">
                    <h2 className="text-3xl font-bold text-900 m-0" style={{ color: '#1B365D' }}>
                        নবধারা আরিয়ান সোসাইটি
                    </h2>
                    <div className="text-700 font-medium mt-1">আরিয়ান সিটি, বনগাঁও, সাভার, ঢাকা — ১লা জানুয়ারি, ২০২৬ খ্রিস্টাব্দ</div>
                    <div className="text-xl font-bold text-primary mt-2">এক নজরে সামগ্রিক হিসাব (Overall Members Summary Ledger)</div>
                </div>

                {/* Summary Header Cards */}
                <div className="grid mb-4 text-center">
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Deposit</span>
                            <span className="text-xl font-bold text-blue-700">{formatCurrency(summary.totalDeposit)}</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Shares</span>
                            <span className="text-xl font-bold text-orange-700">{summary.totalShares} Units</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Expenses Paid</span>
                            <span className="text-xl font-bold text-purple-700">{formatCurrency(summary.totalExpenses)}</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Net Balance</span>
                            <span className="text-xl font-bold text-green-700">{formatCurrency(summary.netBalance)}</span>
                        </div>
                    </div>
                </div>

                {/* PDF 2 Data Table */}
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>SL</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Name</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Mobile No</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Address</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Shares</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Deposit</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Penalty</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Realized</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Surplus / Deficit</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => (
                            <tr key={m.id} style={{ textAlign: 'center' }}>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.sl_no}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{m.name}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.mobile}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{m.address}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.share_count}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_deposit)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_penalty)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_realized)}</td>
                                <td
                                    style={{
                                        padding: '6px',
                                        border: '1px solid #ccc',
                                        fontWeight: 'bold',
                                        color: m.surplus_deficit >= 0 ? 'green' : 'red'
                                    }}
                                >
                                    {formatCurrency(m.surplus_deficit)}
                                </td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontSize: '12px' }}>{m.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverallSummaryReport;
