import React, { useEffect, useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header({ 
  sections, 
  activeSection, 
  onTabClick, 
  reducedMotion, 
  onToggleMotion 
}) {
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});

  useEffect(() => {
    const measureTab = () => {
      const activeTabEl = tabRefs.current[activeSection];
      if (activeTabEl) {
        setUnderlineStyle({
          left: activeTabEl.offsetLeft,
          width: activeTabEl.offsetWidth
        });
      }
    };

    measureTab();
    window.addEventListener('resize', measureTab);
    return () => window.removeEventListener('resize', measureTab);
  }, [activeSection]);

  return (
    <header className="sticky top-0 z-50 bg-[#101314] border-b-2 border-line w-full">
      <div className="max-w-[1160px] mx-auto flex items-center justify-between relative px-5 h-[52px]">
        {/* Left Side: Horizontally scrollable Tabs */}
        <div className="flex items-center h-full overflow-x-auto scrollbar-none relative flex-grow mr-4">
          {sections.map((sec) => (
            <button
              key={sec.name}
              ref={(el) => { tabRefs.current[sec.name] = el; }}
              className={`flex items-center gap-2 h-full px-4 font-code text-[13px] font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors duration-200 select-none ${
                activeSection === sec.name ? 'text-white' : 'text-soft hover:text-white'
              }`}
              onClick={() => onTabClick(sec.id, sec.name)}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  activeSection === sec.name
                    ? 'bg-lime shadow-[0_0_8px_#C6FF3D]'
                    : 'bg-transparent'
                }`}
              />
              <span>{sec.name}</span>
            </button>
          ))}
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-[3px] bg-lime transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width
            }}
          />
        </div>

        {/* Right Side: Theme / Motion toggle */}
        <div className="flex-shrink-0">
          <ThemeToggle reducedMotion={reducedMotion} onToggle={onToggleMotion} />
        </div>
      </div>
    </header>
  );
}
