export type Language = 'en' | 'pt';

export const translations = {
  en: {
    // Navigation
    'nav.pos': 'POS',
    'nav.receipts': 'Receipts',
    'nav.catalog': 'Catalog',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.webhooks': 'Webhooks',

    // Landing
    'landing.title': 'Merchant AI Checkout',
    'landing.subtitle': 'Accept crypto on Solana with optional PIX settlement',
    'landing.openPos': 'Open POS',
    'landing.demo': 'Demo Mode',
    'landing.feature1': 'Accept crypto',
    'landing.feature2': 'PIX settlement (optional)',
    'landing.feature3': 'Receipts & CSV',

    // POS
    'pos.title': 'Point of Sale',
    'pos.enterAmount': 'Enter amount and generate QR to receive',
    'pos.generateQr': 'Generate QR',
    'pos.amount': 'Amount',
    'pos.pending': 'Awaiting payment...',
    'pos.confirmed': 'Payment confirmed on-chain',
    'pos.expired': 'Payment expired',
    'pos.error': 'Payment error',
    'pos.cancel': 'Cancel',
    'pos.copyLink': 'Copy link',
    'pos.share': 'Share',
    'pos.fullscreen': 'Full screen',
    'pos.brightness': 'Increase brightness',
    'pos.viewReceipt': 'View receipt',
    'pos.newCharge': 'New charge',
    'pos.ref': 'Ref',
    'pos.devConfirm': 'Dev: Confirm',
    'pos.devSettle': 'Dev: Settle',

    // Receipts
    'receipts.title': 'Receipts',
    'receipts.filter.today': 'Today',
    'receipts.filter.7d': '7 days',
    'receipts.filter.30d': '30 days',
    'receipts.filter.all': 'All',
    'receipts.filter.confirmed': 'Confirmed',
    'receipts.filter.settled': 'Settled',
    'receipts.filter.pending': 'Pending',
    'receipts.exportCsv': 'Export CSV',
    'receipts.empty': 'No receipts yet — generate your first charge on POS',
    'receipts.detail.title': 'Receipt Detail',
    'receipts.detail.merchant': 'Merchant',
    'receipts.detail.amount': 'Amount',
    'receipts.detail.date': 'Date',
    'receipts.detail.ref': 'Reference',
    'receipts.detail.txHash': 'Transaction Hash',
    'receipts.detail.share': 'Share',
    'receipts.detail.print': 'Print',
    'receipts.detail.downloadPdf': 'Download Official PDF (PIX)',
    'receipts.detail.pdfDisabled': 'Available when settlement is enabled',
    'receipts.detail.pixLike': 'This is a PIX-like receipt: on-chain proof of payment.',

    // Catalog
    'catalog.title': 'Catalog',
    'catalog.addProduct': 'Add product',
    'catalog.quickCharge': 'Quick charge',
    'catalog.edit': 'Edit',
    'catalog.delete': 'Delete',
    'catalog.empty': 'No products yet — add your first item',

    // Reports
    'reports.title': 'Reports',
    'reports.total': 'Total',
    'reports.transactions': 'Transactions',
    'reports.avgTicket': 'Avg ticket',
    'reports.settled': '% Settled',
    'reports.daily': 'Daily amounts',
    'reports.count': 'Transaction count',

    // Settings
    'settings.title': 'Settings',
    'settings.store': 'Store',
    'settings.staff': 'Staff',
    'settings.payments': 'Payments',
    'settings.flags': 'Feature Flags',
    'settings.language': 'Language & Theme',
    'settings.storeName': 'Store name',
    'settings.category': 'Category',
    'settings.logo': 'Logo',
    'settings.addStaff': 'Add staff',
    'settings.wallet': 'Receiving wallet',
    'settings.pixLike': 'PIX-like only',
    'settings.pixSettlement': 'PIX settlement enabled (coming soon)',
    'settings.payWithBinance': 'Pay with Binance',
    'settings.useSmartContract': 'Use smart contract',

    // Help
    'help.title': 'Help & About',
    'help.faq': 'FAQ',

    // Common
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.status': 'Status',
    'common.loading': 'Loading...',
  },
  pt: {
    // Navigation
    'nav.pos': 'PDV',
    'nav.receipts': 'Recibos',
    'nav.catalog': 'Catálogo',
    'nav.reports': 'Relatórios',
    'nav.settings': 'Configurações',
    'nav.help': 'Ajuda',
    'nav.webhooks': 'Webhooks',

    // Landing
    'landing.title': 'Checkout Merchant AI',
    'landing.subtitle': 'Aceite crypto em Solana com liquidação PIX opcional',
    'landing.openPos': 'Abrir PDV',
    'landing.demo': 'Modo Demo',
    'landing.feature1': 'Aceite crypto',
    'landing.feature2': 'Liquidação PIX (opcional)',
    'landing.feature3': 'Recibos & CSV',

    // POS
    'pos.title': 'Ponto de Venda',
    'pos.enterAmount': 'Digite o valor e gere o QR para receber',
    'pos.generateQr': 'Gerar QR',
    'pos.amount': 'Valor',
    'pos.pending': 'Aguardando pagamento...',
    'pos.confirmed': 'Pagamento confirmado on-chain',
    'pos.expired': 'Pagamento expirado',
    'pos.error': 'Erro no pagamento',
    'pos.cancel': 'Cancelar',
    'pos.copyLink': 'Copiar link',
    'pos.share': 'Compartilhar',
    'pos.fullscreen': 'Tela cheia',
    'pos.brightness': 'Aumentar brilho',
    'pos.viewReceipt': 'Ver recibo',
    'pos.newCharge': 'Nova cobrança',
    'pos.ref': 'Ref',
    'pos.devConfirm': 'Dev: Confirmar',
    'pos.devSettle': 'Dev: Liquidar',

    // Receipts
    'receipts.title': 'Recibos',
    'receipts.filter.today': 'Hoje',
    'receipts.filter.7d': '7 dias',
    'receipts.filter.30d': '30 dias',
    'receipts.filter.all': 'Todos',
    'receipts.filter.confirmed': 'Confirmados',
    'receipts.filter.settled': 'Liquidados',
    'receipts.filter.pending': 'Pendentes',
    'receipts.exportCsv': 'Exportar CSV',
    'receipts.empty': 'Nenhum recibo ainda — gere sua primeira cobrança no PDV',
    'receipts.detail.title': 'Detalhes do Recibo',
    'receipts.detail.merchant': 'Loja',
    'receipts.detail.amount': 'Valor',
    'receipts.detail.date': 'Data',
    'receipts.detail.ref': 'Referência',
    'receipts.detail.txHash': 'Hash da Transação',
    'receipts.detail.share': 'Compartilhar',
    'receipts.detail.print': 'Imprimir',
    'receipts.detail.downloadPdf': 'Baixar PDF Oficial (PIX)',
    'receipts.detail.pdfDisabled': 'Disponível quando a liquidação estiver habilitada',
    'receipts.detail.pixLike': 'Este é um comprovante PIX-like (prova on-chain).',

    // Catalog
    'catalog.title': 'Catálogo',
    'catalog.addProduct': 'Adicionar produto',
    'catalog.quickCharge': 'Cobrança rápida',
    'catalog.edit': 'Editar',
    'catalog.delete': 'Excluir',
    'catalog.empty': 'Nenhum produto ainda — adicione seu primeiro item',

    // Reports
    'reports.title': 'Relatórios',
    'reports.total': 'Total',
    'reports.transactions': 'Transações',
    'reports.avgTicket': 'Ticket médio',
    'reports.settled': '% Liquidado',
    'reports.daily': 'Valores diários',
    'reports.count': 'Contagem de transações',

    // Settings
    'settings.title': 'Configurações',
    'settings.store': 'Loja',
    'settings.staff': 'Equipe',
    'settings.payments': 'Pagamentos',
    'settings.flags': 'Opções de Recursos',
    'settings.language': 'Idioma e Tema',
    'settings.storeName': 'Nome da loja',
    'settings.category': 'Categoria',
    'settings.logo': 'Logo',
    'settings.addStaff': 'Adicionar membro',
    'settings.wallet': 'Carteira de recebimento',
    'settings.pixLike': 'Somente PIX-like',
    'settings.pixSettlement': 'Liquidação PIX habilitada (em breve)',
    'settings.payWithBinance': 'Pagar com Binance',
    'settings.useSmartContract': 'Usar contrato inteligente',

    // Help
    'help.title': 'Ajuda e Sobre',
    'help.faq': 'Perguntas Frequentes',

    // Common
    'common.back': 'Voltar',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Fechar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.search': 'Buscar',
    'common.status': 'Status',
    'common.loading': 'Carregando...',
  },
};

export const useTranslation = () => {
  const lang = (localStorage.getItem('language') as Language) || 'en';
  
  const t = (key: keyof typeof translations.en): string => {
    return translations[lang][key] || key;
  };

  const setLanguage = (language: Language) => {
    localStorage.setItem('language', language);
    window.location.reload();
  };

  return { t, lang, setLanguage };
};
