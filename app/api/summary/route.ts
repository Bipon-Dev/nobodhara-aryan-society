import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        await initDB();

        // Total Deposits & Penalties from Installments (active records)
        const [depRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(deposit_amount), 0) as total_deposit, COALESCE(SUM(penalty_amount), 0) as total_penalty, COALESCE(SUM(deposit_amount + penalty_amount), 0) as total_realized FROM member_installments WHERE deleted_at IS NULL'
        );

        // Total Shares from Members (active records)
        const [shareRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(share_count), 0) as total_shares FROM members WHERE deleted_at IS NULL'
        );

        // Total Expenses from Expenses (active records)
        const [expRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE deleted_at IS NULL'
        );

        const totalDeposit = Number(depRows[0]?.total_deposit || 0);
        const totalPenalty = Number(depRows[0]?.total_penalty || 0);
        const totalRealized = Number(depRows[0]?.total_realized || 0);
        const totalShares = Number(shareRows[0]?.total_shares || 0);
        const totalExpenses = Number(expRows[0]?.total_expenses || 0);
        const netBalance = totalRealized - totalExpenses;

        return NextResponse.json({
            success: true,
            data: {
                totalDeposit,
                totalPenalty,
                totalRealized,
                totalShares,
                totalExpenses,
                netBalance
            }
        });
    } catch (error: any) {
        console.error('Summary API error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch summary' }, { status: 500 });
    }
}
