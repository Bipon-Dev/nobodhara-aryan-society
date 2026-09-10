'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import Link from 'next/link';

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

const MemberInstallmentsPage = () => {
    const params = useParams();
    const router = useRouter();
    const memberId = params?.id ? String(params.id) : null;

    const [member, setMember] = useState<Member | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment Add/Edit Dialog State
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Partial<Installment>>({
        installment_type: '1st Installment',
        month_name: 'March-2026',
        deposit_date: new Date().toISOString().split('T')[0],
        deposit_amount: 4000,
        penalty_amount: 0,
        remarks: ''
    });

    const toast = useRef<Toast>(null);

    const formatCurrency = (amount: number) => {
        return (
            '$' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchMemberData = async () => {
        if (!memberId) return;
        setLoading(true);
        try {
            // Fetch member list to find member details
            const memRes = await fetch('/api/members');
            const memData = await memRes.json();
            if (memData.success) {
                const found = memData.data.find((m: Member) => String(m.id) === memberId);
                if (found) {
                    setMember(found);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Member not found' });
                }
            }

            // Fetch member installments
            const instRes = await fetch(`/api/installments?member_id=${memberId}`);
            const instData = await instRes.json();
            if (instData.success) {
                setInstallments(instData.data);
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load member data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemberData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]);

    const savePayment = async () => {
        if (!memberId || !editingPayment.installment_type) return;

        try {
            const payload = {
                ...editingPayment,
                member_id: Number(memberId)
            };
            const isEdit = !!editingPayment.id;
            const res = await fetch('/api/installments', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'Payment updated' : 'Payment added'
                });
                setPaymentDialog(false);
                fetchMemberData();
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save payment' });
        }
    };

    const deletePayment = async (id: number) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        try {
            const res = await fetch(`/api/installments?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Payment deleted' });
                fetchMemberData();
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment' });
        }
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round-xl">
            <Toast ref={toast} position="top-right" />

            {/* Back Button & Top Header */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3 pb-3 border-bottom-1 surface-border">
                <div className="flex align-items-center gap-3">
                    <Link href="/members">
                        <Button icon="pi pi-arrow-left" className="p-button-outlined p-button-secondary" tooltip="Back to Members List" />
                    </Link>
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0">Member Installments Sheet — {member?.name || 'Loading...'}</h3>
                        <span className="text-600">Individual member installment ledger (PDF 1 Format)</span>
                    </div>
                </div>

                <Button
                    label="Add Installment Payment"
                    icon="pi pi-plus"
                    className="p-button-success font-semibold"
                    onClick={() => {
                        setEditingPayment({
                            installment_type: '1st Installment',
                            month_name: 'March-2026',
                            deposit_date: new Date().toISOString().split('T')[0],
                            deposit_amount: 4000,
                            penalty_amount: 0,
                            remarks: ''
                        });
                        setPaymentDialog(true);
                    }}
                />
            </div>

            {member ? (
                <div className="grid">
                    {/* Left Column: Personal Info & Financial Summary Card */}
                    <div className="col-12 lg:col-4 xl:col-3">
                        <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1">
                            {/* Profile Avatar & Header */}
                            <div className="flex align-items-center gap-3 pb-3 mb-3 border-bottom-1 surface-border">
                                <div className="border-circle bg-blue-500 text-white flex align-items-center justify-content-center text-xl font-bold flex-shrink-0 shadow-2" style={{ width: '52px', height: '52px' }}>
                                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-xl font-bold text-900 m-0 line-height-2 text-ellipsis overflow-hidden whitespace-nowrap">{member.name}</h4>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold border-round text-xs">SL No: #{member.sl_no}</span>
                                </div>
                            </div>

                            {/* Contact Details List */}
                            <div className="flex flex-column gap-2 mb-4 pb-3 border-bottom-1 surface-border">
                                <div className="flex align-items-center gap-2 text-700 text-sm">
                                    <i className="pi pi-phone text-blue-500 text-base" />
                                    <span className="text-500 font-medium">Mobile:</span>
                                    <span className="text-900 font-semibold ml-auto">{member.mobile || 'N/A'}</span>
                                </div>
                                <div className="flex align-items-center gap-2 text-700 text-sm">
                                    <i className="pi pi-calendar text-orange-500 text-base" />
                                    <span className="text-500 font-medium">Joined:</span>
                                    <span className="text-900 font-semibold ml-auto">{member.joining_date || 'N/A'}</span>
                                </div>
                                <div className="flex align-items-start gap-2 text-700 text-sm">
                                    <i className="pi pi-map-marker text-green-500 text-base mt-1" />
                                    <span className="text-500 font-medium">Address:</span>
                                    <span className="text-900 font-semibold ml-auto text-right">{member.address || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Financial Summary Stat Blocks */}
                            <div className="flex flex-column gap-3">
                                {/* Share Count & Expected Amount Grid */}
                                <div className="grid grid-nogutter gap-2">
                                    <div className="col surface-100 p-3 border-round-lg text-center border-1 surface-border">
                                        <span className="text-500 block text-xs font-bold uppercase mb-1">Share Count</span>
                                        <span className="text-xl font-bold text-orange-600">{member.share_count} Units</span>
                                    </div>
                                    <div className="col surface-100 p-3 border-round-lg text-center border-1 surface-border">
                                        <span className="text-500 block text-xs font-bold uppercase mb-1">Expected</span>
                                        <span className="text-base font-bold text-900">{formatCurrency(member.expected_amount)}</span>
                                    </div>
                                </div>

                                {/* Total Deposit */}
                                <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                    <div className="flex align-items-center gap-2">
                                        <div className="p-2 border-circle bg-blue-100 text-blue-600 flex align-items-center justify-content-center">
                                            <i className="pi pi-wallet text-sm" />
                                        </div>
                                        <span className="text-700 text-sm font-semibold">Total Deposit</span>
                                    </div>
                                    <strong className="text-base text-blue-600 font-bold">{formatCurrency(member.total_deposit)}</strong>
                                </div>

                                {/* Total Penalty */}
                                <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                    <div className="flex align-items-center gap-2">
                                        <div className="p-2 border-circle bg-pink-100 text-pink-600 flex align-items-center justify-content-center">
                                            <i className="pi pi-exclamation-triangle text-sm" />
                                        </div>
                                        <span className="text-700 text-sm font-semibold">Total Penalty</span>
                                    </div>
                                    <strong className="text-base text-pink-600 font-bold">{formatCurrency(member.total_penalty)}</strong>
                                </div>

                                {/* Total Realized */}
                                <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                    <div className="flex align-items-center gap-2">
                                        <div className="p-2 border-circle bg-purple-100 text-purple-600 flex align-items-center justify-content-center">
                                            <i className="pi pi-check-circle text-sm" />
                                        </div>
                                        <span className="text-700 text-sm font-semibold">Total Realized</span>
                                    </div>
                                    <strong className="text-base text-purple-600 font-bold">{formatCurrency(member.total_realized)}</strong>
                                </div>

                                {/* Surplus / Deficit Card Highlight */}
                                <div className={`p-3 border-round-lg border-1 ${member.surplus_deficit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex align-items-center justify-content-between mb-1">
                                        <span className={`text-xs font-bold uppercase ${member.surplus_deficit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Surplus / Deficit Status</span>
                                        <i className={`pi ${member.surplus_deficit >= 0 ? 'pi-arrow-up-right text-green-600' : 'pi-arrow-down-right text-red-600'} font-bold`} />
                                    </div>
                                    <div className={`text-2xl font-bold ${member.surplus_deficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(member.surplus_deficit)}</div>
                                </div>

                                {member.remarks && (
                                    <div className="p-2.5 border-round-lg bg-yellow-50 border-1 border-yellow-200 text-yellow-900 text-xs">
                                        <strong className="block mb-0.5">Remarks:</strong>
                                        <span>{member.remarks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Installments Payments Table */}
                    <div className="col-12 lg:col-8 xl:col-9">
                        <div className="surface-card border-round-xl border-1 surface-border p-3">
                            <div className="flex justify-content-between align-items-center mb-3">
                                <h4 className="text-lg font-bold text-900 m-0">Payment Ledger</h4>
                                <span className="text-500 text-sm">{installments.length} Records</span>
                            </div>

                            <DataTable value={installments} loading={loading} responsiveLayout="scroll" className="p-datatable-gridlines" emptyMessage="No installment records found.">
                                <Column field="installment_type" header="Type" style={{ width: '15%' }} />
                                <Column field="month_name" header="Month" style={{ width: '20%' }} />
                                <Column field="deposit_date" header="Deposit Date" style={{ width: '15%' }} />
                                <Column field="deposit_amount" header="Deposit Amount" body={(d) => formatCurrency(d.deposit_amount)} style={{ width: '15%' }} />
                                <Column field="penalty_amount" header="Penalty" body={(d) => formatCurrency(d.penalty_amount)} style={{ width: '10%' }} />
                                <Column field="remarks" header="Remarks" style={{ width: '15%' }} />
                                <Column
                                    header="Actions"
                                    style={{ width: '10%' }}
                                    body={(inst: Installment) => (
                                        <div className="flex gap-1">
                                            <Button
                                                icon="pi pi-pencil"
                                                className="p-button-sm p-button-warning p-button-text"
                                                onClick={() => {
                                                    setEditingPayment(inst);
                                                    setPaymentDialog(true);
                                                }}
                                            />
                                            <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => deletePayment(inst.id)} />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 text-center text-600">Loading member ledger details...</div>
            )}

            {/* Payment Add/Edit Dialog */}
            <Dialog visible={paymentDialog} style={{ width: '400px' }} header={editingPayment.id ? 'Edit Installment Record' : 'Add Installment Record'} modal onHide={() => setPaymentDialog(false)}>
                <div className="p-fluid">
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Installment Type (e.g. Lump Sum / 1st Installment)</label>
                        <InputText value={editingPayment.installment_type || ''} onChange={(e) => setEditingPayment({ ...editingPayment, installment_type: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Month Name</label>
                        <InputText value={editingPayment.month_name || ''} onChange={(e) => setEditingPayment({ ...editingPayment, month_name: e.target.value })} placeholder="e.g. March-2026" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Deposit Date</label>
                        <InputText type="date" value={editingPayment.deposit_date || ''} onChange={(e) => setEditingPayment({ ...editingPayment, deposit_date: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Deposit Amount ($)</label>
                        <InputNumber value={editingPayment.deposit_amount || 0} onValueChange={(e) => setEditingPayment({ ...editingPayment, deposit_amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Penalty Amount ($)</label>
                        <InputNumber value={editingPayment.penalty_amount || 0} onValueChange={(e) => setEditingPayment({ ...editingPayment, penalty_amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Remarks (e.g. Share Transfer Note)</label>
                        <InputText value={editingPayment.remarks || ''} onChange={(e) => setEditingPayment({ ...editingPayment, remarks: e.target.value })} />
                    </div>
                    <Button label="Save Payment" icon="pi pi-check" onClick={savePayment} className="mt-2" />
                </div>
            </Dialog>
        </div>
    );
};

export default MemberInstallmentsPage;
