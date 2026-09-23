import store from "../store";

class CoreSettings {
    static getCoreSettings(featureName: string): any {
        const keys = featureName.split("."); 
    
        let current: any = store.getState().homeSlice.settings;
    
        for (const key of keys) {
            if (current[key] === undefined) {
                return false; // یا null یا هر چیزی که دوست داری
            }
            current = current[key];
        }
    
        return current;  // مقدار نهایی را برمی‌گرداند
    }


    static featureChecker(feature: string): any {
        let featureValue = this.getCoreSettings(feature);
        if (featureValue === false) return false;
        if (featureValue.isActive && featureValue.isActive === true)
            return true;
        return false;
    }
}

export default CoreSettings;