'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

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
}

interface Installment {
    id: number;
    member_id: number;
    installment_type: string;
    month_name: string;
    deposit_date?: string;
    deposit_amount: number;
    penalty_amount: number;
    remarks?: string;
}

const MemberSheetReport = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount: number) => {
        return (
            '$' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/members');
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
                if (data.data.length > 0) {
                    setSelectedMemberId(data.data[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstallments = async (memberId: number) => {
        try {
            const res = await fetch(`/api/installments?member_id=${memberId}`);
            const data = await res.json();
            if (data.success) setInstallments(data.data);
        } catch (err) {
            console.error('Failed to load installments:', err);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (selectedMemberId) {
            fetchInstallments(selectedMemberId);
        }
    }, [selectedMemberId]);

    const handlePrint = () => {
        window.print();
    };

    const selectedMemberObj = members.find((m) => m.id === selectedMemberId);

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
                        <h3 className="text-2xl font-bold text-900 m-0">Member Installment Sheet (PDF 1)</h3>
                        <span className="text-600">Individual member installment ledger and share transfer notes</span>
                    </div>

                    <div className="flex flex-wrap gap-2 align-items-center">
                        <Dropdown value={selectedMemberId} options={members.map((m) => ({ label: `${m.sl_no}. ${m.name} (${m.mobile})`, value: m.id }))} onChange={(e) => setSelectedMemberId(e.value)} placeholder="Select Member" className="w-18rem" />

                        <Button label="Print / Save PDF" icon="pi pi-print" className="p-button-success font-semibold" onClick={handlePrint} />
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
                    <div className="text-xl font-bold text-primary mt-2">১ম পাতা - সদস্য কিস্তি হিসাব ({selectedMemberObj?.name || 'Member'})</div>
                </div>

                {selectedMemberObj && (
                    <div>
                        {/* Member Header Block */}
                        <table className="w-full mb-4 text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>SL No:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.sl_no}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Name:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Mobile:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.mobile}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Address:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.address}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Shares:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.share_count}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Total Deposit:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', color: 'blue', fontWeight: 'bold' }}>{formatCurrency(selectedMemberObj.total_deposit)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* PDF 1 Installment Table */}
                        <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Type</th>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Month</th>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Date</th>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Amount</th>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Penalty</th>
                                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments.map((inst) => (
                                    <tr key={inst.id} style={{ textAlign: 'center' }}>
                                        <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.installment_type}</td>
                                        <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.month_name}</td>
                                        <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.deposit_date}</td>
                                        <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.deposit_amount)}</td>
                                        <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.penalty_amount)}</td>
                                        <td style={{ padding: '6px', border: '1px solid #ccc', fontSize: '12px' }}>{inst.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberSheetReport;
