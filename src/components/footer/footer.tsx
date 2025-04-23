'use client';

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function Footer() {
  return (
    
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Company Info */}
        <div>
          <h4 className="text-xl font-semibold mb-4">RetailSoft</h4>
          <p className="text-sm text-gray-300">
            Smart software for modern retailers. Manage sales, inventory, and customers with ease.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="text-lg font-medium mb-3">Quick Links</h5>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/">Home</a></li>
            <li><a href="/features">Features</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Product Links */}
        <div>
          <h5 className="text-lg font-medium mb-3">Product</h5>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/modules/pos">POS System</a></li>
            <li><a href="/modules/inventory">Inventory</a></li>
            <li><a href="/modules/analytics">Analytics</a></li>
            <li><a href="/modules/crm">CRM</a></li>
          </ul>
        </div>

        {/* Newsletter & Contact */}
        <div>
          <h5 className="text-lg font-medium mb-3">Stay Updated</h5>
          <form className="flex flex-col gap-3">
            <Input placeholder="Your email address" type="email" className="bg-gray-800 border-gray-700 text-white" />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2"><Mail size={16} /> support@retailsoft.com</p>
            <p className="flex items-center gap-2"><Phone size={16} /> +1 (800) 123-4567</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> New York, NY</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>© 2025 RetailSoft. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#"><Facebook size={18} /></a>
          <a href="#"><Twitter size={18} /></a>
          <a href="#"><Linkedin size={18} /></a>
        </div>
      </div>
    </footer>
  );
}
