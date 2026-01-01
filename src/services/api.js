const API_URL = 'http://localhost:3000/api';

export const api = {
    async getOrders(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/orders?${query}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async getCampaigns() {
        try {
            const response = await fetch(`${API_URL}/campaigns`);
            if (!response.ok) throw new Error('Failed to fetch campaigns');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async getCoupons() {
        try {
            const response = await fetch(`${API_URL}/coupons`);
            if (!response.ok) throw new Error('Failed to fetch coupons');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async getStats(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/stats?${query}`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async getOrderMonths() {
        try {
            const response = await fetch(`${API_URL}/orders/months`);
            if (!response.ok) throw new Error('Failed to fetch months');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async getCouponDetails(code) {
        try {
            const response = await fetch(`${API_URL}/coupons/${code}/details`);
            if (!response.ok) throw new Error('Failed to fetch coupon details');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async createCampaign(data) {
        try {
            const response = await fetch(`${API_URL}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create campaign');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async uploadLeads(campaignId, leads) {
        try {
            const response = await fetch(`${API_URL}/leads/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, leads })
            });
            if (!response.ok) throw new Error('Failed to upload leads');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async getCampaignDetails(id) {
        try {
            const response = await fetch(`${API_URL}/campaigns/${id}/details`);
            if (!response.ok) throw new Error('Failed to fetch campaign details');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async updateCampaign(id, data) {
        try {
            const response = await fetch(`${API_URL}/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update campaign');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async deleteCampaign(id) {
        try {
            const response = await fetch(`${API_URL}/campaigns/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete campaign');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async getLeads() {
        try {
            const response = await fetch(`${API_URL}/leads`);
            if (!response.ok) throw new Error('Failed to fetch leads');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },
    async updateLead(id, data) {
        try {
            const response = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update lead');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async createLead(data) {
        try {
            const response = await fetch(`${API_URL}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create lead');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getCampaignStats() {
        try {
            const response = await fetch(`${API_URL}/campaigns/stats`);
            if (!response.ok) throw new Error('Failed to fetch campaign stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {
                totalCampaigns: 0,
                activeCampaigns: 0,
                platformsUsed: 0,
                totalRevenue: 0
            };
        }
    },
    async getAnalytics() {
        try {
            const response = await fetch(`${API_URL}/analytics`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {
                kpis: [],
                platformRevenue: { labels: [], data: [] },
                funnel: [],
                comparison: []
            };
        }
    }
};
