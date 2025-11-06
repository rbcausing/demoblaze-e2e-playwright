/**
 * API helper functions for e-commerce testing
 */

export class ApiHelpers {
  /**
   * Create a test user via API
   */
  static async createTestUser(baseUrl: string, userData: any): Promise<any> {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get user authentication token
   */
  static async getAuthToken(baseUrl: string, email: string, password: string): Promise<string> {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Add product to cart via API
   */
  static async addToCart(
    baseUrl: string,
    token: string,
    productId: string,
    quantity: number = 1
  ): Promise<any> {
    const response = await fetch(`${baseUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get cart contents via API
   */
  static async getCart(baseUrl: string, token: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/cart`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get cart: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create order via API
   */
  static async createOrder(baseUrl: string, token: string, orderData: any): Promise<any> {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get product details via API
   */
  static async getProduct(baseUrl: string, productId: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get product: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search products via API
   */
  static async searchProducts(baseUrl: string, query: string): Promise<any> {
    const response = await fetch(`${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Clean up test data
   */
  static async deleteUser(baseUrl: string, token: string, userId: string): Promise<void> {
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }

  /**
   * Clear user's cart via API
   */
  static async clearCart(baseUrl: string, token: string): Promise<void> {
    const response = await fetch(`${baseUrl}/api/cart`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }
  }
}
