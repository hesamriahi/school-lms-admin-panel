export const ROUTES = {
    home: '/',
    login: '/login',
    profile: '/profile',
    calendar: '/calendar',
    blank: '/blank',
    formElements: '/form-elements',
    alerts: '/alerts',
    avatars: '/avatars',
    badge: '/badge',
    buttons: '/buttons',
    images: '/images',
    videos: '/videos',
    error404: '*',
    // users
    userIndex: '/users',
    userCreate: '/users/create',
    userEdit: '/users/:id/edit',
    userTransactionIndex: '/users/:id/transactions',
    // reserved loans
    reservedLoansIndex: '/reserved-loans',
    reservedLoansDelete: '/reserved-loans/:id',
    paymentLoansIndex: '/payment-loans',
    paymentLoansShow: '/payment-loans/:id',
    loansIndex: '/loans',
    installmentsIndex: '/installments',
    // Accounting Actions
    accountingActionsIndex: '/accounting-actions',
    accountingActionsStore: '/accounting-actions/store',
    accountingActionsShow: '/accounting-actions/:id',
    // Settings (by group key: loans, general, ...)
    settingsIndex: '/settings',
    settingsGroup: `/settings/:group`,
    // Charts
    lineChart: '/line-chart',
    barChart: '/bar-chart',
    pieChart: '/pie-chart',
    doughnutChart: '/doughnut-chart',
    radarChart: '/radar-chart',
    polarChart: '/polar-chart',
    bubbleChart: '/bubble-chart',
    scatterChart: '/scatter-chart',
    // vaults
    vaultsIndex: '/vaults',
    vaultTransactions: '/vaults/:id/transactions',
    // incomes
    incomeIndex: '/incomes',
    incomeItemsIndex: '/income-items',
    // expenses
    expenseIndex: '/expenses',
    expenseItemsIndex: '/expense-items',
    // admin profile
    adminProfile: 'profile',
    adminIndex: 'admins',
    // checkout user
    checkoutIndex:'checkouts',
    // contradictions
    contradictionsIndex: 'contradictions',
    
    // user ====================================================================
    userHome: 'user',
    userLoans: 'user/loans',
    userRequestedLoans: 'user/requested-loans',
    userInstallments: 'user/installments',
};