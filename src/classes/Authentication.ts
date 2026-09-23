import ApiRequest from './ApiRequest';
import ToastrNotification from './ToastrNotification';

class Authentication {
  static isAuthenticated(): boolean {
    if (!document.cookie.includes('access_token') || !document.cookie.includes('admin')) {
      return false;
    }
    return true;
  }

  async login(username: string, password: string) {
    const response = await ApiRequest.call('api/admin/login', 'POST', { username: username, password: password }, null, true, false);
    console.log('response',response);
    if (response.success !== true) {
      ToastrNotification.error(response.message);
      return;
    }
    
    const token = (response.data as { token: string }).token;
    const admin = (response.data as { admin: object }).admin;
    // const role = (response.data as { role: string }).role;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    document.cookie = `access_token=${token}; path=/; samesite=strict; expires=${expirationDate.toUTCString()}`;
    document.cookie = `admin=${JSON.stringify(admin)}; path=/; samesite=strict; expires=${expirationDate.toUTCString()}`;
    // document.cookie = `role=${JSON.stringify(role)}; path=/; samesite=strict; expires=${expirationDate.toUTCString()}`;
  }

  static getRole(): string | null {
    if (!document.cookie.includes('access_token') || !document.cookie.includes('admin') || !document.cookie.includes('role')) {
      return null;
    }
    return JSON.parse(document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1] || 'null');
  }

  static async logout() {
    await ApiRequest.call('api/admin/logout', 'POST', null, null, true);
    this.removeAuthenticationCookies();
  }

  static getAdmin() {
    return JSON.parse(document.cookie.split('; ').find(row => row.startsWith('admin='))?.split('=')[1] || '{}');
  }

  static removeAuthenticationCookies() {
    document.cookie = 'access_token=; path=/; samesite=strict; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin=; path=/; samesite=strict; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // document.cookie = 'role=; path=/; samesite=strict; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export default Authentication; 