"use client";

import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyView({ data }: { data: any }) {
  const easeOutQuart: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const easeOutCirc: [number, number, number, number] = [0.16, 1, 0.3, 1];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOutQuart }}
          className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center flex flex-col items-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-[#0B1641] mb-2">Invalid Certificate</h1>
          <p className="text-slate-500 mb-6">The certificate ID you scanned does not exist in our system or has been revoked.</p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutCirc } }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Navbar / Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOutCirc }}
        className="w-full border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between bg-white sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="DIG Logo" width={40} height={40} className="object-contain" />
          <span className="font-extrabold text-[#0B1641] tracking-tight text-xl hidden sm:block">Data & Intelligence Guild</span>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-12 overflow-hidden">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col xl:flex-row gap-12 xl:gap-20"
        >
          
          {/* Left Column: Information */}
          <div className="w-full xl:w-[35%] max-w-2xl flex flex-col">
            
            {/* User Profile Badge */}
            <motion.div variants={itemVariants} className="flex items-start gap-6 mb-10 bg-[#f4f6f9] p-8 rounded-xl border border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 flex-shrink-0">
                <CheckCircle className="w-10 h-10 text-[#0055FF]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1641] mb-2 leading-tight">
                  This Certificate of {data.type} is awarded to <br/>
                  <span className="text-[#0055FF]">{data.first_name} {data.middle_name ? `${data.middle_name} ` : ''}{data.family_name}</span>
                </h1>
                <p className="text-slate-600 font-medium mb-1">
                  {data.month} {data.day}, {data.year}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mt-4">
                  <strong className="text-slate-700">{data.first_name}&apos;s</strong> certificate is officially verified and recognized by the Data & Intelligence Guild.
                </p>
              </div>
            </motion.div>

            {/* Certificate Details */}
            <motion.div variants={itemVariants} className="mb-10">
              <h2 className="text-2xl font-bold text-[#0B1641] mb-2">{data.type}</h2>
              <p className="text-slate-600 text-sm">Issued by Data & Intelligence Guild</p>
            </motion.div>

            {/* Verification Metadata */}
            <motion.div variants={itemVariants} className="border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-auto">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  Verification Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Officially Verified
                </span>
              </div>
              
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Tracking ID
                </span>
                <span className="inline-block text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                  {data.gen_id}
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: The Certificate Image */}
          <motion.div variants={itemVariants} className="w-full xl:w-[65%]">
            {data.image_url ? (
              <div className="w-full rounded shadow-2xl overflow-hidden bg-white border border-slate-200">
                <img 
                  src={`/api/image/${data.image_url.split('/').pop()}`}
                  alt="Certificate Document" 
                  className="w-full h-auto block" 
                />
              </div>
            ) : (
              <div className="w-full relative aspect-[4/3] rounded-sm border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                <span className="text-slate-400 font-medium">No certificate image provided</span>
              </div>
            )}
            
            <p className="text-center text-xs text-slate-400 mt-6 max-w-lg mx-auto leading-relaxed">
              This digital certificate verifies the identity of the individual and their official recognition by the Data & Intelligence Guild.
            </p>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
