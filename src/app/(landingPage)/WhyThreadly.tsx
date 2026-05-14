"use client"

export default function WhyThreadly() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Why choose Threadly?</h2>
      <div className="grid md:grid-cols-3 gap-10">
        <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147        
0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />

            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">Real-time Messaging</h3>
          <p className="text-gray-600 text-sm">Experience seamless, real-time communication with your friends and colleagues.</p>
        </div>  
        <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16z" />
                    <path d="M10 14l-2-2 1.414-1.414L10 11.172l4.586-4.586L16 8l-6 6z" />
                </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">End-to-End Encryption</h3>
            <p className="text-gray-600 text-sm">Your conversations are private and secure with our end-to-end encryption.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16z" />
                    <path d="M9.707 11.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L12 8.414l-2.293 2.293z" />
                </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Cross-Platform Compatibility</h3>
            <p className="text-gray-600 text-sm">Use Threadly on any device, whether it's a smartphone, tablet, or desktop computer.</p>
        </div>
    </div>
</div>
    )
}