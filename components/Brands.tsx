export default function Brands() {
  const brands = [
    { name: 'HCA Healthcare', logo: '/assets/hca-logo.svg', width: 29 },
    { name: 'Klarna', logo: '/assets/klarna-logo.svg', width: 43 },
    { name: 'Adobe', logo: '/assets/adobe-logo.svg', width: 62.5 },
    { name: 'Netflix', logo: '/assets/netflix-logo.svg', width: 65 },
    { name: 'PayPal', logo: '/assets/paypal-logo.svg', width: 59.5 },
    { name: 'Salesforce', logo: '/assets/salesforce-logo.svg', width: 51 },
  ]

  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px] items-center px-4 sm:px-6 py-[20px] w-full max-w-[1440px] mx-auto">
      <p className="font-['Inter',sans-serif] font-normal leading-[17.786px] not-italic shrink-0 text-[13px] sm:text-[14px] md:text-[16px] text-[#0d0d0d] tracking-[-0.2371px] text-center px-4">
        327 of Fortune 500 are automating presentations with Camaral
      </p>
      
      <div className="relative w-full overflow-hidden h-[15px] sm:h-[20px] pointer-events-none">
        {/* Scrolling container */}
        <div className="flex gap-[40px] sm:gap-[60px] items-center animate-scroll">
          {/* First set of logos */}
          {brands.map((brand, index) => (
            <div 
              key={`brand-1-${index}`} 
              className="flex items-center justify-center shrink-0 grayscale opacity-60 transition-all duration-300 pointer-events-none"
              style={{ 
                width: `${brand.width * 0.75}px`, 
                height: '15px',
                minWidth: `${brand.width * 0.75}px`
              }}
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable="false"
              />
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {brands.map((brand, index) => (
            <div 
              key={`brand-2-${index}`} 
              className="flex items-center justify-center shrink-0 grayscale opacity-60 transition-all duration-300 pointer-events-none"
              style={{ 
                width: `${brand.width * 0.75}px`, 
                height: '15px',
                minWidth: `${brand.width * 0.75}px`
              }}
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @media (min-width: 640px) {
          .animate-scroll > div {
            width: ${brands.map(b => b.width).join('px, ')}px !important;
            height: 20px !important;
            min-width: ${brands.map(b => b.width).join('px, ')}px !important;
          }
        }
      `}</style>
    </div>
  )
}
