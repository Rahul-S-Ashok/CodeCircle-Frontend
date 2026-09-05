import React from 'react'
import { FaTwitter, FaYoutube, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="bg-base-300/90 backdrop-blur-md border-t border-white/5
                 text-neutral-content px-6 py-4
                 flex items-center justify-between
                 fixed bottom-0 left-0 w-full z-50
                 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 text-sm md:text-base text-base-content/70">
        <span className="text-lg">#</span>
        <p>Copyright © 2026 — All rights reserved</p>
      </div>

      {/* Right Section */}
      <div className="flex gap-5 text-lg md:text-xl">
        <FaTwitter className="cursor-pointer text-base-content/70 hover:text-blue-400 hover:scale-110 transition-all duration-200" />
        <FaYoutube className="cursor-pointer text-base-content/70 hover:text-red-500 hover:scale-110 transition-all duration-200" />
        <FaFacebook className="cursor-pointer text-base-content/70 hover:text-blue-500 hover:scale-110 transition-all duration-200" />
      </div>
    </footer>
  )
}

export default Footer