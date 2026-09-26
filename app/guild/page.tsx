"use client";

import Image from "next/image";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Folder from "@/components/Folder";
import { submitCertificate, getPresignedUrl } from "@/app/actions/uploadCertificate";
import { 
  Bell, 
  Menu,
  Info,
  ChevronsUpDown,
  Award,
  UploadCloud,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom After Effects style bezier curve for dramatic, smooth motion
const aeEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function GuildDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Generate a timestamp and random salt once per session to prevent ID collisions
  const [sessionSalt] = useState(() => {
    const now = new Date();
    const timeCode = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${timeCode}-${random}`;
  });

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    familyName: '',
    month: '',
    day: '',
    year: '',
    type: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate a very smooth loading bar animation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        setUploadedImage(event.target?.result as string);
        setUploadedFile(file);
        setIsUploading(false);
      }, 1300); // Roughly matches the 100% progress simulation
    };
    reader.readAsDataURL(file);
  };

  const generateCertificateId = () => {
    if (!formData.firstName || !formData.familyName || !formData.month || !formData.day || !formData.year || !formData.type) {
      return '';
    }
    
    const initials = `${formData.firstName.charAt(0)}${formData.familyName.charAt(0)}`.toUpperCase();
    const dateCode = `${formData.year}${formData.month.substring(0, 3).toUpperCase()}${formData.day.padStart(2, '0')}`;
    
    let hash = 0;
    const str = formData.firstName + formData.familyName + formData.type;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    const typeHash = Math.abs(hash).toString(36).substring(0, 4).toUpperCase().padStart(4, '0');
    
    return `DIG-${dateCode}-${initials}-${typeHash}-${sessionSalt}`;
  };

  const certificateId = generateCertificateId();
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const qrData = certificateId ? `${baseUrl}/verify/${certificateId}` : '';

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    
    const fullName = [formData.firstName, formData.middleName, formData.familyName].filter(Boolean).join(" ");
    link.download = `${fullName || certificateId}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    // Idempotency protection: prevent double-clicks from firing multiple requests
    if (isSubmitting) return;

    if (!formData.firstName || !formData.familyName || !formData.type) {
      setSubmitMessage({ type: 'error', text: 'Please fill out at least First Name, Family Name, and Type.'});
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const fd = new FormData();
    fd.append("genId", certificateId);
    fd.append("firstName", formData.firstName);
    fd.append("middleName", formData.middleName);
    fd.append("familyName", formData.familyName);
    fd.append("month", formData.month);
    fd.append("day", formData.day);
    fd.append("year", formData.year);
    fd.append("type", formData.type);
    
    let clientImageUrl = null;
    if (uploadedFile) {
      try {
        const { url, imageUrl } = await getPresignedUrl(uploadedFile.name, uploadedFile.type, certificateId);
        
        // Upload directly to R2 bypassing Vercel body limits
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: uploadedFile,
          headers: {
            "Content-Type": uploadedFile.type,
          },
        });
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload image to storage");
        }
        clientImageUrl = imageUrl;
      } catch (err: any) {
        setSubmitMessage({ type: 'error', text: err.message || 'Storage upload failed' });
        setIsSubmitting(false);
        return;
      }
    }
    
    if (clientImageUrl) {
      fd.append("imageUrl", clientImageUrl);
    }

    try {
      const result = await submitCertificate(fd);
      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message || 'Success!' });
        
        // Clear the form
        setFormData({
          firstName: '',
          middleName: '',
          familyName: '',
          month: '',
          day: '',
          year: '',
          type: ''
        });
        setUploadedFile(null);
        setUploadedImage(null);
        
        // Optionally auto-dismiss the success message after 5 seconds
        setTimeout(() => setSubmitMessage(null), 5000);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (e: any) {
      setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f4f6f9] flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* Top Navbar */}
      <motion.header 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2.5, ease: aeEase }}
        className="h-[60px] border-b border-slate-200 flex items-center justify-between px-4 bg-white z-20 shrink-0 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-9 h-9">
              <Image 
                src="/logo.png" 
                alt="DIG Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 leading-none">
              <span className="font-extrabold text-[#0B1641] tracking-tight uppercase text-lg">DATA & INTELLIGENCE GUILD</span>
              <span className="hidden sm:inline-block text-slate-300">|</span>
              <span className="text-slate-600 text-sm font-medium">Member Portal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              2
            </span>
          </button>
        </div>
      </motion.header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ width: 256, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: aeEase }}
              className="bg-[#fafafa] border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="w-64 h-full flex flex-col">
                <div className="flex-1 py-4 px-4 flex flex-col">
                  
                  {/* Section 1: Active Operations */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: aeEase }}
                  >
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Operations</h3>
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#0055FF] bg-white text-[#0B1641] text-sm font-medium hover:bg-slate-50 cursor-pointer transition-colors w-full">
                        <Info className="w-4 h-4 shrink-0" /> <span className="truncate">Guild Guidelines</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Section 2: Certificates */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: aeEase }}
                    className="mt-6"
                  >
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Certificates</h3>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setActiveView('certificate')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium cursor-pointer transition-colors w-full ${
                          activeView === 'certificate' 
                            ? 'border-[#00A3B5] bg-slate-50 text-[#00A3B5]' 
                            : 'border-transparent bg-white text-[#0B1641] hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Award className={`w-4 h-4 shrink-0 ${activeView === 'certificate' ? 'text-[#00A3B5]' : 'text-slate-400'}`} /> 
                        <span className="truncate">Certificate</span>
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Profile Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: aeEase }}
                  className="border-t border-slate-200 p-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between mt-auto w-full"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300 shrink-0">
                      JD
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-[#0B1641] truncate w-[120px]">John David Laniohan ...</span>
                      <span className="text-[10px] text-slate-500 truncate">20241679</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#f4f6f9] flex flex-col items-center justify-center relative p-8 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.4, ease: aeEase } }}
                transition={{ duration: 3, delay: 0.5, ease: aeEase }}
                className="flex flex-col items-center text-center max-w-3xl bg-white p-12 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden w-full"
              >
                {/* Cinematic background highlight inside the card */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 4, delay: 1, ease: aeEase }}
                  className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[#0055FF]/5 to-transparent pointer-events-none"
                />

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 3, delay: 0.8, ease: aeEase }}
                  className="relative w-32 h-32 mb-8"
                >
                  <Image 
                    src="/logo.png" 
                    alt="DIG Logo" 
                    fill 
                    className="object-contain"
                  />
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 3, delay: 1, ease: aeEase }}
                  className="text-3xl font-extrabold text-[#0B1641] mb-2 tracking-tight uppercase"
                >
                  Data & Intelligence Guild (DIG)
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 3, delay: 1.2, ease: aeEase }}
                  className="text-[#0055FF] font-bold text-lg mb-6"
                >
                  "We don't just study AI and data—we explore what they can make possible."
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 3, delay: 1.4, ease: aeEase }}
                  className="text-slate-600 mb-8 text-sm leading-relaxed max-w-2xl mx-auto"
                >
                  Through training, projects, research, experimentation, and collaboration, the Data & Intelligence Guild (DIG) empowers students to become future-ready innovators, ethical technologists, researchers, and leaders capable of transforming data into knowledge and intelligence into meaningful solutions.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 3, delay: 1.6, ease: aeEase }}
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-slate-400 tracking-widest"
                >
                  <span className="hover:text-[#0055FF] transition-colors cursor-pointer">EXPLORE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
                  <span className="hover:text-[#0055FF] transition-colors cursor-pointer">ANALYZE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
                  <span className="hover:text-[#0055FF] transition-colors cursor-pointer">BUILD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
                  <span className="hover:text-[#0055FF] transition-colors cursor-pointer">INNOVATE</span>
                </motion.div>
              </motion.div>
            )}

            {activeView === 'certificate' && (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: aeEase }}
                className="w-full flex-1 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8 flex flex-col lg:flex-row gap-12"
              >
                {/* Form Section */}
                <div className="flex-1 flex flex-col">
                  <h2 className="text-2xl font-extrabold text-[#0B1641] mb-8">Upload Certificate</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                          value={formData.firstName}
                          onChange={e => setFormData({...formData, firstName: e.target.value})}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Middle Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                          value={formData.middleName}
                          onChange={e => setFormData({...formData, middleName: e.target.value})}
                          placeholder="Laniohan"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Family Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                          value={formData.familyName}
                          onChange={e => setFormData({...formData, familyName: e.target.value})}
                          placeholder="Perez"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month</label>
                        <select 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm bg-white"
                          value={formData.month}
                          onChange={e => setFormData({...formData, month: e.target.value})}
                        >
                          <option value="">Select...</option>
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day</label>
                        <input 
                          type="number" 
                          min="1" max="31"
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                          value={formData.day}
                          onChange={e => setFormData({...formData, day: e.target.value})}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                          value={formData.year}
                          onChange={e => setFormData({...formData, year: e.target.value})}
                          placeholder="2026"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:border-[#0055FF] focus:ring-1 focus:ring-[#0055FF] text-sm"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        placeholder="Membership Certificate"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Signature / Image</label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors group min-h-[200px]">
                        
                        {!uploadedImage && !isUploading && (
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
                          />
                        )}
                        
                        {isUploading ? (
                          <div className="w-full max-w-[250px] flex flex-col items-center">
                            <span className="text-sm font-bold text-[#0B1641] mb-4">Reading File... {uploadProgress}%</span>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-[#0055FF]"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ ease: "linear", duration: 0.1 }}
                              />
                            </div>
                          </div>
                        ) : uploadedImage ? (
                          <div className="relative w-full h-[150px] flex items-center justify-center group/preview z-40">
                            <Image 
                              src={uploadedImage} 
                              alt="Uploaded Preview" 
                              fill
                              className="object-contain" 
                            />
                            <div className="absolute inset-0 bg-white/70 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-md">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setUploadedImage(null);
                                  setUploadedFile(null);
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-bold border border-red-200 hover:bg-red-100 transition-colors z-50"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* The interactive folder used for upload */}
                            <div className="w-full flex justify-center h-[120px] mb-4 relative items-end pointer-events-none group-hover:scale-105 transition-transform">
                              <Folder color="#0055FF" size={1} />
                            </div>
                            
                            <span className="text-sm font-bold text-[#0055FF]">Click or drag to attach file</span>
                            <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                          </>
                        )}
                        
                      </div>
                    </div>
                    
                    {submitMessage && (
                      <div className={`p-4 rounded-md text-sm font-bold ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {submitMessage.text}
                      </div>
                    )}
                    
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full mt-4 py-4 bg-[#0B1641] hover:bg-[#0055FF] text-white rounded-md font-bold transition-colors cursor-pointer text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        "Upload Certificate"
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview / QR Section */}
                <div className="flex-1 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center border border-slate-100 min-h-[400px]">
                  
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8">Verification QR</h3>
                  
                  {formData.firstName && formData.familyName && formData.month && formData.day && formData.year && formData.type ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center group relative"
                    >
                      <QRCodeCanvas 
                        id="qr-code-canvas"
                        value={qrData}
                        size={240}
                        bgColor={"#ffffff"}
                        fgColor={"#0B1641"}
                        level={"M"}
                        includeMargin={false}
                      />
                      
                      {/* Download Overlay */}
                      <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl z-10">
                        <button 
                          onClick={handleDownloadQR}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0B1641] text-white rounded-md text-sm font-bold shadow-lg hover:bg-[#0055FF] transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download QR
                        </button>
                      </div>

                      <div className="mt-6 flex flex-col items-center w-full">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Certificate ID</span>
                        <span className="text-xs font-mono font-bold text-[#0B1641] bg-slate-50 px-3 py-1.5 rounded border border-slate-200 tracking-wider">
                          {certificateId}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-[240px] h-[240px] border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 p-8 text-center text-sm">
                      Fill out all required fields to generate QR code
                    </div>
                  )}
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
