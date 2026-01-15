import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 w-full">
      {/* Logo Section */}
      <div className="flex items-center shrink-0">
        <Link href="/" className="flex items-center">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={180}
              height={48}
              priority
              className="h-[36px] w-auto"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-[10px] items-center shrink-0">
        <Link href="/solutions" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Solutions</p>
            </div>
          </div>
        </Link>
        <Link href="/enterprises" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Enterprises</p>
            </div>
          </div>
        </Link>
        <Link href="/pricing" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Pricing</p>
            </div>
          </div>
        </Link>
        <Link href="/explore" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Explore</p>
            </div>
          </div>
        </Link>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center shrink-0">
        <div className="flex gap-[6px] items-center shrink-0">
          <Link 
            href="/login" 
            className="bg-gradient-to-b from-white to-[#f7f4ed] border border-[#dcdcdc] border-solid flex items-start rounded-[16px] shrink-0"
          >
            <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
                <p className="leading-[20px] whitespace-pre">Login</p>
              </div>
            </div>
          </Link>
          <Link 
            href="/signup" 
            className="bg-[#222] border border-[#dcdcdc] border-solid flex items-start rounded-[16px] shrink-0"
          >
            <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
                <p className="leading-[20px] whitespace-pre">Sign up</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
