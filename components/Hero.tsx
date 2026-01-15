import Link from 'next/link'

export default function Hero() {
  return (
    <div className="flex flex-col gap-[10px] items-center justify-center px-0 py-[40px] w-full">
      {/* Main content */}
      <div className="flex flex-col gap-[30px] items-center shrink-0">
        {/* Heading and description */}
        <div className="flex flex-col font-['Inter',sans-serif] font-normal gap-[20px] items-center leading-[0] not-italic shrink-0 text-[#1c1c1c] text-center">
          <div className="flex flex-col justify-center shrink-0 text-[96px] tracking-[-4.8px] whitespace-nowrap">
            <p className="leading-[86.4px] whitespace-pre">
              <span>
                Your slides
                <br aria-hidden="true" />
              </span>
              <span className="font-['Inter',sans-serif] font-medium not-italic">always</span>
              <span>{` on`}</span>
            </p>
          </div>
          <div className="flex flex-col h-[51px] justify-center shrink-0 text-[18.9px] tracking-[-0.5px] w-[548px]">
            <p className="leading-[25px] whitespace-pre-wrap">
              Turn your presentations 24/7 into an AI agent that explains, pitch and answer questions automatically to anyone, anytime.
            </p>
          </div>
        </div>

        {/* Main slide card */}
        <div className="bg-gradient-to-b border border-[#dcdcdc] border-solid flex flex-col from-[#f8f8f8] from-[0.125%] gap-[10px] items-center justify-center overflow-clip px-0 py-[30px] rounded-[16px] shrink-0 to-[#f7f4ed]">
          {/* Illustration */}
          <div className="h-[126px] relative shrink-0 w-[187.5px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                alt="Upload illustration" 
                className="absolute h-[148.81%] left-0 max-w-none top-[-21.08%] w-full pointer-events-none select-none" 
                src="/assets/upload-illustration-new.png"
                draggable="false"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[10px] items-center justify-center leading-[17.786px] min-h-[35.57250213623047px] not-italic px-[19.44px] py-[12.96px] shrink-0 text-[#0d0d0d] tracking-[-0.2371px] w-[840px] whitespace-pre">
            <p className="font-['Inter',sans-serif] font-medium shrink-0 text-[16px]">
              Create your AI presentation
            </p>
            <p className="font-['Inter',sans-serif] font-normal shrink-0 text-[12px] text-center">
              {`Upload a PDF or PowerPoint `}
              <br aria-hidden="true" />
              and start now.
            </p>
            
            {/* See an example button - styled like Login button */}
            <Link 
              href="/example" 
              className="bg-gradient-to-b from-white to-[#f7f4ed] border border-[#dcdcdc] border-solid flex items-start rounded-[16px] shrink-0 mt-2"
            >
              <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
                <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
                  <p className="leading-[20px] whitespace-pre">See an example</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
