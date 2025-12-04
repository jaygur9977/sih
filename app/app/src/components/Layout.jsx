import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  ShieldExclamationIcon, 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const Layout = () => {
  const location = useLocation()
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Scan', href: '/scan', icon: MagnifyingGlassIcon },
    { name: 'Analysis', href: '/analysis', icon: ChartBarIcon },
    { name: 'AI Assistant', href: '/chat', icon: ChatBubbleLeftRightIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <ShieldExclamationIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">CyberGuardian AI</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">AD</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 CyberGuardian AI | National Technical Research Organisation
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout