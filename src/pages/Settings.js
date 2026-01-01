export function Settings() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';
    container.style.maxWidth = '800px';

    container.innerHTML = `
    <div>
      <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Settings</h1>
      <p class="text-muted">Manage store, attribution, and system preferences.</p>
    </div>
  `;

    // Helper to create a section
    const createSection = (title, content) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.padding = 'var(--spacing-xl)';
        card.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">${title}</h3>`;

        const body = document.createElement('div');
        body.className = 'flex flex-col gap-lg';
        body.innerHTML = content;

        card.appendChild(body);
        return card;
    };

    // 1. Store Settings
    const storeSettings = createSection('Store Settings', `
    <div class="grid-cols-2" style="display: grid; gap: 1.5rem;">
        <div class="flex flex-col gap-sm">
            <label class="text-sm font-semibold">Store Name</label>
            <input type="text" value="My Shopify Store" style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
        <div class="flex flex-col gap-sm">
            <label class="text-sm font-semibold">Support Email</label>
            <input type="email" value="support@mystore.com" style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
        </div>
        <div class="flex flex-col gap-sm">
            <label class="text-sm font-semibold">Currency</label>
            <select style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
                <option selected>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
            </select>
        </div>
        <div class="flex flex-col gap-sm">
            <label class="text-sm font-semibold">Timezone</label>
            <select style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 0.375rem;">
                <option>UTC-5 (Eastern Time)</option>
                <option selected>UTC-8 (Pacific Time)</option>
                <option>UTC+0 (GMT)</option>
            </select>
        </div>
    </div>
  `);
    container.appendChild(storeSettings);

    // 2. Attribution Rules
    const attributionSettings = createSection('Attribution Rules', `
    <div class="flex flex-col gap-lg">
        <div class="flex flex-col gap-sm">
             <label class="text-sm font-semibold">Attribution Window</label>
             <p class="text-sm text-muted">How many days after a click should a sale be attributed?</p>
             <div class="flex items-center gap-md">
                <input type="range" min="1" max="90" value="30" oninput="this.nextElementSibling.innerText = this.value + ' days'" style="width: 200px;">
                <span class="font-semibold">30 days</span>
             </div>
        </div>

        <div class="flex flex-col gap-sm">
            <label class="text-sm font-semibold">Conflict Resolution</label>
             <p class="text-sm text-muted">When a user has both a coupon and a campaign link click, which takes priority?</p>
            <div class="flex gap-lg">
                <label class="flex items-center gap-sm">
                    <input type="radio" name="priority" checked> Coupon Code
                </label>
                 <label class="flex items-center gap-sm">
                    <input type="radio" name="priority"> Campaign Link
                </label>
            </div>
        </div>
    </div>
  `);
    container.appendChild(attributionSettings);

    // 3. Campaign Settings
    const campaignSettings = createSection('Campaign Settings', `
     <div class="flex items-center justify-between">
        <div>
            <div class="font-semibold">Auto-Create Campaigns</div>
            <div class="text-sm text-muted">Automatically create a campaign when a new UTM source is detected.</div>
        </div>
        <label class="switch" style="position: relative; display: inline-block; width: 48px; height: 24px;">
          <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
          <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #4f46e5; border-radius: 24px;"></span>
          <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s; transform: translateX(24px);"></span>
        </label>
     </div>
  `);
    container.appendChild(campaignSettings);

    // Save Button
    const saveBtn = document.createElement('div');
    saveBtn.className = 'flex justify-end';
    saveBtn.innerHTML = `<button class="btn btn-primary" onclick="alert('Settings saved!')">Save Changes</button>`;
    container.appendChild(saveBtn);

    return container;
}
