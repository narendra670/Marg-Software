import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiFileText, FiDollarSign, FiPackage, FiUsers, FiArrowRight,
  FiTrendingUp, FiPlus, FiBarChart2, FiClock, FiChevronRight,
} from 'react-icons/fi';
import { getDashboardStats } from '../services/invoiceApi';
import { getProducts } from '../services/productApi';
import { getCustomers } from '../services/customerApi';
import { formatCurrency, formatDate } from '../utils/helpers';

const statCardTheme = [
  {
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-200',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-purple-200',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    border: 'border-violet-100',
  },
  {
    gradient: 'from-orange-500 to-rose-600',
    shadow: 'shadow-orange-200',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    border: 'border-orange-100',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', 1, 100],
    queryFn: () => getProducts(1, 100),
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers', 1, 100],
    queryFn: () => getCustomers(1, 100),
  });

  const totalProducts = productsData?.total || 0;
  const totalCustomers = customersData?.total || 0;

  const cards = [
    { label: 'Total Sales', value: formatCurrency(stats?.totalSales || 0), icon: FiDollarSign, link: '/sales' },
    { label: 'Total Invoices', value: stats?.totalInvoices || 0, icon: FiFileText, link: '/sales' },
    { label: 'Total Products', value: totalProducts, icon: FiPackage, link: '/invoices/create' },
    { label: 'Total Customers', value: totalCustomers, icon: FiUsers, link: '/customers' },
  ];

  const quickActions = [
    { label: 'New Invoice', icon: FiPlus, link: '/invoices/create', color: 'text-primary-600 bg-primary-50 hover:bg-primary-100' },
    { label: 'View Sales', icon: FiBarChart2, link: '/sales', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { label: 'New Product', icon: FiPackage, link: '/invoices/create', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { label: 'Customers', icon: FiUsers, link: '/customers', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
  ];

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <FiTrendingUp className="text-xl" />
            </div>
            <span className="text-sm font-medium text-white/80">{greeting}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-white/70 max-w-xl">
            Here's what's happening with your business today. Manage invoices, track sales, and stay on top of your inventory.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const theme = statCardTheme[i];
          return (
            <Link
              key={card.label}
              to={card.link}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1.5">{card.value}</p>
                </div>
                <div className={`${theme.iconBg} p-3 rounded-xl transition-colors group-hover:scale-110 duration-300`}>
                  <Icon className={`${theme.iconColor} text-xl`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                View details <FiChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock size={18} className="text-primary-600" />
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.link}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all ${action.color}`}
                  >
                    <Icon size={18} />
                    <span>{action.label}</span>
                    <FiChevronRight size={16} className="ml-auto opacity-60" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiFileText size={18} className="text-primary-600" />
                Recent Invoices
              </h2>
              <Link
                to="/sales"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            {statsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Invoice</th>
                      <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-right py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-right py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentInvoices?.map((inv, idx) => (
                      <tr
                        key={inv._id}
                        className={`border-b border-gray-50 transition-colors hover:bg-gray-50/80 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                        }`}
                      >
                        <td className="py-3">
                          <span className="font-medium text-gray-900">{inv.invoiceNo}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-gray-600">{inv.customerDetails.name}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-semibold text-gray-900">{formatCurrency(inv.grandTotal)}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {formatDate(inv.date)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!stats?.recentInvoices || stats.recentInvoices.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          <FiFileText size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-medium">No invoices yet</p>
                          <p className="text-xs mt-1">Create your first invoice to get started</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
