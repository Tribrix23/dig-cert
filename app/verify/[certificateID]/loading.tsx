export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-pulse">
      
      {/* Navbar Skeleton */}
      <header className="w-full border-b border-slate-200 py-4 px-6 md:px-12 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-slate-200"></div>
        <div className="w-48 h-6 bg-slate-200 rounded"></div>
      </header>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-12">
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-20">
          
          {/* Left Column Skeleton */}
          <div className="w-full xl:w-[35%] max-w-2xl">
            {/* User Profile Badge */}
            <div className="flex items-start gap-6 mb-10 bg-slate-50 p-8 rounded-xl border border-slate-100">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0"></div>
              <div className="w-full">
                <div className="w-3/4 h-8 bg-slate-200 rounded mb-3"></div>
                <div className="w-1/2 h-8 bg-slate-200 rounded mb-6"></div>
                <div className="w-1/3 h-4 bg-slate-200 rounded mb-6"></div>
                <div className="w-full h-3 bg-slate-200 rounded mb-2"></div>
                <div className="w-5/6 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="mb-10">
              <div className="w-1/3 h-8 bg-slate-200 rounded mb-3"></div>
              <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            </div>

            {/* Metadata */}
            <div className="border-t border-slate-100 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="w-24 h-3 bg-slate-200 rounded mb-3"></div>
                <div className="w-32 h-6 bg-slate-200 rounded-full"></div>
              </div>
              <div>
                <div className="w-20 h-3 bg-slate-200 rounded mb-3"></div>
                <div className="w-48 h-6 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="w-full xl:w-[65%]">
            <div className="w-full aspect-[4/3] rounded border border-slate-100 bg-slate-100 shadow-xl"></div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="w-2/3 h-3 bg-slate-200 rounded"></div>
              <div className="w-1/3 h-3 bg-slate-200 rounded"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
