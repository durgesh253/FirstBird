import './style.css';
import '@phosphor-icons/web/regular';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Coupons } from './pages/Coupons';
import { Leads } from './pages/Leads';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetail } from './pages/CampaignDetail';
import { CouponDetail } from './pages/CouponDetail';
import { Orders } from './pages/Orders';
import { Analytics } from './pages/Analytics';
import { Customers } from './pages/Customers';
import { RepeatCustomers } from './pages/RepeatCustomers';
import { SubscriptionPlans } from './pages/SubscriptionPlans';
import { Settings } from './pages/Settings';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <div id="sidebar-container"></div>
    <div class="main-content">
      <div id="header-container"></div>
      <main id="page-content" class="scrollable-content"></main>
    </div>
    <div id="mobile-nav-container"></div>
  </div>
`;

// Mount Components
document.querySelector('#sidebar-container').appendChild(Sidebar());
document.querySelector('#header-container').appendChild(Header());
document.querySelector('#mobile-nav-container').appendChild(MobileNav());

// Basic Router
const routes = {
  '/': Dashboard,
  '/index.html': Dashboard,
  '/analytics': Analytics,
  '/customers': Customers,
  '/repeat-customers': RepeatCustomers,
  '/subscriptions': SubscriptionPlans,
  '/settings': Settings,
  '/orders': Orders,
  '/coupons': Coupons,
  '/leads': Leads,
  '/campaigns': Campaigns,
  '/campaigns/detail': CampaignDetail,
};

function navigate() {
  const path = window.location.pathname;

  let Component = routes[path];

  // Handle dynamic /coupons/:code
  if (!Component && path.startsWith('/coupons/')) {
    Component = CouponDetail;
  }

  // Fallback
  if (!Component) Component = Dashboard;

  const content = document.querySelector('#page-content');
  content.innerHTML = '';
  content.appendChild(Component());
}

window.addEventListener('popstate', navigate);
navigate(); // Initial load
