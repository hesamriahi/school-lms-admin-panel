// import store from '../store';
import Authentication from './Authentication';

export class Permission {
    static check(requiredPermissions: string[]): boolean {
        return true;
        // If "any" is in the required permissions, return true immediately
        const role = Authentication.getRole();
        if (requiredPermissions.includes('any') || (role && requiredPermissions.includes(role))) {
            return true;
        }
        return false;
        // if (Authentication.getAdmin().role == "super_admin") return true;

        
        // get the admin's permissions from the store
        // const adminPermissions: string[] = store.getState().homeSlice.settings;
        // Check if at least one requested permission exists in admin permissions, we return true if at least one permission is found
        // return requiredPermissions.some(permission =>
            // adminPermissions.includes(permission)
        // );
    }
}
