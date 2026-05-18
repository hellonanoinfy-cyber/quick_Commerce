'use client';

import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  CreditCard,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { useOrder } from '@/hooks/useOrders';
import useAuthStore from '@/stores/auth-store';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const connectionRef = useRef(null);

  const { data: order, isLoading, isError } = useOrder(orderId);

  // SignalR Real-time Updates
  useEffect(() => {
    if (!token || !orderId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/notifications?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on('OrderUpdate', data => {
      // Invalidate query if this is the order being updated
      if (data.OrderId === orderId || data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      }
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR: Connected to order updates');
        connectionRef.current = connection;
      } catch (err) {
        console.error('SignalR Connection Error: ', err);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [orderId, token]); // FIX BUG-009: Removed queryClient from deps to prevent infinite reconnection

  const getStatusConfig = status => {
    switch (status) {
      case 0:
        return {
          label: 'Pending',
          icon: <Clock size={16} />,
          color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          step: 1,
        };
      case 1:
        return {
          label: 'Confirmed',
          icon: <CheckCircle2 size={16} />,
          color: 'bg-blue-50 text-blue-600 border-blue-100',
          step: 2,
        };
      case 2:
        return {
          label: 'Processing',
          icon: <AlertCircle size={16} />,
          color: 'bg-orange-50 text-orange-600 border-orange-100',
          step: 3,
        };
      case 3:
        return {
          label: 'Shipped',
          icon: <Truck size={16} />,
          color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          step: 4,
        };
      case 4:
        return {
          label: 'Delivered',
          icon: <CheckCircle2 size={16} />,
          color: 'bg-green-50 text-green-600 border-green-100',
          step: 5,
        };
      case 5:
        return {
          label: 'Cancelled',
          icon: <XCircle size={16} />,
          color: 'bg-red-50 text-red-600 border-red-100',
          step: 0,
        };
      default:
        return {
          label: 'Unknown',
          icon: <AlertCircle size={16} />,
          color: 'bg-gray-50 text-gray-400 border-gray-100',
          step: 0,
        };
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 animate-pulse">
        <div className="w-full max-w-4xl h-[600px] bg-gray-50 rounded-[3rem]" />
      </div>
    );
  if (isError || !order)
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const status = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/account/orders')}
            className="rounded-full gap-2 font-bold text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> Back to Orders
          </Button>
          <Button variant="outline" className="rounded-full gap-2 font-bold border-gray-200">
            <Printer size={16} /> Download Invoice
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Status Card */}
          <Card className="p-8 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {order.orderNumber}
                  </h1>
                  <Badge
                    className={`${status.color} px-4 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-widest`}
                  >
                    {status.icon} {status.label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-400">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Total Amount
                </p>
                <p className="text-4xl font-black text-[var(--brand-primary)]">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>

            {/* Tracking Stepper */}
            <div className="mt-12 relative flex justify-between">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status.step >= s ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-pink-100' : 'bg-gray-100 text-gray-300'}`}
                  >
                    {status.step >= s ? <CheckCircle2 size={16} /> : s}
                  </div>
                </div>
              ))}
              <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-100 -z-0" />
              <div
                className="absolute top-4 left-0 h-[2px] bg-[var(--brand-primary)] transition-all duration-500 -z-0"
                style={{ width: `${Math.max(0, (status.step - 1) * 25)}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 px-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Placed</span>
              <span>Confirmed</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white h-full">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 tracking-tight">
                <div className="w-8 h-8 bg-[var(--brand-light)] rounded-xl flex items-center justify-center text-[var(--brand-primary)]">
                  <MapPin size={16} />
                </div>
                Delivery Address
              </h3>
              <div className="space-y-2">
                <p className="font-black text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {order.shippingAddress.addressLine1},<br />
                  {order.shippingAddress.addressLine2 && (
                    <>
                      {order.shippingAddress.addressLine2},<br />
                    </>
                  )}
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <div className="pt-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="text-gray-400 font-medium">Phone:</span>{' '}
                  {order.shippingAddress.phone}
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white h-full">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 tracking-tight">
                <div className="w-8 h-8 bg-[var(--brand-light)] rounded-xl flex items-center justify-center text-[var(--brand-primary)]">
                  <CreditCard size={16} />
                </div>
                Payment Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Method</span>
                  <span className="text-gray-900 font-black uppercase tracking-widest">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Status</span>
                  <Badge className="bg-green-50 text-green-600 border-none font-bold uppercase text-[9px] tracking-widest">
                    SUCCESS
                  </Badge>
                </div>
                <Separator className="bg-gray-50" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Items Total</span>
                    <span className="font-bold">₹{order.subTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Delivery</span>
                    <span className="text-green-600 font-bold">
                      {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-2 border-t border-dashed border-gray-100">
                    <span>Paid Amount</span>
                    <span className="text-[var(--brand-primary)]">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3 tracking-tight">
              <div className="w-8 h-8 bg-[var(--brand-light)] rounded-xl flex items-center justify-center text-[var(--brand-primary)]">
                <ShoppingBag size={16} />
              </div>
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 border border-gray-50 flex-shrink-0 group-hover:shadow-md transition-all">
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      ₹{item.unitPrice} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">
                      ₹{item.unitPrice * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3 tracking-tight">
              Status Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm ${i === 0 ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-light)]' : 'bg-white border-2 border-gray-100 text-gray-300'}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-300'}`}
                    />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-black uppercase tracking-widest ${i === 0 ? 'text-[var(--brand-primary)]' : 'text-gray-900'}`}
                    >
                      {getStatusConfig(h.status).label}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{h.note}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold">
                      {new Date(h.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
