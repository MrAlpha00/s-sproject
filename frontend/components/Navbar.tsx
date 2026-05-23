"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Languages } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Showcase", href: "#showcase" },
    { name: "Voice Lab", href: "#voicelab" },
    { name: "Use Cases", href: "#usecases" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-md border-b border-white/[0.06] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-electric-blue to-accent-purple p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <Languages className="w-4 h-4 text-electric-blue group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue to-accent-purple rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center">
              Aether
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-accent-purple font-extrabold">
                VOX
              </span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-electric-blue transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* CTA & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#pricing"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <Button
              asChild
              className="relative overflow-hidden bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all duration-300 px-5 group"
            >
              <a href="#cta">
                <span>Book Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden pt-24 px-6 bg-black/95 backdrop-blur-xl border-b border-white/[0.05]"
          >
            <nav className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-zinc-400 hover:text-white transition-colors py-2 border-b border-zinc-900"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-6">
                <a
                  href="#pricing"
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-zinc-400 hover:text-white py-2"
                >
                  Sign In
                </a>
                <Button
                  asChild
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-gradient-to-r from-electric-blue to-accent-purple text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2"
                >
                  <a href="#cta">
                    Book Demo
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
