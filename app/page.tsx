"use client";

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, Sun, Sparkles, ArrowRight } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useState, MouseEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center p-4 sm:p-8 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Subtle animated background shapes */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-gradient-to-br from-[#0055FF]/5 to-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          rotate: -360,
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-gradient-to-tr from-[#0B1641]/5 to-[#0055FF]/5 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Navbar Area */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" as const }}
        className="w-full max-w-7xl flex justify-between items-center z-10"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B1641] to-[#0055FF] rounded-full border border-[#0055FF]/30 shadow-[0_0_15px_rgba(0,85,255,0.3)] cursor-default">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white">Portal v2.0 Live</span>
        </div>
        {/* Removed theme toggle as requested */}
      </motion.div>

      <div className="w-full flex-grow flex flex-col items-center justify-center z-10 -mt-10">
        
        {/* Cinematic Logo Intro */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="relative w-32 h-32 mb-4 bg-white rounded-full shadow-[0_20px_40px_-15px_rgba(0,85,255,0.2)] p-2">
            <Image 
              src="/logo.png" 
              alt="Data & Intelligence Guild Logo" 
              fill 
              className="object-contain rounded-full"
              priority
            />
          </div>
        </motion.div>

        {/* The Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden"
        >
          {/* Dynamic Hover Gradient Border inside Card */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500"
            animate={{ opacity: isHovered ? 1 : 0 }}
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  400px circle at ${mouseX}px ${mouseY}px,
                  rgba(0, 85, 255, 0.08),
                  transparent 80%
                )
              `,
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2, delayChildren: 1 }}
            className="relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" as const, delay: 0.8 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-extrabold text-[#0B1641] mb-2 tracking-tight">
                Welcome back.
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Enter the Data & Intelligence Guild
              </p>
            </motion.div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push('/guild'); }}>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="relative group"
              >
                <input
                  id="clubId"
                  type="text"
                  required
                  className="peer w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF] transition-all text-sm text-slate-900 placeholder-transparent"
                  placeholder=" "
                />
                <label 
                  htmlFor="clubId" 
                  className="absolute left-4 -top-2.5 text-xs text-slate-400 bg-white px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#0055FF] peer-focus:bg-white peer-focus:px-1 cursor-text"
                >
                  Club ID
                </label>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.15 }}
                className="relative group"
              >
                <input
                  id="password"
                  type="password"
                  required
                  className="peer w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF] transition-all text-sm text-slate-900 placeholder-transparent"
                  placeholder=" "
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-4 -top-2.5 text-xs text-slate-400 bg-white px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#0055FF] peer-focus:bg-white peer-focus:px-1 cursor-text"
                >
                  Password
                </label>
                
                <div className="absolute right-0 -top-6">
                  <Link href="#" className="text-xs font-semibold text-slate-500 hover:text-[#0055FF] transition-colors">
                    Forgot?
                  </Link>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full group flex justify-between items-center py-3.5 px-5 rounded-xl shadow-[0_0_20px_rgba(0,85,255,0.2)] hover:shadow-[0_0_30px_rgba(0,85,255,0.4)] text-sm font-bold text-white bg-gradient-to-r from-[#0B1641] to-[#0055FF] transition-all overflow-hidden relative cursor-pointer"
              >
                <span className="relative z-10">Access Portal</span>
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="mt-8 text-center"
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>
              <p className="text-xs text-slate-500 font-medium cursor-default">
                New to the Guild?{" "}
                <Link href="#" className="font-bold text-[#0055FF] hover:text-[#0044CC] ml-1 cursor-pointer">
                  Submit an application
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 2 }}
        className="mt-auto pb-4 text-center text-xs text-slate-400 font-medium z-10"
      >
        &copy; {new Date().getFullYear()} Data & Intelligence Guild
      </motion.div>
    </div>
  );
}
