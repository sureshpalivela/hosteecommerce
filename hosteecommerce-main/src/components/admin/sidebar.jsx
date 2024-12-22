import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, MessageSquare, Users, Calendar, Menu, LayoutDashboard, LogOut, Ticket } from 'lucide-react';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const { sellerId } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const adminMenuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard />, path: `/admin/${sellerId}` },
        { name: 'Products', icon: <Package />, path: `/admin/products/${sellerId}` },
        { name: 'Orders', icon: <ShoppingBag />, path: `/admin/orders/${sellerId}` },
        { name: 'Complaints', icon: <MessageSquare />, path: `/admin/complaints/${sellerId}` },
        { name: 'Customers', icon: <Users />, path: `/admin/customers/${sellerId}` },
        { name: 'Calendar', icon: <Calendar />, path: `/admin/calendar/${sellerId}` },
        { name: 'Coupons', icon: <Ticket />, path: `/admin/coupons/${sellerId}` },
    ];

    const sellerMenuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard />, path: `/seller/${sellerId}` },
        { name: 'My Products', icon: <Package />, path: `/seller/products/${sellerId}` },
        { name: 'Orders', icon: <ShoppingBag />, path: `/seller/orders/${sellerId}` },
        { name: 'Messages', icon: <MessageSquare />, path: `/seller/messages/${sellerId}` },
        { name: 'Analytics', icon: <Users />, path: `/seller/analytics/${sellerId}` },
        { name: 'Calendar', icon: <Calendar />, path: `/seller/calendar/${sellerId}` },
        { name: 'Promotions', icon: <Ticket />, path: `/seller/promotions/${sellerId}` },
    ];

    const menuItems = role === 'Admin' ? adminMenuItems : sellerMenuItems;

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(!isOpen);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('https://ecommercebackend-8gx8.onrender.com/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ sellerId })
            });

            if (response.ok) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <>
            <button 
                onClick={toggleSidebar}
                className="fixed top-4 left-4 p-2 rounded-lg hover:bg-pink-200 lg:hidden z-50"
            >
                <Menu size={24} />
            </button>

            <div className={`fixed left-0 top-0 h-screen bg-pink-50 shadow-lg transition-all duration-300 flex flex-col 
                lg:translate-x-0 lg:w-64
                ${isOpen ? 'w-64' : 'w-20'}`}
            >
                <div className="flex items-center p-4">
                    {isOpen && (
                        <div className="text-2xl font-bold text-gray-800">
                            Mera Bestie
                        </div>
                    )}
                </div>

                <div className="flex-grow flex items-center">
                    <ul className="space-y-2 p-4 w-full">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-2 rounded-lg transition-colors
                                        ${location.pathname === item.path 
                                            ? 'bg-pink-200 text-pink-800' 
                                            : 'text-gray-700 hover:bg-pink-100'}
                                        ${isOpen ? 'justify-start space-x-4' : 'justify-center'}`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {isOpen && <span>{item.name}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto">
                    <div className={`p-4 ${isOpen ? 'block' : 'hidden'}`}>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center bg-red-500 text-white py-2 rounded hover:bg-red-600"
                        >
                            <LogOut className="mr-2" size={18} />
                            Logout
                        </button>
                    </div>
                    <footer className={`text-center text-gray-500 text-sm p-4 ${isOpen ? 'block' : 'hidden'}`}>
                        Mera Bestie {role} Dashboard © 2024
                    </footer>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
