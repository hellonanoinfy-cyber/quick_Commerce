'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import axios from '@/lib/api/client';

const STATUS_TABS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/v1/orders');
        setOrders(data.items);
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusConfig = status => {
    switch (status) {
      case 0:
        return {
          label: 'Pending',
          icon: <Clock size={14} />,
          color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        };
      case 1:
        return {
          label: 'Confirmed',
          icon: <CheckCircle2 size={14} />,
          color: 'bg-blue-50 text-blue-600 border-blue-100',
        };
      case 3:
        return {
          label: 'Shipped',
          icon: <Truck size={14} />,
          color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
      case 4:
        return {
          label: 'Delivered',
          icon: <CheckCircle2 size={14} />,
          color: 'bg-green-50 text-green-600 border-green-100',
        };
      case 5:
        return {
          label: 'Cancelled',
          icon: <XCircle size={14} />,
          color: 'bg-red-50 text-red-600 border-red-100',
        };
      default:
        return {
          label: 'Processing',
          icon: <AlertCircle size={14} />,
          color: 'bg-gray-50 text-gray-600 border-gray-100',
        };
    }
  };

  const filteredOrders =
    activeTab === 'All'
      ? orders
      : orders.filter(o => getStatusConfig(o.status).label === activeTab);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage and track all your purchases</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-violet-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => {
                  const status = getStatusConfig(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        onClick={() => router.push(`/account/orders/${order.id}`)}
                        className="p-6 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem] bg-white cursor-pointer group"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}
                            >
                              <Package size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Order ID
                              </p>
                              <h3 className="font-black text-gray-900">{order.orderNumber}</h3>
                            </div>
                          </div>
                          <Badge
                            className={`${status.color} px-4 py-1.5 rounded-full border flex items-center gap-2 font-bold shadow-sm`}
                          >
                            {status.icon} {status.label.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between py-4 border-y border-dashed border-gray-100">
                          <div className="flex -space-x-4">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="w-14 h-14 rounded-2xl border-4 border-white bg-gray-50 p-2 overflow-hidden shadow-sm"
                              >
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-14 h-14 rounded-2xl border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Total Amount
                            </p>
                            <p className="text-xl font-black text-[var(--brand-primary)]">
                              ₹{order.totalAmount}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <p className="text-xs font-medium text-gray-400">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <Button
                            variant="ghost"
                            className="rounded-full text-[var(--brand-primary)] font-bold group-hover:bg-[var(--brand-light)]"
                          >
                            View Details{' '}
                            <ChevronRight
                              size={16}
                              className="ml-1 group-hover:translate-x-1 transition-transform"
                            />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">No orders found</h2>
                  <p className="text-gray-500 mt-2">Try changing the filter or start shopping!</p>
                  <Button
                    onClick={() => router.push('/')}
                    className="mt-8 rounded-full px-8 bg-[var(--brand-primary)]"
                  >
                    Shop Now
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
