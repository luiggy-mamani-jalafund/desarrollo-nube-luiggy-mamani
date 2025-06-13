"use client";

import Link from "next/link";
import React from "react";

const Menu = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <nav className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0 text-xl font-semibold">
                            Test site
                        </div>

                        <div className="sm:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-300 hover:text-white focus:outline-none"
                            >
                                Listar
                            </button>
                        </div>

                        {/* Desktop links */}
                        <div className="hidden sm:flex sm:space-x-6">
                            <Link href="/" className="hover:text-gray-300">
                                Home
                            </Link>
                            <Link
                                href="/posts"
                                className="block text-green-300 hover:text-white"
                            >
                                Posts
                            </Link>
                            <Link href="/login" className="hover:text-gray-300">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="hover:text-gray-300"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile links */}
                {isOpen && (
                    <div className="sm:hidden px-4 pb-3 space-y-2">
                        <Link
                            href="/"
                            className="block text-gray-300 hover:text-white"
                        >
                            Home
                        </Link>
                        <Link
                            href="/posts"
                            className="block text-green-300 hover:text-white"
                        >
                            Posts
                        </Link>
                        <Link
                            href="/login"
                            className="block text-gray-300 hover:text-white"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="block text-gray-300 hover:text-white"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </nav>
            <Link
                href="/posts/create"
                className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition"
            >
                New Post
            </Link>
        </>
    );
};

export default Menu;
