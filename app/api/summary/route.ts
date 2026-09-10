import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        await initDB();

        // Total Deposits from Installments
        const [depRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(deposit_amount), 0) as total_deposit FROM member_installments'
        );

        // Total Shares from Members
        const [shareRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(share_count), 0) as total_shares FROM members'
        );

        // Total Expenses from Expenses
        const [expRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses'
        );

        const totalDeposit = Number(depRows[0]?.total_deposit || 0);
        const totalShares = Number(shareRows[0]?.total_shares || 0);
        const totalExpenses = Number(expRows[0]?.total_expenses || 0);
        const netBalance = totalDeposit - totalExpenses;

        return NextResponse.json({
            success: true,
            data: {
                totalDeposit,
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

