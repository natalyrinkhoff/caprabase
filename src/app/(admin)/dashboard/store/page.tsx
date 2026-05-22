// src/app/(admin)/dashboard/store/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  Plus, 
  DollarSign, 
  Layers, 
  CheckCircle, 
  Clock, 
  Tag
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface Order {
  id: string;
  customer: string;
  item: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Fulfilled';
}

export default function StoreDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  // Streamlined Seed Data (Strictly high-velocity physical goods with direct checkout)
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Raw Goat Milk (1 Gal)', category: 'Dairy Shares', price: 12.00, stock: 14, status: 'In Stock' },
    { id: '2', name: 'Aged Gouda Wheel', category: 'Creamery Artisanal', price: 45.00, stock: 3, status: 'Low Stock' },
    { id: '3', name: 'Artisanal Honey Soap', category: 'Apothecary Skincare', price: 7.50, stock: 42, status: 'In Stock' },
    { id: '4', name: 'Goat Milk Caramel Sauce (Cajeta)', category: 'Value-Add Pantry', price: 14.00, stock: 18, status: 'In Stock' },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-9082', customer: 'Sarah Jenkins', item: 'Raw Goat Milk (1 Gal) x2', amount: 24.00, date: 'Today, 09:15 AM', status: 'Pending' },
    { id: 'ORD-8941', customer: 'Marcus Vance', item: 'Aged Gouda Wheel x1', amount: 45.00, date: 'Yesterday', status: 'Fulfilled' },
    { id: 'ORD-8812', customer: 'Elena Rostova', item: 'Artisanal Honey Soap x5', amount: 37.50, date: 'May 20, 2026', status: 'Fulfilled' },
  ]);

  const totalSales = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  function toggleOrderStatus(id: string) {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const nextStatus = order.status === 'Pending' ? 'Fulfilled' : 'Pending';
        return { ...order, status: nextStatus };
      }
      return order;
    }));
  }

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Farm Storefront</h1>
          <p className="text-stone-500 text-sm">Manage dynamic product catalogs, inventory velocity, and point-of-sale client fulfillment logs.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 shadow-sm transition-colors self-start sm:self-center">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* METRIC CARD MATRICES */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Gross Ledger Volume</p>
            <p className="text-xl font-bold text-stone-900">${totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-800">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Total Items Logged</p>
            <p className="text-xl font-bold text-stone-900">{totalStockItems} units</p>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-800">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Awaiting Dispatch</p>
            <p className="text-xl font-bold text-stone-900">{pendingOrdersCount} open invoices</p>
          </div>
        </div>
      </div>

      {/* VIEW CONTROLLER TABS */}
      <div className="border-b border-stone-200">
        <div className="flex gap-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'inventory' 
                ? 'border-emerald-800 text-emerald-900 font-semibold' 
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Package className="h-4 w-4" /> Commercial Catalog ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orders' 
                ? 'border-emerald-800 text-emerald-900 font-semibold' 
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Order Fulfillment ({orders.length})
          </button>
        </div>
      </div>

      {/* DYNAMIC VIEWS CONDITIONAL */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        
        {activeTab === 'inventory' ? (
          /* INVENTORY DATAGRID */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Unit Value</th>
                  <th className="p-4">Available Inventory</th>
                  <th className="p-4">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900">{product.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium">${product.price.toFixed(2)}</td>
                    <td className="p-4 font-mono">{product.stock}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                        product.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ORDERS STREAM PIPELINE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                  <th className="p-4">Order Reference</th>
                  <th className="p-4">Customer Account</th>
                  <th className="p-4">Line Item Breakdown</th>
                  <th className="p-4">Captured Value</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-stone-900">{order.id}</td>
                    <td className="p-4 font-medium text-stone-800">{order.customer}</td>
                    <td className="p-4 text-stone-500 truncate max-w-xs">{order.item}</td>
                    <td className="p-4 font-semibold text-stone-900">${order.amount.toFixed(2)}</td>
                    <td className="p-4 text-xs text-stone-400">{order.date}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleOrderStatus(order.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm border transition-colors ${
                          order.status === 'Fulfilled'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <CheckCircle className={`h-3.5 w-3.5 ${order.status === 'Fulfilled' ? 'text-emerald-600' : 'text-stone-400'}`} />
                        {order.status === 'Fulfilled' ? 'Dispatched' : 'Mark Packaged'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}