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
    // teachers
    teacherIndex: '/teachers',
    teacherCreate: '/teachers/create',
    teacherEdit: '/teachers/:id/edit',
    // student comments
    studentCommentIndex: '/student-comments',
    studentCommentCreate: '/student-comments/create',
    studentCommentEdit: '/student-comments/:id/edit',
    // categories
    categoryIndex: '/categories',
    categoryCreate: '/categories/create',
    categoryEdit: '/categories/:id/edit',
    // courses + units
    courseIndex: '/courses',
    courseCreate: '/courses/create',
    courseEdit: '/courses/:id/edit',
    courseUnitsIndex: '/courses/:id/units',
    courseUnitCreate: '/courses/:id/units/create',
    courseUnitEdit: '/courses/:id/units/:unitId/edit',
    // plans
    planIndex: '/plans',
    planCreate: '/plans/create',
    planEdit: '/plans/:id/edit',
    // sections
    sectionIndex: '/sections',
    sectionCreate: '/sections/create',
    sectionEdit: '/sections/:id/edit',
    // sliders
    sliderIndex: '/sliders',
    sliderCreate: '/sliders/create',
    sliderEdit: '/sliders/:id/edit',
    // gateways
    gatewayIndex: '/gateways',
    gatewayCreate: '/gateways/create',
    gatewayEdit: '/gateways/:id/edit',
    // areas
    provinceIndex: '/provinces',
    provinceCreate: '/provinces/create',
    provinceEdit: '/provinces/:id/edit',
    cityIndex: '/cities',
    cityCreate: '/cities/create',
    cityEdit: '/cities/:id/edit',
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