// This file is a placeholder to maintain compatibility
// The original Cloudflare-specific functionality has been removed for GitHub Pages deployment

export async function incrementCounter() {
  // Mock implementation for GitHub Pages
  return { value: Math.floor(Math.random() * 1000) + 1 };
}

export async function getRecentAccesses() {
  // Mock implementation for GitHub Pages
  const mockData = [];
  const now = Date.now();
  
  // Generate some mock access records
  for (let i = 0; i < 5; i++) {
    mockData.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }
  
  return mockData;
}
