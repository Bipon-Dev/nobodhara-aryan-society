import React, { useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated && data.user && data.user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            })
            .catch(() => setIsAdmin(false));
    }, []);

    // Standard User Menu: Only Dashboard & My Profile
    const userMenuItems: AppMenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/profile' }
    ];

    // Admin Menu: Full Access
    const adminMenuItems: AppMenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/profile' },
        { label: 'Members Ledger', icon: 'pi pi-fw pi-users', to: '/members' },
        { label: 'Expense Ledger', icon: 'pi pi-fw pi-wallet', to: '/expenses' },
        {
            label: 'Reports',
            icon: 'pi pi-fw pi-print',
            items: [
                { label: 'Overall Summary Ledger', icon: 'pi pi-fw pi-chart-bar', to: '/reports/summary' },
                { label: 'Member Installment Sheet', icon: 'pi pi-fw pi-id-card', to: '/reports/member-sheet' },
                { label: 'Monthly Expenses Ledger', icon: 'pi pi-fw pi-file', to: '/reports/expenses' }
            ]
        }
    ];

    const model: AppMenuItem[] = [
        {
            label: 'Main Menu',
            items: isAdmin ? adminMenuItems : userMenuItems
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
