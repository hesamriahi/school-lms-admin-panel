import store from "../store";
import { updateHomeSlice } from "../store";
import ApiRequest, { ApiResponse } from "../classes/ApiRequest.ts";
import { Dispatch } from "@reduxjs/toolkit";

interface HomeApiResponse extends ApiResponse {
    data: {
      settings: object;
      totals: object[];
    };
  }

class Settings {
    static getByName(name: string): any {
        const settings = store.getState().homeSlice.settings as Record<string, Array<{ name: string; value: any; type?: string }>>;
        
        // Iterate through all groups (loans, website, etc.)
        for (const groupKey in settings) {
            const groupSettings = settings[groupKey];
            
            // Check if groupSettings is an array
            if (Array.isArray(groupSettings)) {
                // Search through the array for a setting with matching name
                for (const setting of groupSettings) {
                    if (setting && setting.name === name) {
                        // Convert value based on type
                        if (setting.type === 'integer') {
                            return parseInt(setting.value, 10);
                        } else if (setting.type === 'float') {
                            return parseFloat(setting.value);
                        }
                        return setting.value;
                    }
                }
            }
        }
        
        // Return null if setting not found
        return null;
    }

    static callHomeApi(dispatch:Dispatch) {
      ApiRequest.call('api/admin/home', 'GET')
        .then((response) => {
          const apiResponse = response as HomeApiResponse;
          dispatch(updateHomeSlice({
            settings: apiResponse.data.settings,
            totals: apiResponse.data.totals,
            // permissions: apiResponse.data.response.permissions,
            // coreSettings: apiResponse.data.response.coreSettings
          }));
        });
    }

    static callUserHomeApi(dispatch:Dispatch) {
      ApiRequest.call('api/user/home', 'GET')
        .then((response) => {
          const apiResponse = response as HomeApiResponse;
          dispatch(updateHomeSlice({
            settings: apiResponse.data.settings,
            totals: apiResponse.data.totals,
            // permissions: apiResponse.data.response.permissions,
            // coreSettings: apiResponse.data.response.coreSettings
          }));
        });
    }
}

export default Settings; 