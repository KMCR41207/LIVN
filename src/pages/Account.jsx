import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AccountSidebar from '../components/AccountSidebar';
import AccountHeader from '../components/AccountHeader';
import AccountSettings from './account/AccountSettings';
import ManageAddresses from './account/ManageAddresses';
import YourOrders from './account/YourOrders';
import YourCart from './account/YourCart';
import YourWishlist from './account/YourWishlist';
import RewardsLoyalty from './account/RewardsLoyalty';
import CustomerCare from './account/CustomerCare';
import ReturnsExchanges from './account/ReturnsExchanges';
import SavedMeasurements from './account/SavedMeasurements';
import RecentlyViewed from './account/RecentlyViewed';
import YourReviews from './account/YourReviews';
import SettingsPrivacy from './account/SettingsPrivacy';
import './Account.css';

const MENU_ITEMS = [
  { id: 'settings', label: 'Account Settings', icon: 'Settings' },
  { id: 'addresses', label: 'Manage Addresses', icon: 'MapPin' },
  { id: 'orders', label: 'Your Orders', icon: 'Package' },
  { id: 'cart', label: 'Your Cart', icon: 'ShoppingBag' },
  { id: 'wishlist', label: 'Wishlist', icon: 'Heart' },
  { id: 'rewards', label: 'Rewards & Loyalty', icon: 'Star' },
  { id: 'customer-care', label: 'Customer Care', icon: 'Headphones' },
  { id: 'returns', label: 'Returns & Exchanges', icon: 'RotateCcw' },
  { id: 'measurements', label: 'Saved Measurements', icon: 'Ruler' },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: 'Eye' },
  { id: 'reviews', label: 'Your Reviews', icon: 'MessageSquare' },
  { id: 'privacy', label: 'Settings & Privacy', icon: 'Shield' },
];

const Account = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Read tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'orders';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    navigate(`/account?tab=${tab}`, { replace: true });
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="account-container">
        <div className="account-loading">Loading your account...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <AccountSettings user={currentUser} />;
      case 'addresses':
        return <ManageAddresses user={currentUser} />;
      case 'orders':
        return <YourOrders user={currentUser} />;
      case 'cart':
        return <YourCart user={currentUser} />;
      case 'wishlist':
        return <YourWishlist user={currentUser} />;
      case 'rewards':
        return <RewardsLoyalty user={currentUser} />;
      case 'customer-care':
        return <CustomerCare user={currentUser} />;
      case 'returns':
        return <ReturnsExchanges user={currentUser} />;
      case 'measurements':
        return <SavedMeasurements user={currentUser} />;
      case 'recently-viewed':
        return <RecentlyViewed user={currentUser} />;
      case 'reviews':
        return <YourReviews user={currentUser} />;
      case 'privacy':
        return <SettingsPrivacy user={currentUser} />;
      default:
        return <YourOrders user={currentUser} />;
    }
  };

  const activeMenuItem = MENU_ITEMS.find(item => item.id === activeTab);

  return (
    <div className="account-container">
      {/* Sidebar */}
      <AccountSidebar
        menuItems={MENU_ITEMS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={(open) => setSidebarOpen(open)}
      />

      {/* Main Content */}
      <div className="account-main">
        <AccountHeader
          user={currentUser}
          activeMenuItem={activeMenuItem}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="account-content">
          <div className="account-content-inner">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
