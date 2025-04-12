import Image from 'next/image'

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[80px] min-h-[80px] items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <Image 
          src="/logo.png"
          alt="Cumma Logo"
          width={120}
          height={32}
          className="object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Welcome back, Admin!</span>
      </div>
    </header>
  )
}

export default Header 