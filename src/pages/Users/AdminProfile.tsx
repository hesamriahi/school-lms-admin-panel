import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import ToastrNotification from '../../classes/ToastrNotification';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { useEffect } from 'react';
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";



export default function AdminProfile() {
  if (Permission.check(['super_admin', 'accounting']) === false) return <Navigate to={ROUTES.home} replace />;
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    name: '',
    mobile: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    ApiRequest.call('api/admin/admins/profile', 'GET').then((response) => {
      setAdmin({
        name: response.data.admin.name,
        mobile: response.data.admin.mobile,
        username: response.data.admin.username,
        password: '',
      });
    });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // we don't send password if it wasn't fill.
      const adminData = admin.password === ''
        ? { ...admin, password: undefined }
        : admin;
      
      if (admin.password !== '' && admin.password.length < 6) {
        ToastrNotification.error('رمز عبور باید بیشتر از ۶ کارکتر باشد');
        setIsSubmitting(false);
        return;
      }
      const response: ApiResponse = await ApiRequest.call('api/admin/admins/profile', 'PUT',
        adminData,
        null,
        true
      );

      if (response.success) {
        const admin = (response.data as { admin: object }).admin;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        document.cookie = `admin=${JSON.stringify(admin)}; path=/; samesite=strict; expires=${expirationDate.toUTCString()}`;
        navigate(ROUTES.home);
      } else {
        ToastrNotification.error(response.message || 'خطا در ویرایش حساب کاربری');
      }
    } catch (error) {
      ToastrNotification.error('خطا در ارسال درخواست');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta title="ویرایش حساب کاربری" />
      <PageBreadcrumb pageTitle="ویرایش حساب کاربری" />
      <ComponentCard title="اطلاعات حساب کاربری">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ردیف 1: نام (راست) | نام خانوادگی (چپ) */}
          <div>
            <Label htmlFor="admin.name">نام و نام خانوادگی</Label>
            <Input
              type="text"
              id="admin.name"
              name="admin.name"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              value={admin.name}
              onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="admin.mobile">شماره همراه</Label>
            <Input
              type="text"
              id="admin.mobile"
              name="admin.mobile"
              placeholder="شماره همراه خود را وارد کنید"
              value={admin.mobile}
              onChange={(e) => setAdmin({ ...admin, mobile: e.target.value })}
            />
          </div>


          <div>
            <Label htmlFor="admin.username">نام کاربری</Label>
            <Input
              type="text"
              id="admin.username"
              name="admin.username"
              placeholder="نام کاربری خود را وارد کنید"
              value={admin.username}
              onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="admin.password">رمز عبور</Label>
            <Input
              type="password"
              id="admin.password"
              name="admin.password"
              placeholder="رمز عبور جدید را وارد کنید"
              value={admin.password}
              onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
            />
          </div>
          
        </div>

        {/* دکمه ذخیره */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="success"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}

