"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/context/toast-context";
import {
  Store,
  Printer,
  Barcode,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Save,
  Laptop,
  Receipt,
  Layers,
  Settings2,
  Info,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function StoreSettingsView() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "hardware" | "policy" | "architecture">("general");

  const [settings, setSettings] = useState({
    storeName: "Surge Retail Flagship",
    storeCode: "SR-MAIN-001",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (IST +5:30)",
    gstin: "27AABCS1429B1Z0",
    legalName: "Surge Retail Healthcare Private Limited",
    phone: "+91 98765 43210",
    email: "billing@surgeretail.com",
    address: "Plot 42, Medical Equipment Zone, Central Avenue, Mumbai, MH",
    receiptHeader: "SURGE RETAIL APPARATUS & HEALTHCARE",
    receiptFooter: "Goods once sold can only be returned within 7 days against original receipt. Thank you!",
    // Hardware
    printerInterface: "NETWORK_LAN",
    printerIp: "192.168.1.150:9100",
    paperWidth: "80mm",
    autoCut: true,
    cashDrawerKick: true,
    scannerMode: "KEYBOARD_WEDGE",
    scannerSuffix: "ENTER",
    // Policy
    allowNegativeStock: false,
    requireCustomerPhone: false,
    enforceBlindCount: true,
    roundToNearestRupee: true,
    defaultTaxRate: "18%",
  });

  useEffect(() => {
    const saved = localStorage.getItem("surge_retail_store_settings");
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("surge_retail_store_settings", JSON.stringify(settings));
    showToast("Store settings and hardware preferences saved successfully!", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              Store Profile & POS Configuration
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Terminal
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Configure store legal details, thermal receipt printers, ESC/POS hardware, and retail policy settings.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Store Identity & Bill Header</span>
        </button>

        <button
          onClick={() => setActiveTab("hardware")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "hardware"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>POS Hardware (Printers & Scanners)</span>
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "policy"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Retail Operational Policies</span>
        </button>

        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "architecture"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Industry Standards Guide</span>
        </button>
      </div>

      {/* Tab 1: General Store Identity */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
              <Store className="w-4 h-4 text-blue-500" />
              <span>Store Profile & Tax Identity</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Store / Outlet Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-neutral-400 mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={settings.storeCode}
                    onChange={(e) => setSettings({ ...settings, storeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-neutral-400 mb-1">Currency</label>
                  <input
                    type="text"
                    value={settings.currency}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800/60 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">GSTIN (India GST Registration)</label>
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Legal Company Name</label>
                <input
                  type="text"
                  value={settings.legalName}
                  onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Store Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Receipt Header & Footer Notes</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Receipt Top Header Banner</label>
                <input
                  type="text"
                  value={settings.receiptHeader}
                  onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Printed in bold center alignment at top of thermal POS slip.</span>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Receipt Return Policy & Footer</label>
                <textarea
                  rows={4}
                  value={settings.receiptFooter}
                  onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700/60 font-mono text-[11px] text-slate-600 dark:text-neutral-400 space-y-1">
                <div className="font-bold text-center border-b border-dashed pb-1">{settings.receiptHeader}</div>
                <div className="text-center text-[10px]">{settings.address}</div>
                <div className="text-center text-[10px]">GSTIN: {settings.gstin}</div>
                <div className="border-t border-dashed pt-1 text-[10px] text-center">{settings.receiptFooter}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: POS Hardware */}
      {activeTab === "hardware" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
              <Printer className="w-4 h-4 text-blue-500" />
              <span>Thermal Receipt Printer (ESC/POS)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Printer Connection Type</label>
                <select
                  value={settings.printerInterface}
                  onChange={(e) => setSettings({ ...settings, printerInterface: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                >
                  <option value="NETWORK_LAN">Ethernet / LAN IP (Raw Socket Port 9100)</option>
                  <option value="USB_BROWSER">Direct USB WebHID (Browser Native)</option>
                  <option value="SYSTEM_PRINT">OS System Print Dialog (Window.print)</option>
                  <option value="BLUETOOTH">Bluetooth Wireless (Mobile POS)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">LAN IP / Hostname</label>
                <input
                  type="text"
                  value={settings.printerIp}
                  onChange={(e) => setSettings({ ...settings, printerIp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-neutral-400 mb-1">Paper Roll Width</label>
                  <select
                    value={settings.paperWidth}
                    onChange={(e) => setSettings({ ...settings, paperWidth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                  >
                    <option value="80mm">80mm (Standard POS Counter)</option>
                    <option value="58mm">58mm (Mobile / Handheld POS)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoCut}
                      onChange={(e) => setSettings({ ...settings, autoCut: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-xs font-medium">Auto Paper Cut</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cashDrawerKick}
                  onChange={(e) => setSettings({ ...settings, cashDrawerKick: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <div>
                  <span className="text-xs font-medium block">Kick Cash Drawer on Cash Settle</span>
                  <span className="text-[10px] text-slate-400">Sends RJ11 pulse byte sequence 27,112,0,50,250</span>
                </div>
              </label>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
              <Barcode className="w-4 h-4 text-emerald-500" />
              <span>Barcode / QR Scanner Configuration</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Scanner Interface Mode</label>
                <select
                  value={settings.scannerMode}
                  onChange={(e) => setSettings({ ...settings, scannerMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800"
                >
                  <option value="KEYBOARD_WEDGE">USB HID Keyboard Wedge (Plug & Play - Standard)</option>
                  <option value="SERIAL_COM">Serial Port (COM / USB-to-RS232)</option>
                  <option value="CAMERA_QR">Camera Barcode Scanner (WebRTC)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Scanner Terminator / Suffix</label>
                <select
                  value={settings.scannerSuffix}
                  onChange={(e) => setSettings({ ...settings, scannerSuffix: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 font-mono"
                >
                  <option value="ENTER">Enter (CR/LF - Auto-selects item immediately)</option>
                  <option value="TAB">Tab</option>
                  <option value="NONE">None (Manual button click)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Hardware Testing Status
                </span>
                <p className="text-[10px] leading-relaxed">
                  The POS Billing screen auto-focuses the SKU barcode input on keypress, enabling rapid cashier scanning without touching the mouse.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Retail Policies */}
      {activeTab === "policy" && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Retail Operational Policies & Inventory Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowNegativeStock}
                onChange={(e) => setSettings({ ...settings, allowNegativeStock: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-blue-600"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-neutral-100 block">Allow Negative Stock Billing</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  When enabled, cashiers can sell items even if stock count is zero or negative. Standard for busy retail counters waiting for supplier delivery.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireCustomerPhone}
                onChange={(e) => setSettings({ ...settings, requireCustomerPhone: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-blue-600"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-neutral-100 block">Mandate Customer Mobile Number</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Prevents generating invoices without capturing customer mobile for loyalty CRM and WhatsApp bill receipt delivery.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforceBlindCount}
                onChange={(e) => setSettings({ ...settings, enforceBlindCount: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-blue-600"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-neutral-100 block">Blind Cash Count at Day End (Anti-Theft)</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Cashiers must count physical currency in drawer without seeing system expected total, preventing pocketing drawer discrepancies.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.roundToNearestRupee}
                onChange={(e) => setSettings({ ...settings, roundToNearestRupee: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-blue-600"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-neutral-100 block">Round Total to Nearest ₹1.00</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Automatically rounds decimal paisa (e.g. ₹199.65 becomes ₹200.00) for rapid cash change handover.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Industry Standards Guide */}
      {activeTab === "architecture" && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-neutral-100">
              World-Class Retail Standards Benchmark (Square, Lightspeed, Shopify POS)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-500" />
                <span>ESC/POS & Hardware Spooling</span>
              </h3>
              <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
                Tier-1 retail POS solutions implement direct thermal receipt printing over LAN raw sockets (port 9100) or WebUSB/WebSerial to eliminate OS print dialog delays, completing prints in under 300 milliseconds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Tax Compliance (GST Section 31)</span>
              </h3>
              <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
                Requires itemized HSN codes, split CGST/SGST for intra-state, and IGST for inter-state sales. System automatically calculates round-offs and supports QR e-invoicing for enterprise turnover.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Day-End Reconciliations (Z-Out)</span>
              </h3>
              <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
                Registers lock with an end-of-day sequence generating a Z-Report, resetting transaction serials and auditing tender discrepancies across cash, card, and UPI payment gateways.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
