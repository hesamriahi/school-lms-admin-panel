export interface User {
  id: number;
  first_name: string;
  last_name: string;
  national_code: string;
  employment_code: string;
  mobile: string;
  is_active: boolean;
  balance: number;
  debt: number;
  created_at: Date;
  updated_at: Date;
  full_name: string;
  last_loan: null | object;
}

