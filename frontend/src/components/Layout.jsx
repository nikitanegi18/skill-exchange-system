import Sidebar from './Sidebar';

function Layout({ children, fullScreen = false }) {
  return (
    <div className={`bg-bg-dark text-text-main ${fullScreen ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}>
      <Sidebar />
      <div className={`ml-64 relative ${fullScreen ? 'h-full p-0' : 'p-8 min-h-screen'}`}>
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-accent-pink/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/4 -translate-y-1/4 z-0"></div>
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-accent-magenta/10 rounded-full blur-[120px] pointer-events-none translate-x-1/4 translate-y-1/4 z-0"></div>
        
        <div className={`relative z-10 ${fullScreen ? 'w-full h-full flex flex-col' : 'max-w-7xl mx-auto'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
