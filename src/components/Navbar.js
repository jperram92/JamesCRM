import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from './DarkModeToggle';
import UserAvatar from './UserAvatar';
import Logo from './Logo';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Companies', href: '/companies' },
    { name: 'Contacts', href: '/contacts' },
    { name: 'Deals', href: '/deals' },
    { name: 'Activities', href: '/activities' },
  ];

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Logo />
                </div>
                {isAuthenticated && (
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-1">
                      {navigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            isActive ? 'nav-link-active' : 'nav-link'
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 space-x-3">
                  {/* Dark Mode Toggle */}
                  <DarkModeToggle />

                  {/* Notification Bell */}
                  {isAuthenticated && (
                    <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}

                  {/* User Menu */}
                  {isAuthenticated ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex items-center max-w-xs rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <span className="sr-only">Open user menu</span>
                          <UserAvatar user={user} />
                        </Menu.Button>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/settings"
                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <Link
                      to="/login"
                      className="btn btn-primary btn-sm"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex md:hidden">
                <DarkModeToggle />
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span className="sr-only">{open ? 'Close main menu' : 'Open main menu'}</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden bg-gray-800">
            {isAuthenticated && (
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      isActive
                        ? 'block nav-link-active'
                        : 'block nav-link'
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <UserAvatar user={user} />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.first_name} {user?.last_name}</div>
                    <div className="text-sm font-medium text-gray-400">{user?.email}</div>
                  </div>
                  <button className="ml-auto p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="px-2 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Login
                  </Link>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
