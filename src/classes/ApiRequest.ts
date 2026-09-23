import ToastrNotification from './ToastrNotification';
import {env} from "../../env.ts";
import Authentication from './Authentication';
import { ROUTES } from '../routes.ts';

export interface ApiResponse {
  success: boolean;
  data: any;
  message: string;
}

interface RequestOptions extends RequestInit {
  method: string;
  headers: {
    'Content-Type'?: string;
    'Accept': string;
    'Authorization'?: string;
  };
  body?: string | FormData; // Can be JSON string or FormData (converted internally from object)
}

class ApiRequest {
  static async call(
    url: string,
    method: string = 'GET',
    data: Record<string, any> | null = null,
    queryString: Record<string, any> | null = null,
    wantAlert: boolean = false,
    wantAuthentication: boolean = true,
    hasFile: boolean = false,
    acceptHeader: string|null = null
  ): Promise<ApiResponse> {
    
    // Construct base URL
    let fullUrl = env.backEndBaseUrl + '/' + url;

    // Add query parameters if they exist
    if (queryString) {
      // sometimes mightt to have an array in queryString like categories=[1.2.3.4]
      const params = new URLSearchParams();
      for (const key in queryString) {
        const value = queryString[key];
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((item, index) => params.append(`${key}[${index}]`, item));
        } else {
          if (value && value != "") params.append(key, value);
        }
      }
      fullUrl += `?${params.toString()}`;
    }

    // Prepare request options
    const options: RequestOptions = {
      method,
      headers: {
        'Accept': acceptHeader ?? 'application/json'
      },
    };

    // فقط برای JSON داده‌ها Content-Type را تنظیم می‌کنیم
    // برای FormData، مرورگر خودش Content-Type را با boundary تنظیم می‌کند
    if (!hasFile) {
      options.headers['Content-Type'] = acceptHeader ?? 'application/json';
    }

    if (wantAuthentication) {
      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      options.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Add form data if it exists
    if (data) {
      if (hasFile) {
        // تبدیل data به FormData
        const formData = new FormData();
        for (const key in data) {
          const value = data[key];
          if (value !== null && value !== undefined) {
            // اگر value یک File است، مستقیماً اضافه می‌کنیم
            if (value instanceof File) {
              formData.append(key, value);
            } else if (Array.isArray(value)) {
              // برای آرایه‌ها، هر آیتم را جداگانه اضافه می‌کنیم
              value.forEach((item) => {
                formData.append(key, item instanceof File ? item : String(item));
              });
            } else {
              formData.append(key, String(value));
            }
          }
        }
        options.body = formData; // Converted to FormData internally - can contain both text fields and files
      } else {
        // برای JSON داده‌ها
        options.body = JSON.stringify(data);
      }
    }

    let response: Response;
    try {
      // Make the request
      response = await fetch(fullUrl, options);
    } catch (error) {
      ToastrNotification.error('خطا از سمت سرور', 1000);
      console.log('ApiRequest' + 'خطا از سمت سرور', error);
      return {
        success: false,
        data: {},
        message: 'An error occurred while making the request'
      };
    }

    if (acceptHeader === 'xlsx') {
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'SandoghEduExcelExport.xlsx';

      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      return {
        success: false,
        data: {
          filename:filename,
          url: url
        },
        message: 'this is a fake message'
      };
    }
    
    const result = await response.json();


    if (response.status === 401) {
      ToastrNotification.error('لطفا وارد شوید');
      Authentication.removeAuthenticationCookies();
      window.location.href = ROUTES.login;
      throw new Error("Unauthorized");
    }
    // handle validation errors
    if (response.status === 422) {
      const errorMessages = Object.values(result.data).flat(); // همه پیام‌ها رو در یک آرایه می‌ریزه
      errorMessages.forEach((msg: any) => {
        ToastrNotification.error(msg);
      });
      throw new Error(result.message);
    }


    // Handle response
    if (response.status < 200 || response.status >= 300) {
      if (result && result.message)
        ToastrNotification.error(result.message);
      throw new Error(result.message);
    }


    if (wantAlert) {
      ToastrNotification.success(result.message);
    }

    
    return result;
    
  }
}

export default ApiRequest; 